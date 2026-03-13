# FE Task Management Backlog API

## Mục tiêu

Tài liệu này mô tả đầy đủ các chức năng backlog cho module `Task management`, theo đúng nhóm nhu cầu:

- chức năng cốt lõi
- chức năng quản trị backlog
- chức năng phục vụ Scrum planning
- chức năng UX nên có
- các chức năng mở rộng trong tương lai

Tài liệu này tập trung vào:

- API contract
- FE behavior
- ưu tiên triển khai

Các API `create task` và `update task` chi tiết đã có trong:

- [fe-task-manager-api-integration.md](./fe-task-manager-api-integration.md)

## Quy ước chung

- Base path: `/task-management-service/api/v1`
- Content type: `application/json`
- Auth: bearer token hiện tại của ứng dụng
- Time format: ISO 8601 UTC
- Toàn bộ backlog operation đều hoạt động trong scope của một `project`

## 1. Functional scope

### 1.1. Chức năng cốt lõi

- Tạo issue trực tiếp trong backlog
- Sửa nhanh `title`, `description`, `priority`, `assignee`, `status`
- Kéo task vào sprint
- Gỡ task khỏi sprint để trả về backlog
- Sắp xếp thứ tự ưu tiên backlog bằng drag and drop
- Lọc theo `status`, `priority`, `assignee`, `issueType`
- Tìm kiếm theo `title`, `key`

### 1.2. Chức năng quản trị backlog

- Archive task không còn dùng
- Bulk assign assignee
- Bulk change priority
- Bulk add nhiều task vào sprint
- Bulk archive
- Group theo `priority`, `assignee`, `issueType`
- Highlight task:
  - chưa có assignee
  - chưa có estimate
  - chưa có mô tả

### 1.3. Chức năng phục vụ Scrum planning

- Chọn sprint target rồi add task từ backlog vào sprint
- Hiển thị số lượng task đã chọn
- Cảnh báo sprint quá tải nếu có estimate/story point
- Ưu tiên top backlog để phục vụ planning meeting
- Cho phép mark task là `READY_FOR_SPRINT`

### 1.4. Chức năng UX nên có

- Inline edit ngay trên hàng backlog
- Dropdown action cho từng task:
  - `Chi tiết`
  - `Đưa vào sprint`
  - `Clone`
  - `Archive`
- Quick preview task không cần mở dialog lớn
- Persist filter/sort khi chuyển tab

### 1.5. Mở rộng tương lai

- Story point / estimate
- Labels / tags
- Reporter / created by
- Due date
- Dependency giữa các task
- Activity log / change history

## 2. Data rules

### 2.1. Backlog definition

Một task được xem là backlog khi:

- `projectId` thuộc project hiện tại
- `sprintId === null`
- chưa bị archive

### 2.2. Sort rules

- Backlog mặc định sort theo `backlogOrder ASC`
- FE có thể override bằng search/filter/sort cho mục đích xem dữ liệu
- Khi quay lại chế độ planning, FE nên ưu tiên `BACKLOG_ORDER ASC`

### 2.3. Status rules

- `status` của task vẫn phải tuân theo workflow của project
- Với backlog, task không nhất thiết phải ở `TODO`, nhưng thường sẽ ưu tiên các status đầu workflow
- Nếu có `READY_FOR_SPRINT`, đây nên là business flag riêng hoặc issue label riêng, không nên thay thế workflow status hiện có nếu workflow backend chưa hỗ trợ

## 3. API map theo chức năng

## 3.1. Create issue directly in backlog

Reuse task create API.

### Request

```http
POST /task-management-service/api/v1/tasks
```

### Request body

```json
{
  "title": "Create signup flow",
  "description": "Prepare task detail for signup flow implementation.",
  "projectId": "project-uuid",
  "assigneeId": null,
  "status": "TODO",
  "priority": "MEDIUM"
}
```

### FE rule

- Task mới tạo từ backlog sẽ mặc định:
  - `sprintId = null`
  - nằm trong backlog
- Sau khi tạo thành công:
  - refetch `backlog`
  - refetch `issues`
  - refetch `kanban`

## 3.2. List backlog issues

### Request

```http
GET /task-management-service/api/v1/tasks?projectId={projectId}&page=1&size=20&sortBy=BACKLOG_ORDER&sortDirection=ASC
```

### Query params

- `projectId` - bắt buộc
- `page` - optional, default `1`
- `size` - optional, default `20`
- `search` - optional, search theo `title`, `key`
- `status` - optional
- `assigneeId` - optional
- `priority` - optional
- `issueType` - optional
- `missingAssignee` - optional, `true | false`
- `missingEstimate` - optional, `true | false`
- `missingDescription` - optional, `true | false`
- `groupBy` - optional, `NONE | PRIORITY | ASSIGNEE | ISSUE_TYPE`
- `sortBy` - optional, `BACKLOG_ORDER | UPDATED_AT | PRIORITY | TITLE`
- `sortDirection` - optional, `ASC | DESC`

