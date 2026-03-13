# AI Coding Guide

## Mục tiêu

Tài liệu này là guideline ngắn gọn dùng chung cho toàn bộ module trong project.

Mục tiêu:

- AI đọc file này trước khi code
- không cần scan lại toàn bộ source để đoán pattern
- giữ code mới nhất quán với kiến trúc hiện tại

## 1. Nguyên tắc chung

- AI không được tự build, test, lint, chạy dev server hoặc chạy bất kỳ command nào trừ khi user yêu cầu rõ ràng
- Không dồn toàn bộ logic vào page cha
- Component nào là nơi user thao tác trực tiếp thì ưu tiên để component đó tự xử lý state, query, mutation và dialog liên quan
- Chỉ truyền xuống component con những props thật sự cần cho render hoặc context dữ liệu dùng chung
- Nếu một block UI có state riêng, API riêng hoặc action riêng, hãy tách thành component riêng

## 2. Cách tổ chức code

### 2.1. Model

Mỗi module nên có `model/` riêng, chứa:

- `types.ts`
- `*.api.ts`
- `helpers/`
- `hooks/`
- `constants.ts`

### 2.2. UI

Mỗi module nên có `ui/` và `ui/components/`.

Rule:

- component business-specific ở lại trong module
- chỉ move sang `shared/` nếu component đủ generic để dùng ở nhiều module khác

### 2.3. Shared

Đặt trong `src/shared/` cho:

- UI generic
- API client dùng chung
- i18n
- hooks hoặc utilities dùng nhiều module

## 3. Pattern component

### 3.1. Page component

Page chỉ nên giữ:

- route params
- layout
- tab switching
- root-level query thật sự dùng chung nhiều nơi

Không nên để page xử lý toàn bộ:

- inline actions
- row actions
- dialog submit
- table cell mutation

### 3.2. Smart child component

Nếu một component có:

- query riêng
- mutation riêng
- dialog riêng
- action menu riêng

thì component đó nên tự xử lý API ngay bên trong nó.

### 3.3. Tách component nhỏ

Ưu tiên tách riêng:

- `Dialog`
- `RowActions`
- `FieldSelect`
- `BulkActions`
- `Toolbar`
- `Table`
- `Board`

## 4. Pattern API

- Tách API theo domain, không nhét tất cả vào một file lớn
- Mỗi API function phải có tên rõ nghĩa
- Response backend phải được map về type FE trước khi trả ra UI
- Không để UI xử lý raw backend shape trực tiếp

Ví dụ naming:

- `listUsers`
- `getUserDetail`
- `createProject`
- `updateTask`
- `archiveSprint`

## 5. Pattern query và mutation

- Query đặt gần nơi dùng nếu data chỉ phục vụ một component hoặc một tab
- Mutation đặt trong component nơi user bấm thao tác
- Component mutate data phải tự invalidate các query liên quan
- Tránh prop drilling callback qua nhiều tầng chỉ để gọi API

## 6. Pattern form

Mọi form mới nên dùng:

- `react-hook-form`
- `zod`
- `zodResolver`

Rule:

- schema đặt gần component
- reset form khi reopen dialog/sheet
- hiển thị lỗi ngay dưới field
- disable submit khi invalid hoặc đang submit

## 7. Pattern i18n

- Text UI nên đi qua i18n khi có thể
- Không invent key mới mà quên thêm dictionary
- Check key hiện có trước khi dùng
- Nếu thêm key mới, thêm luôn vào dictionary đúng module/domain

## 8. Pattern UI/UX

- Search thường nên rộng hơn filter
- Filter ngắn, rõ, không stretch vô nghĩa
- Action column nên gọn, ưu tiên icon/dropdown thay vì nhiều button text
- Các field inline như `status`, `priority`, `assignee` nên có màu sắc rõ và đồng nhất giữa table, board, dialog
- Không tạo quá nhiều cột thao tác riêng nếu có thể gộp vào action menu

## 9. State management

Ưu tiên:

- state local cho UI local
- derived state bằng biến tính toán hoặc `useMemo`
- lazy initializer nếu đọc từ `localStorage`

Tránh:

- `setState` trong `useEffect` chỉ để sync derived state
- snapshot props vào state rồi không reset lại
- parent giữ state cho child dù child là nơi duy nhất dùng state đó

## 10. Dialog và action placement

- Dialog nên đặt gần nơi mở nó nhất
- Action row nên tự xử lý mutation của chính nó
- Table cell editable nên tách component riêng nếu có API riêng

Không mặc định nhét mọi dialog vào page cha.

## 11. Tài liệu API

Khi một domain đủ lớn hoặc có nhiều flow riêng, tạo doc trong `docs/`.

Một doc API nên có:

- mục tiêu
- functional scope
- request/response mẫu
- FE rules
- error format
- delivery order

## 12. Naming conventions

- React component: `PascalCase.tsx`
- API/helper/hook: `camelCase.ts`
- Tên component nên mô tả rõ scope

Ví dụ:

- `UserProfileDialog`
- `ProjectSettingsSheet`
- `OrderRowActions`
- `InvoiceStatusSelect`

## 13. Checklist trước khi AI code

AI nên tự check:

1. Feature này thuộc domain nào?
2. Logic này có thật sự cần đặt ở page cha không?
3. Component con có nên tự query/mutate không?
4. Có cần tách action thành component riêng không?
5. Có cần `zod` validation không?
6. Có cần thêm i18n key không?
7. Có cần thêm API doc không?
8. Có query key nào cần invalidate không?
9. Component này có đủ generic để move sang `shared/` không?

## 14. Mặc định khi không chắc nên làm gì

Nếu chưa chắc nên đặt logic ở đâu, mặc định chọn:

- component con gần UI thao tác nhất

thay vì:

- page cha

Nếu chưa chắc có nên shared hay không, mặc định giữ trong module trước.
