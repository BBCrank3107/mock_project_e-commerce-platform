# Bàn giao thành viên B — Phạm Văn Duy

Phạm vi triển khai dựa trên README cục bộ: giỏ hàng, coupon, tồn kho, checkout, lịch sử/hủy đơn và quản trị đơn hàng. `REQUIREMENTS.md` và `MOCK_PROJECTS.md` được README tham chiếu nhưng không có trong checkout này.

## Nhánh và thứ tự tích hợp

Các nhánh nối tiếp nhau, mỗi nhánh sau chứa commit của nhánh trước:

1. `feature/KSSTUDENTS/PhamVanDuy/db-seed`: thêm MOCKPROJECT; đồng bộ hai bản schema; sửa sequence carts/orders.
2. `feature/KSSTUDENTS/PhamVanDuy/backend-order-checkout`: entities, repositories, API, giao dịch và kiểm thử tích hợp.
3. `feature/KSSTUDENTS/PhamVanDuy/frontend-cart-checkout`: giỏ hàng, checkout, coupon, lịch sử đơn và trang thành công.
4. `feature/KSSTUDENTS/PhamVanDuy/frontend-admin-orders`: bảng đơn, lọc, phân trang, xem chi tiết và chuyển trạng thái.
5. `feature/KSSTUDENTS/PhamVanDuy/order-checkout`: nhánh bàn giao tổng hợp, kèm tài liệu này.

Có thể tạo một PR từ `order-checkout` vào `main` để lấy toàn bộ phần B. Nếu review riêng từng phần, chọn nhánh trước làm base của nhánh sau. Các nhánh của thành viên A đã nằm trong main tại thời điểm kiểm tra.

## Chạy ứng dụng

- Java 21 trở lên; PostgreSQL 16 trở lên; Node.js và npm.
- Khởi tạo database mới theo README bằng `database/schema.sql`. Script này có DROP TABLE, chỉ dùng để khởi tạo lại dữ liệu khi chủ động muốn reset database.
- Nếu đã có dữ liệu: bổ sung coupon MOCKPROJECT từ phần promotions trong schema và cập nhật sequence carts/orders trước khi tạo bản ghi mới; không chạy toàn bộ script reset trên database cần giữ.
- Backend: trong `backend`, chạy `.\mvnw.cmd spring-boot:run`.
- Frontend: trong `frontend`, chạy `npm ci`, rồi `npm run dev`.
- Dùng tài khoản mẫu `customer` hoặc `admin`, mật khẩu `123456` theo cơ chế khởi tạo tài khoản hiện có của phần A.

Các điểm nối dùng chung được thay đổi tối thiểu: App bọc CartProvider, Navbar lấy số lượng giỏ thực và thêm liên kết; AppRoutes nối trang B; nút thêm giỏ trong ProductCard/ProductDetailPage gọi component B. Backend auth/catalog của A không bị sửa.

## API và quy tắc

API dùng JWT Bearer; kết quả theo `ApiResponse<T>` đang có. Endpoint admin yêu cầu ROLE_ADMIN.

| API | Ý nghĩa |
| --- | --- |
| GET `/api/cart` | Giỏ của người đăng nhập |
| POST `/api/cart/items` | `{ productId, quantity }` |
| PUT `/api/cart/items/{id}` | `{ quantity }`, chỉ sửa item của chính mình |
| DELETE `/api/cart/items/{id}` | Xóa item của chính mình |
| POST `/api/promotions/apply` | `{ code }`; server tính theo giỏ hiện tại |
| GET `/api/inventory/{productId}` | Tồn kho |
| POST `/api/orders/checkout` | Thông tin giao hàng, couponCode, paymentMethod, notes |
| GET `/api/orders/my-orders?page=0&size=10` | Lịch sử cá nhân có phân trang |
| GET `/api/orders/{id}` | Chi tiết đơn của chính mình |
| POST `/api/orders/{id}/cancel` | Hủy đơn cá nhân |
| GET `/api/admin/orders?page=0&size=10&status=PENDING` | Danh sách admin, lọc và phân trang |
| GET `/api/admin/orders/{id}` | Chi tiết admin |
| PATCH `/api/admin/orders/{id}/status` | `{ status }` |

Ví dụ checkout:

```json
{
  "recipientName": "Nguyen Van An",
  "phone": "0912345678",
  "address": "123 Nguyen Hue",
  "city": "Ho Chi Minh",
  "couponCode": "MOCKPROJECT",
  "paymentMethod": "COD",
  "notes": "Giao gio hanh chinh"
}
```