### FE rule

FE chỉ hiển thị item thỏa:

- `sprintId === null`

### Response `200`

```json
{
  "items": [
    {
      "id": "task-uuid",
      "title": "Create signup flow",
      "description": "Prepare task detail for signup flow implementation.",
      "projectId": "project-uuid",
      "assignee": null,
      "status": "TODO",
      "priority": "MEDIUM",
      "issueType": "STORY",
      "sprintId": null,
      "backlogOrder": 10,
      "storyPoint": null,
      "readyForSprint": false,
      "updatedAt": "2026-03-13T02:00:00Z"
    }
  ],
  "page": 1,
  "size": 20,
  "total": 1,
  "totalPages": 1
}
```

## 3.3. Inline edit task in backlog

Reuse task update API.

### Request

```http
PUT /task-management-service/api/v1/tasks/{taskId}
```

### Editable fields

- `title`
- `description`
- `priority`
- `assigneeId`
- `status`

### FE rule

- Inline edit chỉ thay field user vừa sửa
- FE vẫn gửi full payload theo contract update task hiện tại nếu backend chưa hỗ trợ patch field-level
- `status` phải tuân theo workflow transitions

## 3.4. Reorder backlog by drag and drop

API này dùng cho:

- kéo thả
- move up/down

### Request

```http
PATCH /task-management-service/api/v1/tasks/{taskId}/backlog-order
```

### Request body

```json
{
  "projectId": "project-uuid",
  "beforeTaskId": "task-uuid-2",
  "afterTaskId": null
}
```

### FE rule

- Chỉ reorder task đang ở backlog
- Sau reorder:
  - FE có thể optimistic update
  - sau đó refetch lại backlog list

### Response `200`

```json
{
  "id": "task-uuid",
  "title": "Create signup flow",
  "description": "Prepare task detail for signup flow implementation.",
  "projectId": "project-uuid",
  "assignee": null,
  "status": "TODO",
  "priority": "MEDIUM",
  "issueType": "STORY",
  "sprintId": null,
  "backlogOrder": 20,
  "storyPoint": null,
  "readyForSprint": false,
  "updatedAt": "2026-03-13T02:15:00Z"
}
```

## 3.5. Add backlog task to sprint

### Request

```http
PATCH /task-management-service/api/v1/tasks/{taskId}/sprint
```

### Request body

```json
{
  "projectId": "project-uuid",
  "sprintId": "sprint-uuid"
}
```

### FE rule

- Task phải đang là backlog
- Sprint phải thuộc cùng project
- Sau khi thành công:
  - task biến mất khỏi backlog
  - task xuất hiện trong sprint

### Response `200`

```json
{
  "id": "task-uuid",
  "title": "Create signup flow",
  "description": "Prepare task detail for signup flow implementation.",
  "projectId": "project-uuid",
  "assignee": null,
  "status": "TODO",
  "priority": "MEDIUM",
  "issueType": "STORY",
  "sprintId": "sprint-uuid",
  "backlogOrder": 20,
  "storyPoint": 5,
  "readyForSprint": true,
  "updatedAt": "2026-03-13T02:20:00Z"
}
```

## 3.6. Remove task from sprint back to backlog

### Request

```http
PATCH /task-management-service/api/v1/tasks/{taskId}/sprint
```

### Request body

```json
{
  "projectId": "project-uuid",
  "sprintId": null
}
```

### FE rule

- Task sẽ quay lại backlog
- Backend nên tự thêm task xuống cuối backlog nếu FE không truyền vị trí cụ thể

## 3.7. Archive task

### Request

```http
POST /task-management-service/api/v1/tasks/{taskId}/archive
```

### Response `204`

Không có body.

## 3.8. Bulk update assignee

### Request

```http
PATCH /task-management-service/api/v1/tasks/bulk/assignee
```

### Request body

```json
{
  "projectId": "project-uuid",
  "taskIds": ["task-1", "task-2", "task-3"],
  "assigneeId": "user-uuid"
}
```

### Response `200`

```json
{
  "updatedCount": 3
}
```

## 3.9. Bulk update priority

### Request

```http
PATCH /task-management-service/api/v1/tasks/bulk/priority
```

### Request body

```json
{
  "projectId": "project-uuid",
  "taskIds": ["task-1", "task-2", "task-3"],
  "priority": "HIGH"
}
```

## 3.10. Bulk add tasks to sprint

### Request

```http
PATCH /task-management-service/api/v1/tasks/bulk/sprint
```

### Request body

