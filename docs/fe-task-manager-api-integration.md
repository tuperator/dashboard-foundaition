# Task Manager APIs - FE Integration Guide

Tài liệu này mô tả API cho flow **list task**, **create task** và **update task** theo đúng dữ liệu hiện tại mà FE đang dùng ở `TaskProjectDetailsPage` và `TaskDialog`.

Phạm vi tài liệu này chỉ bao gồm **task / issue list + create + update**.

Base URL (ví dụ): `https://<host>/api/v1`

## 1) Backend Delivery Order

Đây là thứ tự backend nên triển khai để FE tích hợp đúng flow hiện tại của `TaskDialog`:

1. `GET /tasks`
2. `POST /tasks`
3. `PUT /tasks/{taskId}`

Lý do:

- FE page `project details` cần list task để render `Issues`, `Backlog`, `Overview`.
- FE hiện đã có modal tạo task mới.
- FE hiện đã có modal chỉnh sửa task hiện có.
- Các flow khác như `detail`, `move sprint`, `change order` có thể tách phase sau.

## 2) Auth + Headers

- Tất cả API yêu cầu JWT `Bearer token`.
- Header response luôn có:
  - `X-Request-Id`
  - `X-Trace-Id`

Ví dụ request headers:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 3) Scope

FE hiện có các flow chính:

1. list task theo project trong `TaskProjectDetailsPage`
2. tạo task mới trong `TaskDialog`
3. cập nhật task hiện có trong `TaskDialog`

Payload FE hiện submit:

```json
{
  "title": "Thiết kế màn quản lý user",
  "description": "Task detail...",
  "projectId": "project-uuid",
  "assignee": "user-uuid-1",
  "status": "TODO",
  "priority": "MEDIUM"
}
```

Lưu ý:

- FE đang dùng label `task` và `issue` xen kẽ trong UI, nhưng payload hiện map theo entity `task`.
- Khi unassigned, FE gửi `assignee = null`.
- `status` là workflow status code của project hiện tại.
- `priority` là priority code đang active trong hệ thống.

## 4) Domain Model FE Cần

## 4.1 Task Object Response

```json
{
  "id": "task-uuid",
  "title": "Thiết kế màn quản lý user",
  "description": "Task detail...",
  "projectId": "project-uuid",
  "assignee": "user-uuid-1",
  "status": "TODO",
  "priority": "MEDIUM",
  "sprintId": null,
  "backlogOrder": 12,
  "reporterId": "String",
  "updatedAt": "2026-03-11T08:30:00Z"
}
```

FE Notes:

- FE hiện dùng `projectId`, `assignee`, `status`, `priority`, `sprintId`, `backlogOrder`, `updatedAt`.
- `assignee` có thể là `null`.
- `status` nên trả về đúng workflow status code, không phải display name.
- `priority` nên trả về đúng priority code, không phải display name.

## 5) API Details

## 5.1 List Tasks In Project

`GET /task-management-service/api/v1/tasks`

Query params:

- `projectId` - required
- `page` - optional, default `1`
- `size` - optional, default `20`
- `search` - optional, search theo `title`, `description`
- `status` - optional, workflow status code
- `assigneeId` - optional
- `priority` - optional, ví dụ `LOW | MEDIUM | HIGH`
- `sprintId` - optional, filter task trong sprint cụ thể
- `sortBy` - optional, `UPDATED_AT | PRIORITY | BACKLOG_ORDER`
- `sortDirection` - optional, `ASC | DESC`

Ví dụ:

```http
GET /task-management-service/api/v1/tasks?projectId=project-uuid&page=1&size=200&sortBy=UPDATED_AT&sortDirection=DESC
```

Response `200`:

```json
{
  "items": [
    {
      "id": "task-uuid",
      "title": "Thiết kế màn quản lý user",
      "description": "Task detail...",
      "projectId": "project-uuid",
      "assignee": "user-uuid-1",
      "status": "TODO",
      "priority": "MEDIUM",
      "sprintId": null,
      "backlogOrder": 12,
      "reporterId": "String",
      "updatedAt": "2026-03-11T08:30:00Z"
    }
  ],
  "page": 1,
  "size": 200,
  "total": 1,
  "totalPages": 1
}
```

FE Notes:

- `TaskProjectDetailsIssuesTab` hiện cần đủ `title`, `description`, `assignee`, `status`, `priority`, `sprintId`, `backlogOrder`, `updatedAt`.
- `TaskProjectDetailsBacklogTab` dùng `sprintId` và `backlogOrder`.
- `TaskProjectDetailsOverviewTab` dùng list này để tính `total`, `done`, `inProgress`.
- FE hiện đang load toàn bộ task của project rồi filter/sort ở client side.

rules: 
- user request api phải thuộc owner hoặc member của project

## 5.2 Create Task

`POST /task-management-service/api/v1/tasks`

Request body:

```json
{
  "title": "Thiết kế màn quản lý user",
  "description": "Task detail...",
  "projectId": "project-uuid",
  "assigneeId": "user-uuid-1 | NULL",
  "status": "TODO",
  "priority": "MEDIUM"
}
```

Khi FE chọn `Unassigned`: `assigneeId = null`.

