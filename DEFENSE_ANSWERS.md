# HƯỚNG DẪN TRẢ LỜI CÂU HỎI BẢO VỆ ĐỒ ÁN

## 📋 MỤC LỤC
1. [Câu hỏi về vai trò trong dự án](#1-câu-hỏi-về-vai-trò-trong-dự-án)
2. [Câu hỏi về API và code location](#2-câu-hỏi-về-api-và-code-location)
3. [Câu hỏi về luồng hoạt động](#3-câu-hỏi-về-luồng-hoạt-động)
4. [Câu hỏi về kiến trúc và cấu trúc](#4-câu-hỏi-về-kiến-trúc-và-cấu-trúc)

---

## 1. CÂU HỎI VỀ VAI TRÒ TRONG DỰ ÁN

### ❓ "Em làm gì trong dự án này?"

**Trả lời mẫu:**
> "Dạ thưa thầy, em tham gia phát triển phần Frontend của hệ thống quản lý CLB. Cụ thể em đã:
> 
> 1. **Xây dựng giao diện người dùng** cho 3 role: Student, Club Leader, và Admin
> 2. **Tích hợp API** với backend để xử lý các chức năng như đăng nhập, đăng ký tham gia CLB, duyệt yêu cầu, thanh toán
> 3. **Quản lý state và routing** để điều hướng người dùng theo từng role
> 4. **Xử lý authentication** và authorization để phân quyền truy cập
> 5. **Tối ưu UX** với loading states, error handling, và toast notifications
> 
> Em đã tổ chức code theo cấu trúc role-based để dễ maintain và scale sau này."

---

## 2. CÂU HỎI VỀ API VÀ CODE LOCATION

### ❓ "API em gọi sinh viên tham gia CLB ở đâu?"

**Trả lời mẫu:**
> "Dạ thưa thầy, API để sinh viên tham gia CLB được gọi ở **2 nơi chính**:
> 
> **1. Component chính:** `src/components/student/StudentDashboard.js`
> - **Line:** 451
> - **Function:** `submitJoinRequest`
> - **API:** `POST /registers`
> 
> **2. Modal form:** `src/components/student/JoinRequestModal.js`
> - Component này hiển thị form để sinh viên điền thông tin
> - Khi submit, nó gọi callback `onSubmit` truyền về `StudentDashboard`
> - `StudentDashboard` sẽ gọi API `POST /registers` với data đầy đủ
> 
> **Luồng hoạt động:**
> 1. Sinh viên click "Gửi yêu cầu tham gia" → Mở `JoinRequestModal`
> 2. Modal fetch thông tin user và packages (line 54, 101, 132)
> 3. Sinh viên điền form và submit
> 4. `StudentDashboard.submitJoinRequest` được gọi (line 451)
> 5. Gửi POST request đến `/registers` với body gồm `clubId`, `packageId`, `joinReason`, và thông tin cá nhân
> 
> Em có thể mở file `API_BY_USER_FLOWS.md` để xem chi tiết tất cả các API theo từng luồng."

---

### ❓ "API đăng nhập em gọi ở đâu?"

**Trả lời mẫu:**
> "Dạ thưa thầy, API đăng nhập được gọi ở:
> 
> **File:** `src/pages/login.jsx`
> - **Line:** 94
> - **Function:** `handleSubmit`
> - **API:** `POST /auth/token`
> 
> **Request body:**
> ```json
> {
>   "email": "user@example.com",
>   "password": "password123"
> }
> ```
> 
> **Sau khi nhận response:**
> - Extract token từ `data.result.token` (line 114)
> - Parse JWT để lấy role (line 121)
> - Map scope thành role của app: `student`, `club_leader`, `admin` (line 131)
> - Lưu token vào localStorage (line ~200+)
> - Gọi `onLoginSuccess(role)` để update state trong App.js
> 
> Em có thể trace luồng đăng nhập chi tiết trong file `API_FLOWS.md` phần Login Flow."

---

### ❓ "API sinh viên rời CLB em gọi ở đâu?"

**Trả lời mẫu:**
> "Dạ thưa thầy, API sinh viên rời CLB được gọi ở:
> 
> **File:** `src/components/student/StudentJoinedClubs.js`
> - **Line:** 322
> - **Function:** `handleLeaveClub`
> - **API:** `POST /registers/{clubId}/leave`
> 
> **Điều kiện để rời CLB:**
> - Phải là thành viên active (`isActive = true`)
> - Không phải Chủ tịch (`clubRole !== "Chủ tịch"`)
> - Đã được duyệt và đã thanh toán
> 
> **Logic kiểm tra:** Function `canLeaveClub` ở line 206-214
> 
> **Request:**
> - Method: POST
> - Headers: `Authorization: Bearer {token}`
> - URL: `/registers/{clubId}/leave`
> 
> **Response:** 
> ```json
> {
>   "code": 0,
>   "message": "Bạn đã rời khỏi CLB thành công.",
>   "result": "success"
> }
> ```
> 
> Sau khi thành công, component sẽ remove club khỏi danh sách joined clubs và hiển thị toast notification."

---

### ❓ "API cập nhật profile em gọi ở đâu?"

**Trả lời mẫu:**
> "Dạ thưa thầy, API cập nhật profile được gọi ở:
> 
> **File:** `src/components/shared/Profile.js`
> - **Line:** 286
> - **Function:** `handleUpdateProfile`
> - **API:** `PUT /users/my-info`
> 
> **Request body:**
> ```json
> {
>   "fullName": "Nguyễn Văn A",
>   "phoneNumber": "0123456789",
>   "studentCode": "SE12345",
>   "major": "Software Engineering",
>   "avatarUrl": "https://..."
> }
> ```
> 
> **Validation:** Function `validateInfoForm` ở line 209-239 kiểm tra:
> - Họ tên không được để trống
> - Email hợp lệ
> - Số điện thoại 10-11 chữ số
> - Mã sinh viên và chuyên ngành (nếu là student)
> 
> **Sau khi cập nhật thành công:**
> - Update localStorage `user` và `profile`
> - Update UI ngay lập tức
> - Hiển thị success toast"

---

### ❓ "API leader duyệt yêu cầu tham gia em gọi ở đâu?"

**Trả lời mẫu:**
> "Dạ thưa thầy, API duyệt yêu cầu tham gia được gọi ở:
> 
> **File:** `src/components/leader/JoinRequestsList.js`
> - **Line:** 323
> - **Function:** `updateStatus` (với status = 'DaDuyet')
> - **API:** `PUT /registrations/approve`
> 
> **Request body:**
> ```json
> {
>   "subscriptionId": 123,
>   "status": "DaDuyet" // hoặc "TuChoi" để từ chối
> }
> ```
> 
> **Luồng hoạt động:**
> 1. Leader xem danh sách yêu cầu từ API `GET /registrations/club/{clubId}` (line 94, 204)
> 2. Leader click "Chấp nhận" → Gọi `handleApproveClick` (line 367)
> 3. Function `updateStatus` được gọi với status = 'DaDuyet' (line 323)
> 4. Gửi PUT request đến `/registrations/approve`
> 5. Update local state ngay lập tức (optimistic update)
> 6. Refresh danh sách để đảm bảo data mới nhất
> 
> **Xác nhận thanh toán:** API `PUT /registrations/confirm-payment` ở line 382"

---

## 3. CÂU HỎI VỀ LUỒNG HOẠT ĐỘNG

### ❓ "Em giải thích luồng sinh viên tham gia CLB như thế nào?"

**Trả lời mẫu:**
> "Dạ thưa thầy, luồng sinh viên tham gia CLB như sau:
> 
> **Bước 1:** Sinh viên vào trang "Danh sách CLB"
> - Component: `StudentDashboard` với `currentPage = 'clubs'`
> - API: `GET /clubs` (line 360) để lấy danh sách tất cả CLB
> 
> **Bước 2:** Sinh viên click "Gửi yêu cầu tham gia"
> - Mở modal `JoinRequestModal`
> - Modal tự động fetch:
>   - User info: `GET /users/my-info` (line 54)
>   - Club detail: `GET /clubs/{id}` (line 101)
>   - Packages: `GET /packages/club/{clubId}` (line 132)
> 
> **Bước 3:** Sinh viên điền form và submit
> - Validate form (joinReason 20-500 ký tự)
> - Gọi callback `onSubmit` với formData
> 
> **Bước 4:** `StudentDashboard` xử lý submit
> - Function `submitJoinRequest` (line 451)
> - Gửi `POST /registers` với đầy đủ thông tin
> - Nhận `subscriptionId` từ response
> 
> **Bước 5:** Refresh danh sách đơn đã gửi
> - API: `GET /registers/my-registrations` (line 552)
> - Update UI hiển thị "Đang chờ duyệt"
> 
> **Bước 6:** Sau khi được duyệt, sinh viên thanh toán
> - API: `POST /payments/create-link` (line 286 trong StudentMyClubRequests)
> - Mở link thanh toán trong tab mới
> 
> Em có thể xem chi tiết trong file `API_BY_USER_FLOWS.md` phần 'Luồng sinh viên tham gia CLB'."

---

### ❓ "Em giải thích luồng đăng nhập như thế nào?"

**Trả lời mẫu:**
> "Dạ thưa thầy, luồng đăng nhập như sau:
> 
> **Bước 1:** User nhập email/password trong form
> - Component: `src/pages/login.jsx`
> - Validate form (email format, password không rỗng)
> 
> **Bước 2:** Submit form
> - Function `handleSubmit` (line 94)
> - Gửi `POST /auth/token` với body `{ email, password }`
> 
> **Bước 3:** Nhận response và xử lý token
> - Extract token từ `data.result.token` (line 114)
> - Parse JWT để lấy payload (line 121)
> - Extract scope từ payload
> - Map scope thành role: `SinhVien` → `student`, `ClubLeader` → `club_leader`, `QuanTriVien` → `admin` (line 131)
> 
> **Bước 4:** Lưu vào localStorage
> - `localStorage.setItem('authToken', token)`
> - `localStorage.setItem('user', userData)`
> 
> **Bước 5:** Update App.js state
> - Gọi `onLoginSuccess(role)`
> - App.js set `isAuthenticated = true`, `userRole = role`
> 
> **Bước 6:** Redirect đến dashboard theo role
> - Student → `currentPage = 'clubs'`
> - Leader → `currentPage = 'manage'`
> - Admin → `currentPage = 'dashboard'`
> 
> Em có thể xem chi tiết trong file `API_FLOWS.md` phần Login Flow."

---

## 4. CÂU HỎI VỀ KIẾN TRÚC VÀ CẤU TRÚC

### ❓ "Em tổ chức code như thế nào?"

**Trả lời mẫu:**
> "Dạ thưa thầy, em đã tổ chức code theo cấu trúc role-based:
> 
> **1. Components theo role:**
> ```
> src/components/
> ├── shared/          # Components dùng chung (Toast, Sidebar, Profile)
> ├── student/         # Components cho Student (StudentDashboard, JoinRequestModal, ...)
> ├── leader/          # Components cho Leader (ClubLeaderDashboard, JoinRequestsList, ...)
> └── admin/           # Components cho Admin (Dashboard, ClubManagement, ...)
> ```
> 
> **2. Service Layer:**
> ```
> src/services/
> ├── apiClient.js           # Base API client với error handling
> ├── authService.js         # Auth APIs (login, logout)
> ├── userService.js         # User APIs (profile, change password)
> ├── clubService.js         # Club APIs
> ├── registrationService.js  # Registration APIs
> ├── packageService.js      # Package APIs
> ├── paymentService.js      # Payment APIs
> └── clubRequestService.js  # Club Request APIs
> ```
> 
> **3. Shared Utilities:**
> ```
> src/features/shared/
> ├── utils/
> │   ├── auth.js        # JWT parsing, role mapping
> │   └── clubMapper.js  # Data mapping
> └── constants.js       # Constants (categories, roles)
> ```
> 
> **Lợi ích:**
> - Dễ tìm code theo chức năng
> - Dễ maintain và scale
> - Tách biệt API logic khỏi UI components
> - Code dùng chung được tập trung
> 
> Em có thể xem chi tiết trong file `PROJECT_STRUCTURE.md` và `COMPONENTS_STRUCTURE.md`."

---

### ❓ "Em xử lý authentication như thế nào?"

**Trả lời mẫu:**
> "Dạ thưa thầy, em xử lý authentication như sau:
> 
> **1. Token Storage:**
> - Lưu JWT token trong `localStorage` với key `authToken`
> - Lý do: Dễ implement, tự động refresh khi đăng nhập user mới
> - Lưu ý: Có thể nâng cấp sang httpOnly cookies sau này để bảo mật hơn
> 
> **2. Token Parsing:**
> - Function `parseJWTToken` trong `src/features/shared/utils/auth.js`
> - Decode JWT payload để lấy thông tin user (userId, scope, clubIds)
> 
> **3. Role Mapping:**
> - Function `mapScopeToRole` trong `src/features/shared/utils/auth.js`
> - Map scope từ backend (`SinhVien`, `ClubLeader`, `QuanTriVien`) thành role của app (`student`, `club_leader`, `admin`)
> 
> **4. Route Protection:**
> - App.js check token khi mount (line 74-285)
> - Nếu có token hợp lệ → Set `isAuthenticated = true`
> - Nếu không có token → Redirect về Home/Login
> 
> **5. API Authentication:**
> - Mỗi API call đều gửi header `Authorization: Bearer {token}`
> - Token được lấy từ `localStorage.getItem('authToken')`
> - Nếu 401/403 → Có thể retry hoặc logout user
> 
> **6. Logout:**
> - Clear localStorage (`authToken`, `user`, `joinRequests`, ...)
> - Gọi API `POST /auth/logout` (optional)
> - Set `isAuthenticated = false` và redirect về Home"

---

### ❓ "Em xử lý lỗi như thế nào?"

**Trả lời mẫu:**
> "Dạ thưa thầy, em xử lý lỗi theo các cách sau:
> 
> **1. Network Errors:**
> - Retry logic cho một số API quan trọng (ví dụ: `fetchClubs` có MAX_RETRIES = 2)
> - Timeout 10 giây để tránh treo khi mạng chậm
> - Sử dụng AbortController để có thể cancel request
> 
> **2. API Errors:**
> - Check response code: `code === 1000 || code === 0` = success
> - Hiển thị message từ `data.message` hoặc `data.error`
> - Toast notification để user biết lỗi gì
> 
> **3. Validation Errors:**
> - Client-side validation trước khi gửi API
> - Hiển thị lỗi ngay dưới input field
> - Ví dụ: Email format, password length, joinReason 20-500 ký tự
> 
> **4. Error Handling Pattern:**
> ```javascript
> try {
>   const response = await fetch(url, config);
>   const data = await response.json();
>   
>   if (!response.ok || (data.code !== 1000 && data.code !== 0)) {
>     throw new Error(data.message || 'API request failed');
>   }
>   
>   // Success handling
> } catch (error) {
>   console.error('Error:', error);
>   showToast(error.message, 'error');
> }
> ```
> 
> **5. Fallback Data:**
> - Một số component có fallback từ localStorage nếu API fail
> - Ví dụ: Profile component có thể lấy data từ localStorage nếu API không load được"

---

## 📝 TIPS KHI TRẢ LỜI

### ✅ Nên làm:
1. **Chỉ rõ file và line number** - "File `src/components/student/StudentDashboard.js` line 451"
2. **Giải thích luồng** - Từng bước một cách logic
3. **Đưa ra ví dụ** - Request/Response mẫu
4. **Tham khảo documentation** - "Em có thể xem trong file `API_BY_USER_FLOWS.md`"
5. **Giải thích lý do** - Tại sao làm như vậy

### ❌ Không nên:
1. Nói chung chung không có file cụ thể
2. Không biết code ở đâu
3. Không giải thích được luồng hoạt động
4. Không biết API nào được gọi

---

## 🔗 TÀI LIỆU THAM KHẢO

- **API theo luồng:** `API_BY_USER_FLOWS.md`
- **API đầy đủ:** `API_ENDPOINTS_COMPLETE.md`
- **Luồng chi tiết:** `API_FLOWS.md`
- **Cấu trúc project:** `PROJECT_STRUCTURE.md`
- **Cấu trúc components:** `COMPONENTS_STRUCTURE.md`
- **Hướng dẫn codebase:** `CODEBASE_GUIDE.md`

---

**"Chuẩn bị kỹ các câu trả lời này sẽ giúp em tự tin khi bảo vệ đồ án!"** 🎓



