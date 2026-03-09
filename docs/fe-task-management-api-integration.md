# Task Management APIs - FE Integration Guide

Tài liệu này mô tả các API cho module **Quản lý công việc (Task Management)**, bao gồm:

- **Projects** – CRUD dự án, quản lý member & role
- **Tasks** – CRUD task, assign, đổi status/priority, sắp xếp backlog
- **Sprints** – CRUD sprint, start/close sprint
- **Workflow Templates** – CRUD workflow, gán workflow cho project
- **Workflow Statuses & Transitions** – quản lý trạng thái và luồng chuyển đổi
- **Task Priorities** – quản lý mức độ ưu tiên (customizable)

Base URL (ví dụ): `https://<host>/api/v1`

---

## 1) Auth + Headers

- Tất cả API yêu cầu JWT `Bearer token`.
- Header response luôn có:
  - `X-Request-Id`
  - `X-Trace-Id`

Ví dụ request headers:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 2) Object Responses

### 2.1 Project Object

```json
{
  "id": "uuid",
  "name": "ERP Core Platform",
  "key": "ERP",
  "description": "Nền tảng lõi cho quản lý vận hành doanh nghiệp.",
  "owner": "Toan Le",
  "members": ["Toan Le", "Linh Tran", "Minh Nguyen"],
  "type": "SCRUM",
  "createdAt": "2026-03-01T08:00:00Z",
  "updatedAt": "2026-03-09T08:00:00Z"
}
```

Lưu ý:

- `type` enum: `SCRUM` | `KANBAN`.
- `key` unique toàn company – viết HOA, dùng làm prefix cho task code (ví dụ `ERP-123`).
- `members` là danh sách tên thành viên (sẽ chuyển sang user ID khi có auth).

### 2.2 Member Role Object

```json
{
  "memberName": "Toan Le",
  "role": "OWNER"
}
```

- `role` enum: `OWNER` | `ADMIN` | `MEMBER` | `VIEWER`.

### 2.3 Task Object

```json
{
  "id": "uuid",
  "title": "Thiết kế authentication flow",
  "description": "Xác định login/refresh/logout và mapping permission.",
  "projectId": "uuid",
  "assignee": "Toan Le",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "sprintId": "uuid",
  "backlogOrder": 3,
  "updatedAt": "2026-03-09T01:20:00Z",
  "createdAt": "2026-03-01T08:00:00Z"
}
```

Lưu ý:

- `assignee` có thể `null` (chưa assign).
- `sprintId` có thể `null` (nằm ở backlog).
- `status` phải nằm trong danh sách status của workflow được gán cho project.
- `priority` phải nằm trong danh sách priority configuration.
- `backlogOrder` dùng để sắp xếp task trong backlog (số nhỏ = ưu tiên cao hơn).

### 2.4 Sprint Object

```json
{
  "id": "uuid",
  "projectId": "uuid",
  "name": "Sprint 01",
  "goal": "Deliver core authentication and dashboard baseline.",
  "startDate": "2026-03-01",
  "endDate": "2026-03-14",
  "status": "ACTIVE",
  "createdAt": "2026-02-28T08:00:00Z"
}
```

- `status` enum: `PLANNED` | `ACTIVE` | `CLOSED`.

### 2.5 Workflow Template Object

```json
{
  "id": "uuid",
  "name": "Standard software workflow",
  "description": "Flow chuẩn cho project sản phẩm theo Agile/Scrum.",
  "statuses": [
    {
      "id": "uuid",
      "code": "TODO",
      "name": "To do",
      "color": "#6B7280",
      "category": "TODO"
    },
    {
      "id": "uuid",
      "code": "IN_PROGRESS",
      "name": "In progress",
      "color": "#3B82F6",
      "category": "IN_PROGRESS"
    }
  ],
  "transitions": [
    {
      "id": "uuid",
      "fromStatusCode": "TODO",
      "toStatusCode": "IN_PROGRESS"
    }
  ],
  "issueTypes": ["TASK", "BUG", "STORY"],
  "createdAt": "2026-03-01T08:00:00Z",
  "updatedAt": "2026-03-09T08:00:00Z"
}
```

Lưu ý:

