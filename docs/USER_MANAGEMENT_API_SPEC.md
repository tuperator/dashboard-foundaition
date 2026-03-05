# User Management API Spec (Draft)

## 1) Domain Notes
- Data source dựa trên bảng `account`, `role` bạn cung cấp.
- Vì nghiệp vụ yêu cầu **1 user có nhiều roles**, backend nên có bảng mapping:

```sql
create table public.account_role (
  account_id uuid not null references public.account(id) on delete cascade,
  role_id uuid not null references public.role(id) on delete cascade,
  created_at timestamp default current_timestamp not null,
  primary key (account_id, role_id)
);
```

## 2) Enums
- `status`: `WORKING | ONLEAVE | RESIGNED`
- `gender`: `MALE | FEMALE | OTHER`

## 3) Common Envelope
```json
{
  "timestamp": "2026-03-05T12:00:00.000Z",
  "status": 200,
  "code": "SUCCESS_CODE",
  "message": "Human message (backend)",
  "path": "/api/v1/...",
  "method": "GET",
  "requestId": "uuid",
  "traceId": "uuid",
  "data": {}
}
```

## 4) APIs

### 4.1 List Users
`GET /api/v1/users`

Query params:
- `page` (default `1`)
- `size` (default `15`)
- `search` (username/email/phone)
- `status` (`WORKING|ONLEAVE|RESIGNED`)
- `roleId` (uuid)
- `twoFactorEnabled` (`true|false`)

Response `data`:
```json
{
  "items": [
    {
      "id": "uuid",
      "username": "Nguyen Van A",
      "email": "user@company.com",
      "phone": "0909xxxxxx",
      "address": "HCM",
      "companyId": "uuid",
      "branchId": "uuid",
      "status": "WORKING",
      "gender": "MALE",
      "joinedAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2026-03-05T08:30:00Z",
      "avatar": null,
      "twoFactorEnabled": true,
      "roles": [
        { "id": "uuid", "roleName": "OPER_ADMIN" },
        { "id": "uuid", "roleName": "TEAM_LEAD" }
      ]
    }
  ],
  "page": 1,
  "size": 15,
  "total": 380,
  "totalPages": 26
}
```

### 4.2 Get User Detail
`GET /api/v1/users/{accountId}`

Response `data`: giống item user ở API list, có thể thêm:
- `createdAt`
- `updatedAt`
- `picId`
- `type`

### 4.3 Update Profile
`PUT /api/v1/users/{accountId}/profile`

Request body:
```json
{
  "username": "Nguyen Van A",
  "email": "operadmin1.1@gmail.com",
  "phone": "0909123123",
  "address": "Q.1, TP.HCM",
  "gender": "MALE",
  "status": "WORKING",
  "roleIds": ["uuid-role-1", "uuid-role-2"],
  "twoFactorEnabled": true
}
```

Notes:
- Email unique toàn hệ thống.
- Phone unique theo `(phone, company_id)`.
- `roleIds` update theo kiểu replace (xóa role cũ, insert role mới trong transaction).

### 4.4 Update Password
`PUT /api/v1/users/{accountId}/password`

Request body:
```json
{
  "newPassword": "string-min-8"
}
```

Validation:
- Tối thiểu 8 ký tự.
- Khuyến nghị thêm policy: hoa, thường, số, ký tự đặc biệt.

### 4.5 Change Status
`PATCH /api/v1/users/{accountId}/status`

Request body:
```json
{
  "status": "ONLEAVE"
}
```

### 4.6 Delete User (soft delete recommended)
`DELETE /api/v1/users/{accountId}`

Khuyến nghị:
- Thay vì hard delete `account`, nên set `status=RESIGNED` + revoke session.

### 4.7 List Roles
`GET /api/v1/roles`

Response `data`:
```json
[
  { "id": "uuid", "roleName": "OPER_ADMIN" },
  { "id": "uuid", "roleName": "HR_MANAGER" }
]
```

## 5) Error Codes (suggested)
- `USER_NOT_FOUND`
- `USER_EMAIL_ALREADY_EXISTS`
- `USER_PHONE_ALREADY_EXISTS`
- `USER_ROLE_INVALID`
- `USER_PASSWORD_POLICY_INVALID`
- `USER_FORBIDDEN`
