# Company Profile APIs - FE Integration Guide

Tài liệu này mô tả các API cho màn hình **quản lý hồ sơ công ty**:

- `GET my company profile`
- `PUT update my company profile`

Base URL (ví dụ): `https://<host>/api/v1`

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

## 2) Company Object Response

Mapping theo bảng `public.company`:

```json
{
  "id": "uuid",
  "name": "Tuperator Enterprises LTD.",
  "phone": "02838990001",
  "email": "hello@tuperator.vn",
  "businessRegisterAddress": "55 Pasteur, District 1, Ho Chi Minh City",
  "taxCode": "0312345678",
  "headquartersAddress": "21 Nguyen Thi Minh Khai, District 1, Ho Chi Minh City",
  "websiteLink": "https://tuperator.vn",
  "brand": "Tuperator",
  "companyCode": "TPR-ERP",
  "market": "SaaS / Enterprise Operations",
  "createdAt": "2025-02-05T02:30:00Z",
  "updatedAt": "2026-03-08T08:10:00Z"
}
```

Lưu ý:

- `name` bắt buộc.
- Các field còn lại có thể `null`.
- `companyCode` unique toàn hệ thống (theo DB constraint `unique_company_code_per_company`).

## 3) API Details

## 3.1 Get My Company Profile

`GET /api/v1/companies/me`

Rule:

- User chỉ cần đăng nhập hợp lệ.
- Backend lấy `company_id` từ JWT/session user hiện tại.
- Nếu account không gắn company hoặc company không tồn tại: trả lỗi `COMPANY_PROFILE_NOT_FOUND`.

Ví dụ:

```http
GET /api/v1/companies/me
```

Response `200`:

- trả về `Company Object Response`.

## 3.2 Update My Company Profile

`PUT /api/v1/companies/me`

Rule:

- Chỉ role `OPER_ADMIN` hoặc `OPER_MANAGER` được cập nhật hồ sơ công ty.
- Backend lấy `company_id` từ JWT/session user hiện tại.

Request body:

```json
{
  "name": "Tuperator Enterprises LTD.",
  "phone": "02838990001",
  "email": "hello@tuperator.vn",
  "businessRegisterAddress": "55 Pasteur, District 1, Ho Chi Minh City",
  "taxCode": "0312345678",
  "headquartersAddress": "21 Nguyen Thi Minh Khai, District 1, Ho Chi Minh City",
  "websiteLink": "https://tuperator.vn",
  "brand": "Tuperator",
  "companyCode": "TPR-ERP",
  "market": "SaaS / Enterprise Operations"
}
```

Validation đề xuất:

- `name`: required, not blank, max `255`.
- `phone`: optional, max `15`, regex phone hợp lệ.
- `email`: optional, max `255`, đúng format email.
- `businessRegisterAddress`: optional, text.
- `taxCode`: optional, max `255`.
- `headquartersAddress`: optional, text.
- `websiteLink`: optional, URL hợp lệ.
- `brand`: optional, max `255`.
- `companyCode`: optional, max `255`, unique.
- `market`: optional, max `255`.

Response `200`:

- trả về `Company Object Response`.

## 4) Error Response Format

Tất cả error trả về dạng:

```json
{
  "timestamp": "2026-03-08T09:10:00Z",
  "status": 403,
  "error": "Forbidden",
  "code": "COMPANY_PROFILE_UPDATE_FORBIDDEN",
  "message": "Only OPER_MANAGER or OPER_ADMIN can update company profile",
  "path": "/api/v1/companies/me",
  "method": "PUT",
  "requestId": "8c2ed8f8-406c-4f0d-9c24-e48cf8d93e0a",
  "traceId": "8c2ed8f8-406c-4f0d-9c24-e48cf8d93e0a",
  "details": [
    {
      "field": "companyCode",
      "reason": "already exists",
      "rejectedValue": "TPR-ERP"
    }
  ]
}
```

## 5) Error Codes FE Cần Handle

Các API trong tài liệu này có thể gặp:

- `TOKEN_INVALID` (`401`)
- `TOKEN_EXPIRED` (`401`)
- `TOKEN_NOT_YET_VALID` (`401`)
- `FORBIDDEN` (`403`) - bị chặn bởi security policy
- `COMPANY_PROFILE_UPDATE_FORBIDDEN` (`403`) - không có role `OPER_ADMIN|OPER_MANAGER`
- `COMPANY_PROFILE_NOT_FOUND` (`404`) - account không có company hoặc company không tồn tại
- `COMPANY_CODE_ALREADY_EXISTS` (`409`) - trùng `companyCode`
- `VALIDATION_ERROR` (`400`) - sai format body
- `REQUEST_BODY_INVALID` (`400`) - JSON sai format
- `BAD_REQUEST` (`400`) - dữ liệu không hợp lệ
- `INTERNAL_SERVER_ERROR` (`500`)

## 6) Mapping Lỗi Theo Endpoint (Quick View)

`GET /companies/me`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `404`: `COMPANY_PROFILE_NOT_FOUND`
- `403`: `FORBIDDEN`
- `400`: `BAD_REQUEST|VALIDATION_ERROR`

`PUT /companies/me`:

- `401`: `TOKEN_INVALID|TOKEN_EXPIRED|TOKEN_NOT_YET_VALID`
- `403`: `COMPANY_PROFILE_UPDATE_FORBIDDEN|FORBIDDEN`
- `404`: `COMPANY_PROFILE_NOT_FOUND`
- `409`: `COMPANY_CODE_ALREADY_EXISTS`
- `400`: `VALIDATION_ERROR|BAD_REQUEST|REQUEST_BODY_INVALID`

## 7) FE Notes (để backend align)

- FE đang hiển thị đầy đủ các field:
  - `name`, `phone`, `email`, `businessRegisterAddress`, `taxCode`,
    `headquartersAddress`, `websiteLink`, `brand`, `companyCode`, `market`.
- FE cần `createdAt`, `updatedAt` để hiển thị metadata.
- FE ưu tiên thông điệp lỗi theo `code`, không phụ thuộc message text trả từ backend.