- `statuses[].category` enum: `TODO` | `IN_PROGRESS` | `DONE`.
- `statuses[].code` uppercase, `_` thay space (e.g. `IN_PROGRESS`).
- `issueTypes[]` enum: `TASK` | `BUG` | `STORY` | `EPIC`.

### 2.6 Task Priority Object

```json
{
  "id": "uuid",
  "code": "HIGH",
  "name": "High",
  "color": "#EF4444",
  "order": 3
}
```

- `order` dùng để sắp xếp thứ tự hiển thị (nhỏ → thấp, lớn → cao).

---

## 3) API Details – Projects

### 3.1 List Projects

`GET /api/v1/task-management/projects`

Rule:

- User phải thuộc company hiện tại.
- Trả về tất cả projects mà user có quyền xem (theo role membership).

Response `200`:

```json
{
  "data": [Project Object, ...],
  "total": 2
}
```

### 3.2 Get Project Detail

`GET /api/v1/task-management/projects/{projectId}`

Response `200`:

- Trả về `Project Object`.

### 3.3 Create Project

`POST /api/v1/task-management/projects`

Request body:

```json
{
  "name": "ERP Core Platform",
  "key": "ERP",
  "description": "Nền tảng lõi cho quản lý vận hành doanh nghiệp.",
  "owner": "Toan Le",
  "members": ["Toan Le", "Linh Tran"],
  "type": "SCRUM"
}
```

Validation đề xuất:

- `name`: required, not blank, max `255`.
- `key`: required, uppercase, max `10`, unique trong company, regex `^[A-Z][A-Z0-9_]*$`.
- `description`: optional, text.
- `owner`: required, not blank.
- `type`: required, enum `SCRUM | KANBAN`.
- `members`: optional, array of string.

Response `201`:

- Trả về `Project Object` vừa tạo.
- Backend tự gán workflow template mặc định cho project mới.
- Owner tự động nhận role `OWNER` trong `memberRolesByProject`.

### 3.4 Update Project

`PUT /api/v1/task-management/projects/{projectId}`

Request body: tương tự Create (đầy đủ fields).

Rule:

- Chỉ role `OWNER` hoặc `ADMIN` của project được cập nhật.
- Nếu đổi `type` từ `SCRUM` → `KANBAN`: backend cần xoá sprints của project và unassign tất cả task khỏi sprint (`sprintId = null`).

Response `200`:

- Trả về `Project Object` đã cập nhật.

### 3.5 Delete Project

`DELETE /api/v1/task-management/projects/{projectId}`

Rule:

- Chỉ role `OWNER` được xoá.
- Backend cần xoá cascade: tasks, sprints, workflowIdByProject mapping, memberRolesByProject.

Response `204`: No content.

---

## 4) API Details – Project Members

### 4.1 Add Member

`POST /api/v1/task-management/projects/{projectId}/members`

Request body:

```json
{
  "memberName": "An Vo"
}
```

Validation:

- `memberName`: required, not blank.
- Trùng member đã có: trả lỗi hoặc bỏ qua (FE cần handle).

Rule:

- Chỉ role `OWNER` hoặc `ADMIN` được thêm.
- Member mới nhận role mặc định `MEMBER`.

Response `200`:

- Trả về updated `Project Object`.

### 4.2 Remove Member

`DELETE /api/v1/task-management/projects/{projectId}/members/{memberName}`

Rule:

- Không thể xoá `OWNER`.
- Chỉ `OWNER` hoặc `ADMIN` được xoá member.
- Backend cần unassign tất cả task đang assign cho member bị xoá (`assignee = null`).

Response `204`: No content.

### 4.3 Update Member Role

`PUT /api/v1/task-management/projects/{projectId}/members/{memberName}/role`

Request body:

```json
{
  "role": "ADMIN"
}
```

- `role` enum: `OWNER` | `ADMIN` | `MEMBER` | `VIEWER`.

Rule:

- Chỉ `OWNER` được đổi role member khác.
- Không thể đổi role của `OWNER` (trừ chuyển ownership – scope riêng).

Response `200`:

- Trả về `Member Role Object` đã cập nhật.

---

## 5) API Details – Tasks

### 5.1 List Tasks by Project