```json
{
  "projectId": "project-uuid",
  "taskIds": ["task-1", "task-2", "task-3"],
  "sprintId": "sprint-uuid"
}
```

## 3.11. Bulk archive

### Request

```http
POST /task-management-service/api/v1/tasks/bulk/archive
```

### Request body

```json
{
  "projectId": "project-uuid",
  "taskIds": ["task-1", "task-2", "task-3"]
}
```

## 3.12. Clone task

### Request

```http
POST /task-management-service/api/v1/tasks/{taskId}/clone
```

### Request body

```json
{
  "projectId": "project-uuid"
}
```

### FE rule

- Task clone mặc định quay về backlog
- `status` có thể reset về status đầu tiên của workflow
- `sprintId` phải là `null`

## 3.13. Quick preview task detail

Nếu backend chưa có detail API riêng, FE có thể reuse:

```http
GET /task-management-service/api/v1/tasks/{taskId}
```

### Response

Chi tiết task đầy đủ để render preview panel/dialog.

## 3.14. Mark ready for sprint

Nếu team muốn support planning tốt hơn, nên có API riêng thay vì nhét vào workflow status.

### Request

```http
PATCH /task-management-service/api/v1/tasks/{taskId}/planning-state
```

### Request body

```json
{
  "projectId": "project-uuid",
  "readyForSprint": true
}
```

## 3.15. Story point / estimate

### Request

```http
PATCH /task-management-service/api/v1/tasks/{taskId}/estimate
```

### Request body

```json
{
  "projectId": "project-uuid",
  "storyPoint": 5
}
```

## 4. Suggested task payload extensions

Để support đầy đủ backlog planning, backend nên trả thêm các field sau trong task response:

```json
{
  "issueType": "TASK",
  "storyPoint": 3,
  "readyForSprint": true,
  "labels": ["frontend", "urgent"],
  "reporterId": "user-uuid",
  "dueDate": "2026-03-20T00:00:00Z",
  "hasDescription": true,
  "hasEstimate": true
}
```

## 5. Suggested error format

### Response `400/404/409`

```json
{
  "code": "TASK_INVALID_BACKLOG_OPERATION",
  "message": "Task cannot be moved because it already belongs to another sprint.",
  "details": {
    "taskId": "task-uuid"
  }
}
```

## 6. Suggested error codes

- `TASK_NOT_FOUND`
- `PROJECT_NOT_FOUND`
- `SPRINT_NOT_FOUND`
- `TASK_INVALID_BACKLOG_OPERATION`
- `TASK_REORDER_CONFLICT`
- `TASK_ARCHIVED`
- `TASK_FORBIDDEN`
- `TASK_INVALID_TRANSITION`
- `SPRINT_CAPACITY_EXCEEDED`

## 7. FE integration notes

### 7.1. Query keys

FE có thể invalidate các query sau sau khi thao tác backlog:

- `["task-project-backlog-tasks", projectId]`
- `["task-project-tasks", projectId]`
- `["task-project-kanban-tasks", projectId]`
- `["task-project-sprints", projectId]`

### 7.2. Persist filter/sort

FE nên persist:

- `search`
- `status`
- `priority`
- `assignee`
- `issueType`
- `groupBy`
- `sortBy`
- `sortDirection`

Có thể dùng query string hoặc local UI state theo project.

### 7.3. Scrum planning support

Khi add task vào sprint, backend nên trả thêm thông tin warning nếu sprint vượt capacity:

```json
{
  "taskId": "task-uuid",
  "sprintId": "sprint-uuid",
  "capacityWarning": {
    "isExceeded": true,
    "currentPoint": 32,
    "maxPoint": 25
  }
}
```

FE có thể:

- show warning toast
- vẫn cho add nếu business cho phép

## 8. Delivery order

Theo mức ưu tiên triển khai FE đã thống nhất:

1. Search + filter + sort
2. Add/remove task vào sprint
3. Backlog ordering bằng drag and drop
4. Bulk actions
5. Story point / planning support

## 9. Backend delivery recommendation

Nếu backend cần chia phase, nên implement theo thứ tự:

### Phase 1

- `GET /tasks` hỗ trợ backlog filters
- `POST /tasks`
- `PUT /tasks/{taskId}`
- `PATCH /tasks/{taskId}/sprint`
- `POST /tasks/{taskId}/archive`

### Phase 2

- `PATCH /tasks/{taskId}/backlog-order`
- `PATCH /tasks/bulk/assignee`
- `PATCH /tasks/bulk/priority`
- `PATCH /tasks/bulk/sprint`
- `POST /tasks/bulk/archive`

### Phase 3

- `POST /tasks/{taskId}/clone`
- `PATCH /tasks/{taskId}/planning-state`
- `PATCH /tasks/{taskId}/estimate`
- task payload extensions cho planning

