## API ↔ Component ↔ UI mapping (Leader area)

File này liệt kê các API mà **role Club Leader** đang dùng trong frontend, API nằm ở component nào và xuất hiện ở phần nào trên giao diện.

> Lưu ý: Chỉ liệt kê các API đang được gọi trong thư mục `src/components/leader`. Có thể mở rộng file này cho admin / student nếu cần.

---

### 1. Thông tin CLB & thống kê

| API | Method | Component | Vị trí UI / Chức năng |
| --- | --- | --- | --- |
| `/clubs/{clubId}` | GET | `ClubLeaderDashboard` | Lấy **thông tin CLB** mà leader quản lý, hiển thị ở header “Trang Quản lý Club Leader” và khối `ClubInfo` (tên, mô tả, danh mục, ngày thành lập, chủ tịch, email, địa điểm, số thành viên). |
| `/clubs/{clubId}/members` | GET | `ClubLeaderDashboard` → prop xuống `MembersList` | Lấy **danh sách thành viên CLB**, hiển thị trong tab **“Quản lý thành viên”** (bảng thành viên, vai trò, ngày tham gia, tình trạng membership). |
| `/clubs/{clubId}/stats` | GET | `ClubLeaderDashboard` | Lấy **thống kê CLB**: tổng thành viên, số đơn chờ duyệt, danh sách chưa đóng phí. Dữ liệu dùng cho `LeaderStats` (totalMembers, pendingRequestsCount) và khối “Danh sách chưa đóng phí” trên tab **“Quản lý Club”**. |
| `/clubs/{clubId}` | PUT | `ClubLeaderDashboard` (`handleFormSubmit`) | Cập nhật **thông tin CLB** (mô tả, địa điểm, logo) từ form `ClubInfoForm` trong tab **“Quản lý Club”** khi leader lưu chỉnh sửa. |

---

### 2. Gói thành viên (phí tham gia & thời hạn)

| API | Method | Component | Vị trí UI / Chức năng |
| --- | --- | --- | --- |
| `/packages/club/{clubId}` | GET | `ClubFeeManagement` | Lấy **danh sách gói membership** của CLB. Hiển thị trong tab **“Phí & Thời hạn”**: card gói đầu tiên (tên gói, mô tả, giá, thời hạn, trạng thái). |
| `/packages/{packageId}` | GET | `ClubFeeManagement` (`handleViewDetail`) | Lấy **chi tiết gói** để hiển thị trong **modal “Chi tiết gói thành viên”**. |
| `/packages/{packageId}` | GET | `ClubFeeManagement` (`openEdit`) | Lấy chi tiết gói để **prefill form chỉnh sửa** trong modal “Cập nhật gói”; nếu API lỗi thì fallback về dữ liệu từ danh sách. |
| `/packages/{packageId}` | PUT | `ClubFeeManagement` (`handleUpdatePackage`) | Cập nhật **tên gói, thời hạn, giá, mô tả**. Sau khi thành công, cập nhật lại list packages và detail trong UI tab **“Phí & Thời hạn”**. |

---

### 3. Quản lý thành viên

| API | Method | Component | Vị trí UI / Chức năng |
| --- | --- | --- | --- |
| `/registrations/club/{clubId}/user/{userId}` | DELETE | `ClubLeaderDashboard` (`handleDeleteMember`) | Tab **“Quản lý thành viên”** – nút **“Xóa”**: leader xóa thành viên khỏi CLB (BE đánh dấu trạng thái “Đã rời CLB”). UI sẽ remove dòng tương ứng và giảm `memberCount`. |
| `/registrations/club/{clubId}/user/{userId}/role` | PUT | `ClubLeaderDashboard` (`handleUpdateMemberRole`) | Tab **“Quản lý thành viên”** – dropdown **vai trò**: đổi role (Chủ tịch, Phó chủ tịch, Thư ký, Thủ quỹ, Thành viên). Sau khi API trả về, cập nhật lại vai trò hiển thị trong bảng. |

---

### 4. Yêu cầu tham gia CLB (Join Requests)