Validation đề xuất:
- `title`: required, not blank, max `255`
- `description`: optional, max `4000`
- `projectId`: required, uuid hợp lệ
- `assigneeId`: optional, nếu có phải thuộc cùng project/company và active
- `status`: required, phải thuộc workflow hiện tại của project
- `priority`: required, phải tồn tại trong task priority catalog hiện tại, Hiện tại chưa có phần API này nên cứ cho default là `MEDIUM` | `HIGH` | `LOW`, chỗ này nên validate ở domain layer
- `reporterId`: là user đang request

Rule đề xuất:

- Backend không nên bắt FE gửi `companyId`, `createdById`, `reporterId` nếu có thể suy ra từ JWT/context.
- Nếu `status` không được gửi, backend có thể fallback về status đầu tiên của workflow, nhưng FE hiện đang luôn gửi.
- Nếu `priority` không được gửi, backend nên reject thay vì tự đoán.
- Người report là owner của project hoặc là members trong project 
- Task mới nên mặc định có `sprintId = null`.
- `backlogOrder` nên do backend tự tính | phần này blacklog chửa build nên tạm thời là 0.

Response `201`:

- trả về `Task Object Response`

## 5.3 Update Task

`PUT /task-management-service/api/v1/tasks/{taskId}`

Request body:

```json
{
  "title": "Thiết kế màn quản lý user",
  "description": "Task detail updated",
  "projectId": "project-uuid",
  "assigneeId": "user-uuid-2",
  "status": "IN_PROGRESS",
  "priority": "HIGH"
}
```

Validation đề xuất:

- `title`: required, not blank, max `255`
- `description`: optional, max `4000`
- `projectId`: required, uuid hợp lệ
- `assigneeId`: optional, nếu có phải thuộc cùng project/company và active
- `status`: required, phải thuộc workflow hiện tại của project
- `priority`: required, phải tồn tại trong task priority catalog hiện tại

Rule đề xuất:

- Nếu backend không cho đổi `projectId` sau khi tạo, nên reject rõ bằng business error.
- Nếu workflow của project không chứa `status` FE gửi lên, backend phải reject.
- Nếu `assigneeId = null`, backend phải unassign task.
- Backend nên update `updatedAt` mỗi lần sửa.

Response `200`:

- trả về `Task Object Response`

## 6) Error Response Format

Tất cả error trả về dạng:

```json
{
  "timestamp": "2026-03-11T08:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "path": "/api/v1/tasks",
  "method": "POST",
  "requestId": "uuid",
  "traceId": "uuid",
  "details": [
    {
      "field": "title",
      "reason": "must not be blank",
      "rejectedValue": ""
    }
  ]
}
```

## 7) Error Codes FE Cần Handle

- `TOKEN_INVALID` (`401`)
- `TOKEN_EXPIRED` (`401`)
- `TOKEN_NOT_YET_VALID` (`401`)
- `FORBIDDEN` (`403`)
- `PROJECT_NOT_FOUND` (`404`)
- `TASK_NOT_FOUND` (`404`)
- `TASK_ASSIGNEE_INVALID` (`400`)
- `TASK_STATUS_INVALID` (`400`)
- `TASK_PRIORITY_INVALID` (`400`)
- `TASK_PROJECT_CHANGE_FORBIDDEN` (`403`)
- `TASK_LIST_FORBIDDEN` (`403`)
- `VALIDATION_ERROR` (`400`)
- `REQUEST_BODY_INVALID` (`400`)
- `BAD_REQUEST` (`400`)
- `INTERNAL_SERVER_ERROR` (`500`)

## 8) Mapping Lỗi Theo Endpoint

`POST /tasks`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `403`: `FORBIDDEN`
- `404`: `PROJECT_NOT_FOUND`
- `400`: `TASK_ASSIGNEE_INVALID|TASK_STATUS_INVALID|TASK_PRIORITY_INVALID|VALIDATION_ERROR|REQUEST_BODY_INVALID`

`GET /tasks`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `403`: `TASK_LIST_FORBIDDEN|FORBIDDEN`
- `404`: `PROJECT_NOT_FOUND`
- `400`: `VALIDATION_ERROR|REQUEST_BODY_INVALID`

`PUT /tasks/{taskId}`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `403`: `TASK_PROJECT_CHANGE_FORBIDDEN|FORBIDDEN`
- `404`: `TASK_NOT_FOUND|PROJECT_NOT_FOUND`
- `400`: `TASK_ASSIGNEE_INVALID|TASK_STATUS_INVALID|TASK_PRIORITY_INVALID|VALIDATION_ERROR|REQUEST_BODY_INVALID`

## 9) FE Notes

- FE current `TaskDialog` chỉ bắt buộc `title` và `projectId`.
- FE current `TaskProjectDetailsPage` dùng `GET /tasks` để hydrate `Issues`, `Backlog`, `Overview`.
- FE hiện luôn gửi `status` và `priority`.
- FE đang dùng `assignee` field name trong state nội bộ, nhưng backend request nên chuẩn hóa thành `assigneeId`.
- FE chưa gửi `reporterId`, `createdById`, `estimate`, `labels`, `dueDate`.
- Nếu backend muốn bắt thêm field ngoài scope trên, FE dialog cần đổi trước khi tích hợp.