`GET /api/v1/task-management/projects/{projectId}/tasks`

Query params (optional):

- `sprintId` – lọc theo sprint (null = backlog).
- `status` – lọc theo status code.
- `priority` – lọc theo priority code.
- `assignee` – lọc theo assignee.

Response `200`:

```json
{
  "data": [Task Object, ...],
  "total": 5
}
```

### 5.2 Get Task Detail

`GET /api/v1/task-management/tasks/{taskId}`

Response `200`:

- Trả về `Task Object`.

### 5.3 Create Task

`POST /api/v1/task-management/projects/{projectId}/tasks`

Request body:

```json
{
  "title": "Thiết kế authentication flow",
  "description": "Xác định login/refresh/logout và mapping permission.",
  "projectId": "uuid",
  "assignee": "Toan Le",
  "status": "TODO",
  "priority": "HIGH",
  "sprintId": "uuid"
}
```

Validation đề xuất:

- `title`: required, not blank, max `500`.
- `description`: optional, text.
- `assignee`: optional, phải là member của project.
- `status`: required, phải nằm trong workflow statuses của project.
- `priority`: required, phải nằm trong danh sách task priorities.
- `sprintId`: optional, nếu có phải là sprint thuộc project và chưa `CLOSED`.

Rule:

- Backend tự sinh `backlogOrder` (= max backlogOrder + 1 cho project đó).
- Backend normalize `status` code theo workflow (uppercase, _ thay space).

Response `201`:

- Trả về `Task Object` vừa tạo.

### 5.4 Update Task

`PUT /api/v1/task-management/tasks/{taskId}`

Request body: tương tự Create.

Response `200`:

- Trả về `Task Object` đã cập nhật.

### 5.5 Delete Task

`DELETE /api/v1/task-management/tasks/{taskId}`

Response `204`: No content.

### 5.6 Assign Task

`PATCH /api/v1/task-management/tasks/{taskId}/assignee`

Request body:

```json
{
  "assignee": "Toan Le"
}
```

- `assignee` có thể `null` để unassign.
- Nếu có giá trị, phải là member của project.

Response `200`:

- Trả về `Task Object` đã cập nhật.

### 5.7 Change Task Status

`PATCH /api/v1/task-management/tasks/{taskId}/status`

Request body:

```json
{
  "status": "IN_PROGRESS"
}
```

Rule:

- Backend kiểm tra workflow transitions: `fromStatusCode` (status hiện tại) → `toStatusCode` (status mới) phải tồn tại trong workflow template.
- Nếu transition không hợp lệ: trả lỗi `WORKFLOW_TRANSITION_NOT_ALLOWED`.

Response `200`:

- Trả về `Task Object` đã cập nhật.

### 5.8 Change Task Priority

`PATCH /api/v1/task-management/tasks/{taskId}/priority`

Request body:

```json
{
  "priority": "HIGH"
}
```

- `priority` phải tồn tại trong danh sách task priorities.

Response `200`:

- Trả về `Task Object` đã cập nhật.

### 5.9 Move Backlog Task Order

`PATCH /api/v1/task-management/tasks/{taskId}/backlog-order`

Request body:

```json
{
  "direction": "up"
}
```

- `direction` enum: `up` | `down`.
- Chỉ áp dụng cho task nằm trong backlog (`sprintId = null`).

Response `200`:

- Trả về danh sách các task đã thay đổi order.

### 5.10 Add Task to Sprint

`PATCH /api/v1/task-management/tasks/{taskId}/sprint`

Request body:

```json
{
  "sprintId": "uuid"
}
```

Rule:

- Sprint phải thuộc cùng project.
- Sprint không được ở trạng thái `CLOSED`.

Response `200`:

- Trả về `Task Object` đã cập nhật.

### 5.11 Remove Task from Sprint

`DELETE /api/v1/task-management/tasks/{taskId}/sprint`

Rule:

- Task sẽ trở về backlog (`sprintId = null`).
- Backend tự sinh `backlogOrder` mới.

Response `200`:

- Trả về `Task Object` đã cập nhật.

---

## 6) API Details – Sprints

### 6.1 List Sprints by Project

`GET /api/v1/task-management/projects/{projectId}/sprints`

Rule:

