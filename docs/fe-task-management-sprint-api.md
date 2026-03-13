# Task Management Sprint APIs - FE Integration Guide

Tài liệu này mô tả API cho flow sprint hiện FE đang dùng trong `TaskProjectDetailsSprintsTab` và `SprintDialog`.

Phạm vi:

- list sprint
- create sprint
- update sprint
- change sprint status
- archive sprint

Base URL (ví dụ): `https://<host>/api/v1`

## 1) Backend Delivery Order

1. `GET /sprints`
2. `POST /sprints`
3. `PUT /sprints/{sprintId}`
4. `PATCH /sprints/{sprintId}/status`
5. `POST /sprints/{sprintId}/archive`

## 2) Auth + Headers

- tất cả API yêu cầu JWT `Bearer token`
- response nên trả:
  - `X-Request-Id`
  - `X-Trace-Id`

Ví dụ:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 3) FE Scope

FE hiện có các flow:

1. render list sprint theo project
2. tạo sprint mới trong `SprintDialog`
3. sửa sprint hiện có trong `SprintDialog`
4. đổi trạng thái sprint `PLANNED -> ACTIVE -> CLOSED`
5. lưu trữ sprint

## 4) Sprint Object Response

```json
{
  "id": "sprintId",
  "projectId": "projectId",
  "name": "Sprint 03",
  "goal": "Ship onboarding flow",
  "startDate": "2026-03-10",
  "endDate": "2026-03-24",
  "status": "PLANNED",
  "createdAt": "2026-03-09T08:00:00Z"
}
```

FE notes:

- `status` hiện dùng `PLANNED | ACTIVE | CLOSED`
- `goal` có thể rỗng
- `startDate`, `endDate` hiện FE dùng format `YYYY-MM-DD`

## 5) API Details

## 5.1 List Sprints

`GET /task-management-service/api/v1/sprints`

Query params:

- `projectId` - required
- `page` - optional, default `1`
- `size` - optional, default `20`
- `status` - optional, `PLANNED | ACTIVE | CLOSED`
- `sortBy` - optional, `CREATED_AT | START_DATE | END_DATE`
- `sortDirection` - optional, `ASC | DESC`

Ví dụ:

```http
GET /task-management-service/api/v1/sprints?projectId=project-uuid&page=1&size=100&sortBy=START_DATE&sortDirection=DESC
```

Response `200`:

```json
{
  "items": [
    {
      "id": "sprintId",
      "projectId": "projectId",
      "name": "Sprint 03",
      "goal": "Ship onboarding flow",
      "startDate": "2026-03-10",
      "endDate": "2026-03-24",
      "status": "PLANNED",
      "createdAt": "2026-03-09T08:00:00Z"
    }
  ],
  "page": 1,
  "size": 100,
  "total": 1,
  "totalPages": 1
}
```

## 5.2 Create Sprint

`POST /task-management-service/api/v1/sprints`

Request body:

```json
{
  "projectId": "projectId",
  "name": "Sprint 03",
  "goal": "Ship onboarding flow",
  "startDate": "2026-03-10",
  "endDate": "2026-03-24"
}
```

Validation đề xuất:

- `projectId`: required, uuid hợp lệ
- `name`: required, not blank, max `255`
- `goal`: optional, max `4000`
- `startDate`: required
- `endDate`: required
- `endDate >= startDate`

Rule đề xuất:

- user request phải là owner hoặc member của project
- sprint mới nên mặc định `status = PLANNED`
- mỗi project chỉ nên có tối đa 1 sprint `ACTIVE`

Response `201`:

- trả về `Sprint Object Response`

## 5.3 Update Sprint

`PUT /task-management-service/api/v1/sprints/{sprintId}`

Request body:

```json
{
  "name": "Sprint 03 - Updated",
  "goal": "Updated sprint goal",
  "startDate": "2026-03-11",
  "endDate": "2026-03-25"
}
```

Validation đề xuất:

- `name`: required, not blank, max `255`
- `goal`: optional, max `4000`
- `startDate`: required
- `endDate`: required
- `endDate >= startDate`

Rule đề xuất:

- nếu sprint đã `CLOSED`, backend có thể reject update theo business rule nếu cần
- backend nên update `updatedAt` nếu domain có field này

Response `200`:

- trả về `Sprint Object Response`

## 5.4 Change Sprint Status

`PATCH /task-management-service/api/v1/sprints/{sprintId}/status`

Request body:

```json
{
  "status": "ACTIVE"
}
```

Giá trị hợp lệ:

- `PLANNED`
- `ACTIVE`
- `CLOSED`

Rule đề xuất:

- chỉ cho phép 1 sprint `ACTIVE` trong cùng project tại một thời điểm
- khi chuyển `ACTIVE -> CLOSED`, backend có thể tự xử lý issue chưa done theo business rule
- nếu chuyển status không hợp lệ, backend nên trả business error rõ ràng

Response `200`:

- trả về `Sprint Object Response`

## 5.5 Archive Sprint

`POST /task-management-service/api/v1/sprints/{sprintId}/archive`

Request body:

- không cần body

Rule đề xuất:

- đây là soft-delete / archive
- sprint đã archive không nên còn xuất hiện trong list mặc định
- nếu sprint đang `ACTIVE`, backend nên reject hoặc tự đóng sprint trước theo rule đã thống nhất

Response đề xuất:

- `200 OK` hoặc `204 No Content`

Ví dụ response `200`:

```json
{
  "id": "sprint-uuid",
  "archived": true
}
```

## 6) Error Response Format

```json
{
  "timestamp": "2026-03-11T08:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "path": "/api/v1/sprints",
  "method": "POST",
  "requestId": "uuid",
  "traceId": "uuid",
  "details": [
    {
      "field": "name",
      "reason": "must not be blank",
      "rejectedValue": ""
    }
  ]
}
```

## 7) Error Codes FE Cần Handle

- `TOKEN_INVALID` (`401`)
- `TOKEN_EXPIRED` (`401`)
- `VALIDATION_ERROR` (`400`)
- `SPRINT_STATUS_INVALID` (`400`)
- `SPRINT_ACTIVE_CONFLICT` (`409`)
- `SPRINT_NOT_FOUND` (`404`)
- `SPRINT_ARCHIVED` (`409`)
