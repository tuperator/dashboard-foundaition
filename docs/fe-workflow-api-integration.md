# Workflow Manager APIs - FE Integration Guide

Tài liệu này mô tả các API cho module **Workflow management** trong `task-management`.

Phạm vi tài liệu này chỉ bao gồm:

- workflow template
- status
- transition
- project assignment

Base URL (ví dụ): `https://<host>/api/v1`

## 1) Backend Delivery Order

Đây là thứ tự backend nên triển khai để FE có thể tích hợp dần đúng với UI hiện tại:

1. `GET /workflows`
2. `POST /workflows`
3. `GET /workflows/{workflowId}`
4. `PUT /workflows/{workflowId}`
5. `DELETE /workflows/{workflowId}`
6. `POST /workflows/{workflowId}/statuses`
7. `PUT /workflows/{workflowId}/statuses/{statusId}`
8. `DELETE /workflows/{workflowId}/statuses/{statusId}`
9. `POST /workflows/{workflowId}/transitions`
10. `DELETE /workflows/{workflowId}/transitions/{transitionId}`
11. `PUT /workflows/{workflowId}/projects`

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

## 3.1 Workflow Object

```json
{
  "id": "workflow-uuid",
  "name": "Standard software workflow",
  "description": "Flow chuẩn cho project sản phẩm theo Agile/Scrum.",
  "createdById": "user-uuid",
  "companyId": "company-uuid",
  "issueTypes": [
    "TASK",
    "BUG",
    "STORY"
  ],
  "statuses": [
    {
      "id": "status-uuid-1",
      "code": "TODO",
      "name": "To do",
      "color": "#6B7280",
      "category": "TODO"
    },
    {
      "id": "status-uuid-2",
      "code": "IN_PROGRESS",
      "name": "In progress",
      "color": "#3B82F6",
      "category": "IN_PROGRESS"
    },
    {
      "id": "status-uuid-3",
      "code": "DONE",
      "name": "Done",
      "color": "#10B981",
      "category": "DONE"
    }
  ],
  "transitions": [
    {
      "id": "transition-uuid-1",
      "fromStatusCode": "TODO",
      "toStatusCode": "IN_PROGRESS"
    },
    {
      "id": "transition-uuid-2",
      "fromStatusCode": "IN_PROGRESS",
      "toStatusCode": "DONE"
    }
  ],
  "assignedProjects": [
    {
      "id": "project-uuid-1",
      "name": "ERP Core Platform",
      "key": "ERP"
    }
  ],
  "createdAt": "2026-03-01T08:00:00Z",
  "updatedAt": "2026-03-10T03:45:00Z"
}
```

Lưu ý:

- `issueTypes` hiện FE hỗ trợ: `TASK | BUG | STORY | EPIC`.
- `status.code` là business key, FE dùng để map issue status.
- `status.color` là màu hiển thị trực tiếp trên board, badge, select.
- `status.category` hiện FE hỗ trợ: `TODO | IN_PROGRESS | DONE`.
- `transitions` là rule cho phép chuyển trạng thái.
- `createdById` là id account tạo workflow.
- `companyId` là id công ty sở hữu workflow, backend nên lấy theo tenant hiện tại thay vì cho FE truyền tự do.

## 3.2 Workflow Rules Backend Nên Enforce

- `status.code` unique trong từng workflow.
- Không cho transition `fromStatusCode == toStatusCode`.
- Không cho transition tới status không tồn tại trong workflow.
- Mỗi workflow nên có tối thiểu 2 statuses.
- Nếu workflow đang được gắn cho project hoặc đang được task sử dụng, backend nên **block** thao tác xóa workflow hoặc xóa status nếu có nguy cơ làm mất trạng thái nghiệp vụ.

## 4) API Details

## 4.1 List Workflow Templates

`GET /api/v1/workflows`

Query params:

- `page` - optional, default `1`
- `size` - optional, default `20`
- `search` - optional, search theo `name`
- `issueType` - optional
- `projectId` - optional
- `sortBy` - optional, `UPDATED_AT | NAME | CREATED_AT`
- `sortDirection` - optional, `ASC | DESC`

