# Features Layer

Mỗi thư mục trong `features/` đại diện cho một nghiệp vụ người dùng có thể thao tác trực tiếp,
ví dụ: `create-order`, `approve-payment`, `assign-shift`.

Quy tắc:
- Feature không gọi trực tiếp sang feature khác.
- Feature được phép dùng `entities/*` và `shared/*`.
- UI của feature đặt trong `ui/`, API trong `api/`, model/state trong `model/`.