- Chỉ áp dụng cho project type `SCRUM`.

Response `200`:

```json
{
  "data": [Sprint Object, ...],
  "total": 2
}
```

### 6.2 Create Sprint

`POST /api/v1/task-management/projects/{projectId}/sprints`

Request body:

```json
{
  "projectId": "uuid",
  "name": "Sprint 01",
  "goal": "Deliver core authentication and dashboard baseline.",
  "startDate": "2026-03-01",
  "endDate": "2026-03-14"
}
```

Validation đề xuất:

- `name`: required, not blank, max `255`.
- `goal`: optional, text.
- `startDate`: required, format `YYYY-MM-DD`.
- `endDate`: required, format `YYYY-MM-DD`, phải sau `startDate`.

Rule:

- Status khởi tạo luôn là `PLANNED`.
- Chỉ áp dụng cho project type `SCRUM`.

Response `201`:

- Trả về `Sprint Object` vừa tạo.

### 6.3 Update Sprint

`PUT /api/v1/task-management/sprints/{sprintId}`

Request body:

```json
{
  "name": "Sprint 01",
  "goal": "Updated goal.",
  "startDate": "2026-03-01",
  "endDate": "2026-03-14"
}
```

Response `200`:

- Trả về `Sprint Object` đã cập nhật.

### 6.4 Start Sprint

`PATCH /api/v1/task-management/sprints/{sprintId}/start`

Rule:

- Sprint phải đang ở trạng thái `PLANNED`.
- Mỗi project chỉ có 1 sprint `ACTIVE` tại một thời điểm.
- Nếu đã có sprint `ACTIVE` khác: chuyển sprint cũ về `PLANNED`.

Response `200`:

- Trả về `Sprint Object` đã cập nhật.

### 6.5 Close Sprint

`PATCH /api/v1/task-management/sprints/{sprintId}/close`

Rule:

- Sprint phải đang ở trạng thái `ACTIVE` hoặc `PLANNED` (nhưng không được `CLOSED`).
- Các task chưa `DONE` trong sprint sẽ được chuyển về backlog (`sprintId = null`).
- Các task `DONE` giữ nguyên `sprintId` (lưu history).

Response `200`:

- Trả về `Sprint Object` đã cập nhật.

---

## 7) API Details – Workflow Templates

### 7.1 List Workflow Templates

`GET /api/v1/task-management/workflows`

Response `200`:

```json
{
  "data": [Workflow Template Object, ...],
  "total": 2
}
```

### 7.2 Get Workflow Template Detail

`GET /api/v1/task-management/workflows/{workflowId}`

Response `200`:

- Trả về `Workflow Template Object`.

### 7.3 Create Workflow Template

`POST /api/v1/task-management/workflows`

Request body:

```json
{
  "name": "Custom workflow",
  "description": "Luồng tùy chỉnh.",
  "issueTypes": ["TASK", "BUG"]
}
```

Validation đề xuất:

- `name`: required, not blank, max `255`.
- `description`: optional, text.
- `issueTypes`: optional, array of enum `TASK | BUG | STORY | EPIC`.

Rule:

