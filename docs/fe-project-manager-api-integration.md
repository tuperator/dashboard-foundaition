# Project Manager APIs - FE Integration Guide

Tài liệu này mô tả các API cho module **Project / Workspace management** trong `task-management`.

Phạm vi tài liệu này chỉ bao gồm **project**. API `get users by company` không lặp lại ở đây vì đã có spec riêng và FE đã dùng để chọn `owner` / `members`.

Base URL (ví dụ): `https://<host>/api/v1`

## 1) Backend Delivery Order

Đây là thứ tự backend nên triển khai để FE có thể tích hợp dần theo đúng flow màn hình:

1. `GET /projects`
2. `POST /projects`
3. `GET /projects/{projectId}`
4. `PUT /projects/{projectId}`
5. `DELETE /projects/{projectId}`
6. `PUT /projects/{projectId}/members`
7. `PATCH /projects/{projectId}/members/{userId}/role`

Lý do:

- FE page `workspace/project list` cần `list` trước.
- FE modal `create project` cần `create` ngay sau `list`.
- FE page `project details` và `project settings` cần `detail`.
- FE chỉnh sửa info project cần `update`.
- FE xóa project cần `delete`.
- FE settings quản lý member theo kiểu thay thế toàn bộ danh sách member cần `replace members`.
- FE đổi role từng member cần API riêng để update nhanh, không phải submit lại toàn bộ project.

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

## 3) Domain Model FE Cần

## 3.1 Project Object Response

```json
{
  "id": "uuid",
  "name": "ERP Core Platform",
  "key": "ERP",
  "description": "Core workspace for enterprise operations modules.",
  "type": "SCRUM",
  "owner": {
    "id": "user-uuid",
    "username": "Nguyen Van A",
    "email": "operadmin1.1@gmail.com",
    "status": "WORKING"
  },
  "members": [
    {
      "userId": "user-uuid-1",
      "role": "OWNER",
      "joinedAt": "2026-03-10T02:30:00Z",
      "user": {
        "id": "user-uuid-1",
        "username": "Nguyen Van A",
        "email": "operadmin1.1@gmail.com",
        "status": "WORKING"
      }
    },
    {
      "userId": "user-uuid-2",
      "role": "ADMIN",
      "joinedAt": "2026-03-10T02:35:00Z",
      "user": {
        "id": "user-uuid-2",
        "username": "Tran Thi B",
        "email": "manager@company.com",
        "status": "WORKING"
      }
    }
  ],
  "workflowId": "workflow-uuid",
  "stats": {
    "totalIssues": 42,
    "doneIssues": 18,
    "inProgressIssues": 7,
    "completionRate": 42,
    "updatedAt": "2026-03-10T03:00:00Z"
  },
  "createdAt": "2026-03-01T08:00:00Z",
  "updatedAt": "2026-03-10T03:00:00Z"
}
```

Lưu ý:

- `key` unique trong phạm vi company, FE dùng để hiển thị badge và search.
- `type` hiện FE hỗ trợ: `SCRUM | KANBAN`.
- `owner.id` là id thật của user, không phải name string.
- `members` phải trả cả `userId` và thông tin user tối thiểu để FE render label ngay, tránh phải gọi thêm API user.
- `stats` nên được aggregate sẵn để FE render list page mà không cần gọi thêm API task.
- `workflowId` để FE điều hướng và hiển thị workflow đang gắn cho project.

## 3.2 Project Member Role Values

```text
OWNER
ADMIN
MEMBER
VIEWER
```

Rule đề xuất:

- Mỗi project luôn phải có đúng 1 `OWNER`.
- `owner.id` phải trùng với member có `role = OWNER`.
- `members` không nên chứa duplicate `userId`.

## 4) API Details

## 4.1 List Projects In My Company

`GET /api/v1/projects`

Query params:

- `page` - optional, default `1`
- `size` - optional, default `20`
- `search` - optional, search theo `name`, `key`
- `type` - optional, `SCRUM | KANBAN`
- `ownerId` - optional
- `sortBy` - optional, `UPDATED_AT | NAME | PROGRESS`
- `sortDirection` - optional, `ASC | DESC`

Ví dụ:

```http
GET /api/v1/projects?page=1&size=20&search=erp&type=SCRUM&sortBy=UPDATED_AT&sortDirection=DESC
```

