# Frontend Architecture (React + Vite) cho ERP

Tài liệu này mô tả kiến trúc chuẩn cho dự án frontend ERP để mở rộng dễ và maintain lâu dài.

## 1. Cấu trúc thư mục đề xuất

```text
src/
  app/
    App.tsx
    providers/
      AppProviders.tsx
    router/
      AppRouter.tsx
    styles/
      index.css

  pages/
    dashboard/
      index.ts
      ui/
        DashboardPage.tsx
    not-found/
      index.ts
      ui/
        NotFoundPage.tsx

  widgets/
    app-shell/
      index.ts
      ui/
        AppShell.tsx
    component-showcase/
      ui/
        ComponentExample.tsx
        Example.tsx

  features/
    README.md
    # Ví dụ sau này:
    # create-order/
    #   ui/
    #   model/
    #   api/

  entities/
    README.md
    # Ví dụ sau này:
    # order/
    #   model/
    #   api/
    #   ui/

  shared/
    assets/
    constants/
      routes.ts
    hooks/
      use-mobile.ts
    lib/
      utils.ts
    ui/
      ... (shadcn/base components)

  App.tsx
  main.tsx
```

## 2. Ý nghĩa từng layer

- `app/`: Khởi tạo ứng dụng (providers, router, global styles). Không chứa business logic.
- `pages/`: Mỗi page ứng với 1 route lớn.
- `widgets/`: Các khối UI lớn có thể tái sử dụng giữa nhiều page (layout, panel, header vùng nghiệp vụ).
- `features/`: Use-case người dùng (tạo đơn hàng, duyệt thanh toán, xuất hóa đơn...).
- `entities/`: Domain object cốt lõi (user, order, invoice, warehouse-item...).
- `shared/`: Tài nguyên dùng chung (UI base, utils, constants, hooks, assets).

## 3. Quy tắc phụ thuộc (dependency rule)

Dòng phụ thuộc đi từ trên xuống:

`app -> pages -> widgets -> features -> entities -> shared`

Quy tắc:

- Không import ngược layer (ví dụ `shared` không import `features`).
- `features` không gọi trực tiếp `features` khác.
- `pages` nên lắp ghép từ `widgets/features/entities`, không chứa logic quá sâu.

## 4. Quy ước khi tạo module mới

Ví dụ thêm nghiệp vụ `approve-payment`:

```text
src/features/approve-payment/
  ui/
    ApprovePaymentButton.tsx
  model/
    useApprovePayment.ts
    approve-payment.store.ts
  api/
    approve-payment.api.ts
  index.ts
```

Quy tắc:

- `ui/`: component hiển thị
- `model/`: state, hooks, business logic nội bộ feature
- `api/`: gọi API, mapping DTO
- `index.ts`: public API của module

## 5. Quy tắc import để codebase sạch

- Dùng alias `@/` thay vì relative sâu (`../../../`).
- Import qua `index.ts` của module nếu có.
- Không import file private từ bên ngoài module (chỉ import public API).

Ví dụ tốt:

```ts
import { AppShell } from "@/widgets/app-shell";
import { DashboardPage } from "@/pages/dashboard";
```

## 6. Chuẩn maintain dài hạn cho ERP

- Mỗi domain lớn tách rõ thành `entities` + `features` tương ứng.
- Không đưa logic nghiệp vụ vào `shared/`.
- Thêm test cùng module khi có logic quan trọng (`*.test.ts`).
- Mọi route mới phải có page riêng trong `pages/`.
- Mọi config global (env, route key, permission key) đặt trong `shared/constants` hoặc `shared/config`.

## 7. Gợi ý scale tiếp theo

- Bổ sung router chuẩn (`react-router-dom`) khi số route tăng.
- Bổ sung data layer chuẩn (`react-query` hoặc giải pháp tương đương) tại `app/providers`.
- Chuẩn hóa typed API client cho ERP (`shared/api` + `entities/*/api`).

## 8. Trạng thái hiện tại của project

- Router đang đặt tại `src/app/router/AppRouter.tsx` bằng `react-router-dom`.
- Query client đang được khởi tạo tại `src/app/providers/AppProviders.tsx` bằng `@tanstack/react-query`.
- Ví dụ query đã được áp dụng ở `src/pages/dashboard/model/useDashboardKpis.ts`.
