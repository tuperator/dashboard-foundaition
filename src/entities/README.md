# Entities Layer

`entities/` chứa domain object cốt lõi của ERP, ví dụ: `user`, `order`, `invoice`, `warehouse-item`.

Quy tắc:

- Entity chỉ chứa logic và kiểu dữ liệu của chính entity đó.
- Không chứa flow nghiệp vụ lớn (flow đó thuộc `features/`).
- Có thể expose `model`, `api`, `ui` theo nhu cầu.