Response `200`:

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "ERP Core Platform",
      "key": "ERP",
      "description": "Core workspace for enterprise operations modules.",
      "type": "SCRUM",
      "owner": {
        "id": "user-uuid",
        "username": "Nguyen Van A",
        "email": "operadmin1.1@gmail.com",
        "status": "WORKING"
      },
      "memberCount": 6,
      "workflowId": "workflow-uuid",
      "stats": {
        "totalIssues": 42,
        "doneIssues": 18,
        "inProgressIssues": 7,
        "completionRate": 42,
        "updatedAt": "2026-03-10T03:00:00Z"
      },
      "createdAt": "2026-03-01T08:00:00Z",
      "updatedAt": "2026-03-10T03:00:00Z"
    }
  ],
  "page": 1,
  "size": 20,
  "total": 1,
  "totalPages": 1
}
```

FE Notes:

- List page hiện cần `owner`, `memberCount`, `stats.totalIssues`, `stats.doneIssues`, `stats.inProgressIssues`, `stats.updatedAt`.
- Nếu backend chưa support filter/sort đầy đủ, tối thiểu phải support `page`, `size`, `search`, `type`, `ownerId`.

## 4.2 Create Project

`POST /api/v1/projects`

Request body:

```json
{
  "name": "ERP Core Platform",
  "key": "ERP",
  "description": "Core workspace for enterprise operations modules.",
  "type": "SCRUM",
  "ownerId": "user-uuid-1",
  "memberIds": [
    "user-uuid-2",
    "user-uuid-3"
  ],
  "workflowId": "workflow-uuid"
}
```

Validation đề xuất:

- `name`: required, not blank, max `255`
- `key`: required, not blank, uppercase, max `50`, unique theo company
- `description`: optional, max `2000`
- `type`: required, `SCRUM | KANBAN`
- `ownerId`: required, phải thuộc cùng company, status hợp lệ
- `memberIds`: optional, unique
- `memberIds` không được chứa `ownerId` (backend có thể tự remove nếu gửi lên)
- `workflowId`: optional, nếu null thì backend gán workflow mặc định

Response `201`:

- trả về `Project Object Response`

## 4.3 Get Project Detail

`GET /api/v1/projects/{projectId}`

Rule:

- User phải thuộc company sở hữu project.
- Nếu có project-level permission thì backend áp dụng tại đây.

Response `200`:

- trả về `Project Object Response`

FE Notes:

- Detail page cần full `members`, `role`, `workflowId`, `stats`.
- Không cần nhúng task/backlog/sprint vào API này; các phần đó nên có API riêng ở phase sau.

## 4.4 Update Project Info

`PUT /api/v1/projects/{projectId}`

Request body:

```json
{
  "name": "ERP Core Platform",
  "key": "ERP",
  "description": "Updated description",
  "type": "SCRUM",
  "ownerId": "user-uuid-1",
  "workflowId": "workflow-uuid"
}
```

Rule:

- Chỉ `OWNER` hoặc `ADMIN` của project được update.
- API này chỉ update metadata project, không update member list.

Response `200`:

- trả về `Project Object Response`

## 4.5 Delete Project

`DELETE /api/v1/projects/{projectId}`

Rule:

- Chỉ `OWNER` hoặc role quản trị cấp cao của company mới được xóa.
- Nếu project đã có issue/sprint/backlog, backend nên define policy rõ:
  - soft delete, hoặc
  - cấm xóa nếu còn dữ liệu active.

Response `200` hoặc `204`:

```json
{
  "deleted": true,
  "projectId": "uuid",
  "deletedAt": "2026-03-10T03:20:00Z"
}
```

## 4.6 Replace Project Members

`PUT /api/v1/projects/{projectId}/members`

Mục tiêu API này là đồng bộ toàn bộ danh sách member theo state hiện tại của FE.

Request body:

```json
{
  "ownerId": "user-uuid-1",
  "memberIds": [
    "user-uuid-2",
    "user-uuid-3",
    "user-uuid-4"
  ]
}
```

Rule:

- `ownerId` bắt buộc.
- `memberIds` là danh sách member không bao gồm owner.
- Backend nên xử lý replace semantics:
  - thêm user mới
  - gỡ user không còn trong danh sách
  - giữ lại `OWNER`
- Nếu user đang bị remove nhưng còn assigned issue/sprint ownership, backend cần define policy rõ:
  - auto unassign, hoặc
  - block bằng business error.

Response `200`:

```json
{
  "projectId": "uuid",
  "owner": {
    "id": "user-uuid-1",
    "username": "Nguyen Van A",
    "email": "operadmin1.1@gmail.com",
    "status": "WORKING"
  },
  "members": [
    {
      "userId": "user-uuid-1",
      "role": "OWNER",
      "joinedAt": "2026-03-10T02:30:00Z",
      "user": {
        "id": "user-uuid-1",
        "username": "Nguyen Van A",
        "email": "operadmin1.1@gmail.com",
        "status": "WORKING"
      }
    },
    {
      "userId": "user-uuid-2",
      "role": "ADMIN",
      "joinedAt": "2026-03-10T02:35:00Z",
      "user": {
        "id": "user-uuid-2",
        "username": "Tran Thi B",
        "email": "manager@company.com",
        "status": "WORKING"
      }
    }
  ],
  "updatedAt": "2026-03-10T03:25:00Z"
}
```

## 4.7 Update Project Member Role

`PATCH /api/v1/projects/{projectId}/members/{userId}/role`

Request body:

```json
{
  "role": "ADMIN"
}
```

Rule:

- Chỉ `OWNER` hoặc `ADMIN` mới được update role.
- Không cho hạ role của `OWNER` qua API này; nếu đổi owner thì dùng `PUT /projects/{id}` hoặc `PUT /projects/{id}/members` với `ownerId` mới.

Response `200`:

```json
{
  "projectId": "uuid",
  "userId": "user-uuid-2",
  "role": "ADMIN",
  "updatedAt": "2026-03-10T03:30:00Z"
}
```

## 5) Error Response Format

Tất cả error trả về dạng:

```json
{
  "timestamp": "2026-03-10T03:30:00Z",
  "status": 409,
  "error": "Conflict",
  "code": "PROJECT_KEY_ALREADY_EXISTS",
  "message": "Project key already exists",
  "path": "/api/v1/projects",
  "method": "POST",
  "requestId": "8c2ed8f8-406c-4f0d-9c24-e48cf8d93e0a",
  "traceId": "8c2ed8f8-406c-4f0d-9c24-e48cf8d93e0a",
  "details": [
    {
      "field": "key",
      "reason": "already exists",
      "rejectedValue": "ERP"
    }
  ]
}
```

## 6) Error Codes FE Cần Handle

- `TOKEN_INVALID` (`401`)
- `TOKEN_EXPIRED` (`401`)
- `TOKEN_NOT_YET_VALID` (`401`)
- `FORBIDDEN` (`403`)
- `PROJECT_NOT_FOUND` (`404`)
- `PROJECT_KEY_ALREADY_EXISTS` (`409`)
- `PROJECT_OWNER_INVALID` (`400`)
- `PROJECT_MEMBER_INVALID` (`400`)
- `PROJECT_MEMBER_DUPLICATED` (`400`)
- `PROJECT_MEMBER_ROLE_INVALID` (`400`)
- `PROJECT_DELETE_FORBIDDEN` (`403`)
- `PROJECT_UPDATE_FORBIDDEN` (`403`)
- `PROJECT_MEMBER_UPDATE_FORBIDDEN` (`403`)
- `PROJECT_HAS_ACTIVE_DATA` (`409`) - nếu backend chặn xóa project còn issue/sprint active
- `VALIDATION_ERROR` (`400`)
- `REQUEST_BODY_INVALID` (`400`)
- `BAD_REQUEST` (`400`)
- `INTERNAL_SERVER_ERROR` (`500`)

## 7) Mapping Lỗi Theo Endpoint (Quick View)

`GET /projects`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `403`: `FORBIDDEN`
- `400`: `BAD_REQUEST|VALIDATION_ERROR`

`POST /projects`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `403`: `PROJECT_UPDATE_FORBIDDEN|FORBIDDEN`
- `409`: `PROJECT_KEY_ALREADY_EXISTS`
- `400`: `PROJECT_OWNER_INVALID|PROJECT_MEMBER_INVALID|PROJECT_MEMBER_DUPLICATED|VALIDATION_ERROR|REQUEST_BODY_INVALID`

`GET /projects/{projectId}`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `403`: `FORBIDDEN`
- `404`: `PROJECT_NOT_FOUND`

`PUT /projects/{projectId}`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `403`: `PROJECT_UPDATE_FORBIDDEN|FORBIDDEN`
- `404`: `PROJECT_NOT_FOUND`
- `409`: `PROJECT_KEY_ALREADY_EXISTS`
- `400`: `PROJECT_OWNER_INVALID|VALIDATION_ERROR|REQUEST_BODY_INVALID`

`DELETE /projects/{projectId}`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `403`: `PROJECT_DELETE_FORBIDDEN|FORBIDDEN`
- `404`: `PROJECT_NOT_FOUND`
- `409`: `PROJECT_HAS_ACTIVE_DATA`

`PUT /projects/{projectId}/members`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `403`: `PROJECT_MEMBER_UPDATE_FORBIDDEN|FORBIDDEN`
- `404`: `PROJECT_NOT_FOUND`
- `400`: `PROJECT_OWNER_INVALID|PROJECT_MEMBER_INVALID|PROJECT_MEMBER_DUPLICATED|VALIDATION_ERROR`

`PATCH /projects/{projectId}/members/{userId}/role`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `403`: `PROJECT_MEMBER_UPDATE_FORBIDDEN|FORBIDDEN`
- `404`: `PROJECT_NOT_FOUND`
- `400`: `PROJECT_MEMBER_ROLE_INVALID|VALIDATION_ERROR`

## 8) FE Notes (để backend align)

- FE hiện đã chuyển `owner` và `members` sang semantics là `userId`.
- FE cần `owner` object và `members[].user` object để render label ngay, không muốn tự join thêm từ API user.
- FE page list cần `stats` aggregate sẵn.
- FE settings page đang thao tác member theo `replace semantics`, backend nên support đúng để tránh lệch state.
- FE ưu tiên handle theo `code`, không phụ thuộc `message` text.