Response `200`:

```json
{
  "items": [
    {
      "id": "workflow-uuid",
      "name": "Standard software workflow",
      "description": "Flow chuẩn cho project sản phẩm theo Agile/Scrum.",
      "createdById": "user-uuid",
      "companyId": "company-uuid",
      "issueTypes": ["TASK", "BUG", "STORY"],
      "statusCount": 6,
      "transitionCount": 7,
      "assignedProjectCount": 2,
      "assignedProjects": [
        {
          "id": "project-uuid-1",
          "name": "ERP Core Platform",
          "key": "ERP"
        }
      ],
      "createdAt": "2026-03-01T08:00:00Z",
      "updatedAt": "2026-03-10T03:45:00Z"
    }
  ],
  "page": 1,
  "size": 20,
  "total": 1,
  "totalPages": 1
}
```

## 4.2 Create Workflow Template

`POST /api/v1/workflows`

Request body:

```json
{
  "name": "Standard software workflow",
  "description": "Flow chuẩn cho project sản phẩm theo Agile/Scrum.",
  "createdById": "user-uuid",
  "companyId": "company-uuid",
  "issueTypes": [
    "TASK",
    "BUG",
    "STORY"
  ]
}
```

Validation đề xuất:

- `name`: required, not blank, max `255`
- `description`: optional, max `1000`
- `createdById`: required, uuid hợp lệ
- `companyId`: required, uuid hợp lệ
- `issueTypes`: optional, nếu null backend default `[TASK, BUG, STORY]`
- `issueTypes` phải unique

Rule đề xuất:

- `createdById` phải khớp với user hiện tại hoặc backend có thể bỏ qua giá trị FE gửi lên và dùng user từ JWT.
- `companyId` phải khớp với company context hiện tại hoặc backend có thể bỏ qua giá trị FE gửi lên và dùng company từ tenant context.

Response `201`:

- trả về trực tiếp `Workflow Object`

## 4.3 Get Workflow Detail

`GET /api/v1/workflows/{workflowId}`

Response `200`:

- trả về trực tiếp `Workflow Object`

## 4.4 Update Workflow Metadata

`PUT /api/v1/workflows/{workflowId}`

Request body:

```json
{
  "name": "Standard software workflow",
  "description": "Updated description",
  "issueTypes": [
    "TASK",
    "BUG",
    "STORY",
    "EPIC"
  ]
}
```

Response `200`:

- trả về trực tiếp `Workflow Object`

## 4.5 Delete Workflow Template

`DELETE /api/v1/workflows/{workflowId}`

Rule:

- Không cho xóa workflow cuối cùng của hệ thống/company.
- Nếu workflow đang gắn với project hoặc đang được task sử dụng, backend nên block bằng business error rõ ràng.

Response `200` hoặc `204`:

- nếu `200`: trả về body success tối giản hoặc object xác nhận xóa
- nếu `204`: không có body

## 4.6 Create Workflow Status

`POST /api/v1/workflows/{workflowId}/statuses`

Request body:

```json
{
  "code": "REVIEW",
  "name": "Review",
  "color": "#8B5CF6",
  "category": "IN_PROGRESS"
}
```

Validation đề xuất:

- `code`: required, uppercase, unique trong workflow, max `100`
- `name`: required, not blank, max `255`
- `color`: required, hex color hợp lệ
- `category`: required, `TODO | IN_PROGRESS | DONE`

Response `201`:

- trả về trực tiếp object status vừa tạo

## 4.7 Update Workflow Status

`PUT /api/v1/workflows/{workflowId}/statuses/{statusId}`

Request body:

```json
{
  "code": "REVIEW",
  "name": "Review",
  "color": "#8B5CF6",
  "category": "IN_PROGRESS"
}
```

Response `200`:

- trả về trực tiếp object status sau khi update

## 4.8 Delete Workflow Status

`DELETE /api/v1/workflows/{workflowId}/statuses/{statusId}`

Rule:

- Không cho xóa nếu status đang được task sử dụng.
- Không cho xóa nếu sau khi xóa workflow còn ít hơn 2 statuses.