| API | Method | Component | Vị trí UI / Chức năng |
| --- | --- | --- | --- |
| `/registrations/club/{clubId}` | GET | `JoinRequestsList` (`fetchRegistrations`, polling) | Tab **“Duyệt yêu cầu”** – bảng danh sách đơn đăng ký tham gia. Lần đầu fetch và polling 2s để cập nhật realtime; có thể filter theo trạng thái. |
| `/registrations/club/{clubId}/status/{status}` | GET | `JoinRequestsList` (`fetchRegistrations`, polling) | Cùng tab trên, khi chọn filter trạng thái (Chờ duyệt / Đã duyệt / Từ chối / Hết hạn) sẽ gọi endpoint này để lấy danh sách theo trạng thái. |
| `/registrations/approve` | PUT | `JoinRequestsList` (`updateStatus`) | Nút **“Chấp nhận” / “Từ chối”** trong tab **“Duyệt yêu cầu”** và trong modal chi tiết: cập nhật trạng thái đăng ký (ChoDuyet → DaDuyet / TuChoi). |
| `/registrations/confirm-payment` | PUT | `JoinRequestsList` (`handleConfirmPayment`) | Nút **“Xác nhận đã thu phí”**: leader xác nhận đã nhận tiền (thường dùng cho thanh toán offline). Sau khi thành công, UI set `isPaid = true` cho đơn tương ứng. |
| `/registers/{subscriptionId}` | GET | `JoinRequestsList` (`handleViewDetails`) | Nút **“Chi tiết”** trong bảng yêu cầu: mở modal hiển thị đầy đủ thông tin đăng ký (lý do, package, giá, ngày, v.v.). |

---

### 5. Lịch sử và doanh thu thanh toán (Leader)

| API | Method | Component | Vị trí UI / Chức năng |
| --- | --- | --- | --- |
| `/clubs/{clubId}/stats` | GET | `ClubLeaderDashboard` (`loadClubStats`) | Tab **“Quản lý Club”** – cung cấp `totalMembers`, `unpaidCount`, `unpaidMembers` cho `LeaderStats` và bảng “Danh sách chưa đóng phí”. Polling 10s để cập nhật realtime. |
| `/payment-history/revenue/club/{clubId}/date-range?startDate&endDate` | GET | `ClubLeaderDashboard` (`loadMonthlyRevenue`) | Tính **doanh thu tháng hiện tại** của CLB; kết quả hiển thị ở card “Doanh thu tháng hiện tại” trong `LeaderStats` (khi toggle ở chế độ Tháng). Polling 10s. |
| `/payment-history/revenue/club/{clubId}` | GET | `ClubLeaderDashboard` (`loadAllTimeRevenue`) | Tính **tổng doanh thu all-time**; hiển thị ở card doanh thu khi toggle `Tất cả`. Polling 10s. |
| `/payment-history/club/{clubId}?page&size&sortBy&sortDir` | GET | `ClubPaymentHistory` | Tab **“Lịch sử giao dịch”** của leader – bảng lịch sử thanh toán cho CLB, phân trang, sort mặc định `paymentDate DESC`. |
| `/registrations/club/{clubId}` | GET | `ClubLeaderDashboard` (polling payment) | Polling 2s trong background để phát hiện **khi sinh viên thanh toán xong** (isPaid false → true) và bắn toast “💰 {studentName} đã chuyển tiền thành công!”. |

---

### 6. Chi tiết subscription (đăng ký thành viên)

| API | Method | Component | Vị trí UI / Chức năng |
| --- | --- | --- | --- |
| `/registers/{subscriptionId}` | GET | `SubscriptionDetailModal` | Modal **“Chi tiết đăng ký CLB”** (được mở từ các nơi có subscriptionId, như JoinRequestsList hoặc những màn khác). Hiển thị toàn bộ thông tin: gói, giá, trạng thái, thanh toán, người duyệt, các mốc thời gian. |

---

### 7. Thông tin user (leader)

| API | Method | Component | Vị trí UI / Chức năng |
| --- | --- | --- | --- |
| `/users/my-info` | GET | `ClubLeaderDashboard` (useEffect 0) | Chạy ngầm khi mở trang leader để **refresh token** và đồng bộ thông tin user (role, clubId, email, v.v.) vào `localStorage`. Không có UI trực tiếp nhưng ảnh hưởng tới quyền hạn và dữ liệu các API khác. |