- Server đọc giá hiện tại của sản phẩm, kiểm tra sản phẩm còn bán, kiểm tra coupon và tồn kho; không nhận tổng tiền hoặc userId từ client.
- Checkout trừ kho, ghi order/items/payment/shipping và xóa giỏ trong một transaction. Lỗi bất kỳ bước nào sẽ rollback.
- Khóa user để tuần tự hóa thao tác giỏ/checkout của cùng người dùng. Khóa tồn kho theo productId tăng dần để ngăn oversell và giảm nguy cơ deadlock.
- Trạng thái: PENDING → CONFIRMED → SHIPPING → COMPLETED. Chỉ PENDING/CONFIRMED được hủy. CANCELLED/COMPLETED là trạng thái cuối.
- Hủy đơn khóa order trước khi hoàn kho; gọi hủy lại đơn đã hủy không hoàn kho lần nữa.
- COD/BANKING được tạo với thanh toán PENDING; khi admin hoàn tất đơn, payment thành COMPLETED, shipping thành DELIVERED. Đây là luồng mock, chưa tích hợp cổng thanh toán hoặc đối soát ngân hàng.
- Coupon WELCOME10: 10%, tối đa 500.000đ, tối thiểu 1.000.000đ, 30 ngày kể từ seed. MOCKPROJECT: 20%, tối đa 1.000.000đ, tối thiểu 500.000đ, 7 ngày kể từ seed.
- Sản phẩm chưa có bản ghi inventory được coi là tồn kho 0.
- Phân trang: page bắt đầu từ 0; size trong khoảng 1–100; trả PageResponse theo cấu trúc chung của phần A.

## Giao diện

- `/cart`: danh sách, ảnh, giá, tăng/giảm số lượng, dialog xóa, tổng tiền.
- `/checkout`: React Hook Form + Zod, mode onBlur; coupon; COD/BANKING; xử lý lỗi từ server.
- `/orders/:id/success`: tải lại đơn từ API, có thể refresh trang.
- `/orders`: lịch sử cá nhân, chi tiết, phân trang, dialog hủy.
- `/admin/orders`: bảo vệ quyền admin, bảng lọc/phân trang, Chip màu trạng thái, dialog chi tiết, dropdown chuyển trạng thái và dialog hủy.
- Navbar hiển thị số lượng giỏ thực; nút thêm giỏ ở danh sách/chi tiết gọi API. Chưa đăng nhập được chuyển tới login.

## Kết quả kiểm tra

- 8 kiểm thử tích hợp pass trên PostgreSQL 18, Java 22 (target Java 21), database riêng `ecommerce_member_b_test`.
- Kiểm tra gồm CRUD giỏ và sequence; tính lại giá/coupon/checkout; rollback khi coupon hoặc tồn kho lỗi; phân quyền và ownership; coupon hết hạn/tối thiểu/trần giảm; chuyển trạng thái và lọc/phân trang; hai checkout đồng thời tranh sản phẩm cuối cùng; hoàn kho đúng một lần khi hủy.
- `npm run build` pass (TypeScript + Vite).
- Chưa kiểm tra thao tác/hiển thị bằng trình duyệt vì phiên công cụ không có browser kết nối. Cần kiểm tra UI thủ công theo các route ở trên.

Để chạy lại test backend trong PowerShell (chỉ trên database test riêng; bộ test sẽ reset dữ liệu trong database này):

```powershell
# Tạo ecommerce_member_b_test bằng PostgreSQL trước, dùng cùng thông tin kết nối như application.yml.
cd backend
$env:RUN_MEMBER_B_DB_TESTS = 'true'
.\mvnw.cmd test
```

Nếu không đặt `RUN_MEMBER_B_DB_TESTS=true`, các test cần database sẽ được skip. Nếu PostgreSQL hoặc mật khẩu khác, cấu hình test phải trỏ đúng database test riêng; tuyệt đối không thay tên bằng database đang sử dụng.

Checklist UI thủ công: đăng nhập customer → thêm sản phẩm → tăng/giảm/xóa → checkout và blur các trường → áp MOCKPROJECT → đặt hàng → refresh trang thành công → xem/hủy trong lịch sử → đăng nhập admin → lọc/phân trang/xem chi tiết → xác nhận/giao/hoàn tất hoặc hủy bằng dialog → kiểm tra tồn kho.