Response `200` hoặc `204`:

- nếu `200`: trả về body success tối giản hoặc object xác nhận xóa
- nếu `204`: không có body

## 4.9 Create Workflow Transition

`POST /api/v1/workflows/{workflowId}/transitions`

Request body:

```json
{
  "fromStatusCode": "TODO",
  "toStatusCode": "IN_PROGRESS"
}
```

Validation đề xuất:

- `fromStatusCode`: required
- `toStatusCode`: required
- không cho trùng route đã tồn tại
- không cho `fromStatusCode == toStatusCode`

Response `201`:

- trả về trực tiếp object transition vừa tạo

## 4.10 Delete Workflow Transition

`DELETE /api/v1/workflows/{workflowId}/transitions/{transitionId}`

Response `200` hoặc `204`:

- nếu `200`: trả về body success tối giản hoặc object xác nhận xóa
- nếu `204`: không có body

## 4.11 Assign Workflow To Projects

`PUT /api/v1/workflows/{workflowId}/projects`

Request body:

```json
{
  "projectIds": [
    "project-uuid-1",
    "project-uuid-2"
  ]
}
```

Semantics:

- Đây là API **replace assignment**.
- Tức là danh sách `projectIds` gửi lên sẽ trở thành danh sách project cuối cùng đang gắn với workflow này.
- Project bị bỏ khỏi list sẽ bị unassign khỏi workflow hiện tại.

Response `200`:

- trả về trực tiếp workflow sau khi cập nhật assignment hoặc object summary:

```json
{
  "workflowId": "workflow-uuid",
  "assignedProjectIds": [
    "project-uuid-1",
    "project-uuid-2"
  ]
}
```

## 5) Error Response Format

Tất cả error trả về dạng:

```json
{
  "timestamp": "2026-03-10T09:10:00Z",
  "status": 409,
  "error": "Conflict",
  "code": "WORKFLOW_STATUS_CODE_ALREADY_EXISTS",
  "message": "Status code already exists",
  "path": "/api/v1/workflows/{workflowId}/statuses",
  "method": "POST",
  "requestId": "8c2ed8f8-406c-4f0d-9c24-e48cf8d93e0a",
  "traceId": "8c2ed8f8-406c-4f0d-9c24-e48cf8d93e0a",
  "details": [
    {
      "field": "code",
      "reason": "already exists",
      "rejectedValue": "TODO"
    }
  ]
}
```

## 6) Error Codes FE Cần Handle

- `TOKEN_INVALID` (`401`)
- `TOKEN_EXPIRED` (`401`)
- `TOKEN_NOT_YET_VALID` (`401`)
- `FORBIDDEN` (`403`)
- `WORKFLOW_NOT_FOUND` (`404`)
- `WORKFLOW_NAME_ALREADY_EXISTS` (`409`)
- `WORKFLOW_DELETE_FORBIDDEN` (`409`)
- `WORKFLOW_LAST_TEMPLATE_DELETE_FORBIDDEN` (`409`)
- `WORKFLOW_STATUS_NOT_FOUND` (`404`)
- `WORKFLOW_STATUS_CODE_ALREADY_EXISTS` (`409`)
- `WORKFLOW_STATUS_DELETE_FORBIDDEN` (`409`)
- `WORKFLOW_TRANSITION_NOT_FOUND` (`404`)
- `WORKFLOW_TRANSITION_ALREADY_EXISTS` (`409`)
- `WORKFLOW_PROJECT_ASSIGNMENT_INVALID` (`400`)
- `VALIDATION_ERROR` (`400`)
- `REQUEST_BODY_INVALID` (`400`)
- `BAD_REQUEST` (`400`)
- `INTERNAL_SERVER_ERROR` (`500`)

## 7) FE Notes

- FE hiện cần `issueTypes`, `statuses`, `transitions`, `assignedProjects` để render đầy đủ màn workflow manager.
- FE ưu tiên xử lý lỗi theo `code`, không phụ thuộc `message` text từ backend.
- Với API assignment, backend cần giữ semantics là **replace** để tránh FE bỏ chọn project nhưng backend vẫn giữ assignment cũ.