- Backend tự khởi tạo default statuses (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`) và default transitions.

Response `201`:

- Trả về `Workflow Template Object` vừa tạo.

### 7.4 Update Workflow Template

`PUT /api/v1/task-management/workflows/{workflowId}`

Request body:

```json
{
  "name": "Updated workflow name",
  "description": "Updated description.",
  "issueTypes": ["TASK", "BUG", "STORY"]
}
```

Response `200`:

- Trả về `Workflow Template Object` đã cập nhật.

### 7.5 Delete Workflow Template

`DELETE /api/v1/task-management/workflows/{workflowId}`

Rule:

- Không thể xoá nếu chỉ còn 1 workflow template duy nhất.
- Các project đang dùng workflow bị xoá sẽ được đổi sang workflow template đầu tiên còn lại.
- Các task đang có status không tồn tại trong workflow mới sẽ được fallback về status đầu tiên.

Response `204`: No content.

### 7.6 Assign Workflow to Projects

`PUT /api/v1/task-management/workflows/{workflowId}/assign`

Request body:

```json
{
  "projectIds": ["uuid-1", "uuid-2"]
}
```

Rule:

- Gán workflow cho từng project.
- Các task đang có status không tồn tại trong workflow mới sẽ được fallback về status đầu tiên.

Response `200`:

```json
{
  "workflowId": "uuid",
  "assignedProjectIds": ["uuid-1", "uuid-2"]
}
```

---

## 8) API Details – Workflow Statuses

### 8.1 Add Status to Workflow

`POST /api/v1/task-management/workflows/{workflowId}/statuses`

Request body:

```json
{
  "code": "TESTING",
  "name": "Testing",
  "color": "#F59E0B",
  "category": "IN_PROGRESS"
}
```

Validation đề xuất:

- `code`: required, uppercase, `_` thay space, max `50`, unique trong workflow.
- `name`: required, max `100`.
- `color`: required, format hex `#RRGGBB`.
- `category`: required, enum `TODO | IN_PROGRESS | DONE`.

Response `201`:

- Trả về `Workflow Template Object` đã cập nhật.

### 8.2 Update Status in Workflow

`PUT /api/v1/task-management/workflows/{workflowId}/statuses/{statusId}`

Request body: tương tự Create.

Rule:

- Nếu đổi `code`, backend cần cập nhật:
  - Tất cả transitions liên quan đến status code cũ.
  - Tất cả tasks đang dùng status code cũ (thuộc project có workflow này).

Response `200`:

- Trả về `Workflow Template Object` đã cập nhật.

### 8.3 Delete Status from Workflow

`DELETE /api/v1/task-management/workflows/{workflowId}/statuses/{statusId}`

Rule:

- Không thể xoá nếu workflow chỉ còn ≤ 2 statuses.
- Xoá tất cả transitions liên quan đến status bị xoá.
- Task đang dùng status bị xoá: fallback về status đầu tiên còn lại.

Response `204`: No content.

---

## 9) API Details – Workflow Transitions

### 9.1 Add Transition

`POST /api/v1/task-management/workflows/{workflowId}/transitions`

Request body:

```json
{
  "fromStatusCode": "TODO",
  "toStatusCode": "IN_PROGRESS"
}
```

Validation:

- `fromStatusCode` và `toStatusCode` phải tồn tại trong workflow.
- Không cho phép `fromStatusCode == toStatusCode`.
- Duplicate transition: trả lỗi hoặc bỏ qua.

Response `201`:

- Trả về `Workflow Template Object` đã cập nhật.

### 9.2 Delete Transition

`DELETE /api/v1/task-management/workflows/{workflowId}/transitions/{transitionId}`

Response `204`: No content.

---

## 10) API Details – Task Priorities

### 10.1 List Task Priorities

`GET /api/v1/task-management/priorities`

Response `200`:

```json
{
  "data": [Task Priority Object, ...],
  "total": 3
}
```

### 10.2 Create Task Priority

`POST /api/v1/task-management/priorities`

Request body:

```json
{
  "code": "CRITICAL",
  "name": "Critical",
  "color": "#DC2626",
  "order": 4
}
```

Validation đề xuất:

- `code`: required, uppercase, max `50`, unique.
- `name`: required, max `100`.
- `color`: required, hex `#RRGGBB`.
- `order`: required, integer ≥ 1.

Response `201`:

- Trả về `Task Priority Object` vừa tạo.

### 10.3 Update Task Priority

`PUT /api/v1/task-management/priorities/{priorityId}`

Request body: tương tự Create.

Rule:

- Nếu đổi `code`, backend cần cập nhật tất cả task đang dùng priority code cũ sang code mới.

Response `200`:

- Trả về `Task Priority Object` đã cập nhật.

### 10.4 Delete Task Priority

`DELETE /api/v1/task-management/priorities/{priorityId}`

Rule:

- Không thể xoá nếu chỉ còn 1 priority duy nhất.
- Task đang dùng priority bị xoá: fallback sang priority `MEDIUM` (hoặc priority đầu tiên còn lại).

Response `204`: No content.

---

## 11) Error Response Format

Tất cả error trả về dạng:

```json
{
  "timestamp": "2026-03-09T09:10:00Z",
  "status": 403,
  "error": "Forbidden",
  "code": "PROJECT_UPDATE_FORBIDDEN",
  "message": "Only OWNER or ADMIN can update this project",
  "path": "/api/v1/task-management/projects/uuid",
  "method": "PUT",
  "requestId": "uuid",
  "traceId": "uuid",
  "details": [
    {
      "field": "key",
      "reason": "already exists",
      "rejectedValue": "ERP"
    }
  ]
}
```

---

## 12) Error Codes FE Cần Handle

### Auth chung

- `TOKEN_INVALID` (`401`)
- `TOKEN_EXPIRED` (`401`)
- `TOKEN_NOT_YET_VALID` (`401`)
- `FORBIDDEN` (`403`) – bị chặn bởi security policy

### Project

- `PROJECT_NOT_FOUND` (`404`)
- `PROJECT_KEY_ALREADY_EXISTS` (`409`) – trùng `key`
- `PROJECT_UPDATE_FORBIDDEN` (`403`) – không có role `OWNER | ADMIN`
- `PROJECT_DELETE_FORBIDDEN` (`403`) – không phải `OWNER`

### Member

- `MEMBER_ALREADY_EXISTS` (`409`)
- `MEMBER_NOT_FOUND` (`404`)
- `CANNOT_REMOVE_OWNER` (`400`)
- `MEMBER_ROLE_UPDATE_FORBIDDEN` (`403`)

### Task

- `TASK_NOT_FOUND` (`404`)
- `TASK_ASSIGNEE_NOT_MEMBER` (`400`) – assignee không phải member của project
- `WORKFLOW_TRANSITION_NOT_ALLOWED` (`400`) – transition không hợp lệ theo workflow
- `TASK_SPRINT_CLOSED` (`400`) – sprint đã `CLOSED`, không thể add task

### Sprint

- `SPRINT_NOT_FOUND` (`404`)
- `SPRINT_ALREADY_CLOSED` (`400`) – sprint đã `CLOSED`
- `SPRINT_PROJECT_TYPE_INVALID` (`400`) – project type không phải `SCRUM`

### Workflow

- `WORKFLOW_NOT_FOUND` (`404`)
- `WORKFLOW_DELETE_LAST` (`400`) – không thể xoá workflow duy nhất
- `WORKFLOW_STATUS_CODE_DUPLICATE` (`409`) – trùng status code trong workflow
- `WORKFLOW_STATUS_MIN_COUNT` (`400`) – workflow phải có ≥ 2 statuses
- `WORKFLOW_TRANSITION_SELF` (`400`) – `fromStatusCode == toStatusCode`
- `WORKFLOW_TRANSITION_DUPLICATE` (`409`)

### Priority

- `PRIORITY_NOT_FOUND` (`404`)
- `PRIORITY_CODE_DUPLICATE` (`409`) – trùng code
- `PRIORITY_DELETE_LAST` (`400`) – không thể xoá priority duy nhất

### Chung

- `VALIDATION_ERROR` (`400`) – sai format body
- `REQUEST_BODY_INVALID` (`400`) – JSON sai format
- `BAD_REQUEST` (`400`) – dữ liệu không hợp lệ
- `INTERNAL_SERVER_ERROR` (`500`)

---

## 13) Mapping Lỗi Theo Endpoint (Quick View)

### Projects

| Endpoint | 400 | 401 | 403 | 404 | 409 |
|---|---|---|---|---|---|
| `GET /projects` | | `TOKEN_*` | `FORBIDDEN` | | |
| `GET /projects/{id}` | | `TOKEN_*` | `FORBIDDEN` | `PROJECT_NOT_FOUND` | |
| `POST /projects` | `VALIDATION_ERROR` | `TOKEN_*` | `FORBIDDEN` | | `PROJECT_KEY_ALREADY_EXISTS` |
| `PUT /projects/{id}` | `VALIDATION_ERROR` | `TOKEN_*` | `PROJECT_UPDATE_FORBIDDEN` | `PROJECT_NOT_FOUND` | `PROJECT_KEY_ALREADY_EXISTS` |
| `DELETE /projects/{id}` | | `TOKEN_*` | `PROJECT_DELETE_FORBIDDEN` | `PROJECT_NOT_FOUND` | |

### Tasks

| Endpoint | 400 | 401 | 403 | 404 |
|---|---|---|---|---|
| `GET /projects/{id}/tasks` | | `TOKEN_*` | `FORBIDDEN` | `PROJECT_NOT_FOUND` |
| `POST /projects/{id}/tasks` | `VALIDATION_ERROR`, `TASK_ASSIGNEE_NOT_MEMBER` | `TOKEN_*` | `FORBIDDEN` | `PROJECT_NOT_FOUND` |
| `PUT /tasks/{id}` | `VALIDATION_ERROR` | `TOKEN_*` | `FORBIDDEN` | `TASK_NOT_FOUND` |
| `DELETE /tasks/{id}` | | `TOKEN_*` | `FORBIDDEN` | `TASK_NOT_FOUND` |
| `PATCH /tasks/{id}/status` | `WORKFLOW_TRANSITION_NOT_ALLOWED` | `TOKEN_*` | `FORBIDDEN` | `TASK_NOT_FOUND` |
| `PATCH /tasks/{id}/sprint` | `TASK_SPRINT_CLOSED` | `TOKEN_*` | `FORBIDDEN` | `TASK_NOT_FOUND` |

### Sprints

| Endpoint | 400 | 401 | 403 | 404 |
|---|---|---|---|---|
| `POST /projects/{id}/sprints` | `VALIDATION_ERROR`, `SPRINT_PROJECT_TYPE_INVALID` | `TOKEN_*` | `FORBIDDEN` | `PROJECT_NOT_FOUND` |
| `PATCH /sprints/{id}/start` | `SPRINT_ALREADY_CLOSED` | `TOKEN_*` | `FORBIDDEN` | `SPRINT_NOT_FOUND` |
| `PATCH /sprints/{id}/close` | `SPRINT_ALREADY_CLOSED` | `TOKEN_*` | `FORBIDDEN` | `SPRINT_NOT_FOUND` |

### Workflows

| Endpoint | 400 | 401 | 404 | 409 |
|---|---|---|---|---|
| `POST /workflows` | `VALIDATION_ERROR` | `TOKEN_*` | | |
| `DELETE /workflows/{id}` | `WORKFLOW_DELETE_LAST` | `TOKEN_*` | `WORKFLOW_NOT_FOUND` | |
| `POST /workflows/{id}/statuses` | `VALIDATION_ERROR` | `TOKEN_*` | `WORKFLOW_NOT_FOUND` | `WORKFLOW_STATUS_CODE_DUPLICATE` |
| `DELETE /workflows/{id}/statuses/{sId}` | `WORKFLOW_STATUS_MIN_COUNT` | `TOKEN_*` | `WORKFLOW_NOT_FOUND` | |
| `POST /workflows/{id}/transitions` | `WORKFLOW_TRANSITION_SELF` | `TOKEN_*` | `WORKFLOW_NOT_FOUND` | `WORKFLOW_TRANSITION_DUPLICATE` |

---

## 14) FE Notes (để backend align)

- FE hiện tại dùng **localStorage** để mock data. Tất cả operations sẽ chuyển sang REST API khi backend sẵn sàng.
- FE đang hiển thị và thao tác với các fields:
  - **Project**: `name`, `key`, `description`, `owner`, `members`, `type`.
  - **Task**: `title`, `description`, `assignee`, `status`, `priority`, `sprintId`, `backlogOrder`.
  - **Sprint**: `name`, `goal`, `startDate`, `endDate`, `status`.
  - **Workflow**: `name`, `description`, `statuses[]`, `transitions[]`, `issueTypes[]`.
  - **Priority**: `code`, `name`, `color`, `order`.
- FE cần `createdAt`, `updatedAt` trên tất cả entity để hiển thị metadata.
- FE ưu tiên thông điệp lỗi theo `code`, không phụ thuộc `message` text từ backend.
- FE kiểm tra **workflow transitions** trước khi gọi API change status (optimistic check) – nhưng backend vẫn phải validate lại.
- Khi gán workflow mới cho project, FE expect backend tự fallback task status sang status đầu tiên nếu status hiện tại không hợp lệ.
- FE cần API trả về `memberRolesByProject` (hoặc nested trong project response) để render role badge và phân quyền UI.
