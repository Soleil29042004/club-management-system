# API THEO LUỒNG NGƯỜI DÙNG - TRA CỨU NHANH

## 📋 MỤC LỤC
1. [Luồng đăng nhập](#1-luồng-đăng-nhập)
2. [Luồng sinh viên tham gia CLB](#2-luồng-sinh-viên-tham-gia-clb)
3. [Luồng sinh viên rời CLB](#3-luồng-sinh-viên-rời-clb)
4. [Luồng quản lý Profile](#4-luồng-quản-lý-profile)
5. [Luồng tạo CLB mới](#5-luồng-tạo-clb-mới)
6. [Admin - Chức năng đầy đủ](#6-admin---chức-năng-đầy-đủ)

---

## 1. LUỒNG ĐĂNG NHẬP

### Mô tả
User nhập email/password → Đăng nhập → Vào dashboard theo role

### API Endpoints

#### 1.1. POST `/auth/token` - Login
- **File:** `src/pages/login.jsx`
- **Line:** 94
- **Method:** POST
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "code": 1000,
    "message": "Login successful",
    "result": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "userId": 1,
        "email": "user@example.com",
        "fullName": "Nguyễn Văn A",
        "role": "SinhVien"
      }
    }
  }
  ```
- **Xử lý sau API:**
  - Extract token từ `data.result.token`
  - Parse JWT để lấy role
  - Lưu vào localStorage: `authToken`, `user`
  - Redirect đến dashboard theo role

#### 1.2. POST `/auth/logout` - Logout (Optional)
- **File:** `src/App.js`
- **Line:** 277
- **Method:** POST
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Success message
- **Xử lý:** Clear localStorage và redirect về Home

---

## 2. LUỒNG SINH VIÊN THAM GIA CLB

### Mô tả
Sinh viên xem danh sách CLB → Chọn CLB → Xem chi tiết → Gửi yêu cầu tham gia → Thanh toán

### API Endpoints

#### 2.1. GET `/clubs` - Lấy danh sách CLB
- **File:** `src/components/student/StudentDashboard.js`
- **Line:** 360
- **Method:** GET
- **Headers:** `Content-Type: application/json`
- **Response:**
  ```json
  {
    "code": 1000,
    "result": [
      {
        "clubId": 1,
        "clubName": "CLB Lập trình",
        "description": "...",
        "category": "HocThuat",
        "totalMembers": 50,
        "logo": "https://...",
        ...
      }
    ]
  }
  ```

#### 2.2. GET `/clubs/{id}` - Xem chi tiết CLB
- **File:** `src/components/student/JoinRequestModal.js`
- **Line:** 101
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Club object với đầy đủ thông tin

#### 2.3. GET `/users/my-info` - Lấy thông tin user
- **File:** `src/components/student/JoinRequestModal.js`
- **Line:** 54
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "code": 1000,
    "result": {
      "userId": 1,
      "email": "student@example.com",
      "fullName": "Nguyễn Văn A",
      "phoneNumber": "0123456789",
      "studentCode": "SE12345",
      "major": "Software Engineering"
    }
  }
  ```
- **Mục đích:** Tự động điền form với thông tin user

#### 2.4. GET `/packages/club/{clubId}` - Lấy gói membership
- **File:** `src/components/student/JoinRequestModal.js`
- **Line:** 132
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "code": 1000,
    "result": [
      {
        "packageId": 1,
        "name": "Gói 1 tháng",
        "price": 50000,
        "term": 1,
        "description": "..."
      }
    ]
  }
  ```

#### 2.5. POST `/registers` - Gửi yêu cầu tham gia
- **File:** `src/components/student/StudentDashboard.js`
- **Line:** 451
- **Method:** POST
- **Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body:**
  ```json
  {
    "clubId": 1,
    "packageId": 1,
    "joinReason": "Tôi muốn học lập trình",
    "fullName": "Nguyễn Văn A",
    "phone": "0123456789",
    "studentId": "SE12345",
    "major": "Software Engineering"
  }
  ```
- **Response:**
  ```json
  {
    "code": 1000,
    "message": "Đăng ký thành công",
    "result": {
      "subscriptionId": 123,
      "clubId": 1,
      "clubName": "CLB Lập trình",
      "status": "ChoDuyet",
      "packageId": 1,
      "price": 50000,
      "isPaid": false
    }
  }
  ```

#### 2.6. GET `/registers/my-registrations` - Xem đơn đã gửi
- **File:** `src/components/student/StudentDashboard.js`
- **Line:** 64, 172, 552
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Array of registration objects
- **Mục đích:** Refresh danh sách đơn sau khi tạo mới

#### 2.7. POST `/payments/create-link` - Tạo link thanh toán
- **File:** `src/components/student/StudentMyClubRequests.js`
- **Line:** 286
- **Method:** POST
- **Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body:**
  ```json
  {
    "subscriptionId": 123
  }
  ```
- **Response:**
  ```json
  {
    "code": 1000,
    "result": {
      "paymentLink": "https://payment-gateway.com/pay/...",
      "qrCode": "data:image/png;base64,..."
    }
  }
  ```

---

## 3. LUỒNG SINH VIÊN RỜI CLB

### Mô tả
Sinh viên xem CLB đã tham gia → Click "Rời CLB" → Confirm → Rời khỏi CLB

### API Endpoints

#### 3.1. GET `/clubs/user/{userId}/joined` - Lấy CLB đã tham gia
- **File:** `src/components/student/StudentJoinedClubs.js`
- **Line:** 146
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "code": 1000,
    "result": [
      {
        "clubId": 1,
        "clubName": "CLB Lập trình",
        "clubRole": "Thành viên",
        "isActive": true,
        "startDate": "2024-01-01",
        "endDate": "2024-12-31"
      }
    ]
  }
  ```

#### 3.2. POST `/registers/{clubId}/leave` - Rời CLB
- **File:** `src/components/student/StudentJoinedClubs.js`
- **Line:** 322
- **Method:** POST
- **Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Response:**
  ```json
  {
    "code": 0,
    "message": "Bạn đã rời khỏi CLB thành công.",
    "result": "success"
  }
  ```
- **Điều kiện:**
  - Phải là thành viên active (`isActive = true`)
  - Không phải Chủ tịch (`clubRole !== "Chủ tịch"`)
  - Đã được duyệt và đã thanh toán

---

## 4. LUỒNG QUẢN LÝ PROFILE

### Mô tả
User xem profile → Chỉnh sửa thông tin → Đổi mật khẩu

### API Endpoints

#### 4.1. GET `/users/my-info` - Lấy thông tin profile
- **File:** `src/components/shared/Profile.js`
- **Line:** 75 (fallback)
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:** User object với đầy đủ thông tin

#### 4.2. PUT `/users/my-info` - Cập nhật profile
- **File:** `src/components/shared/Profile.js`
- **Line:** 286
- **Method:** PUT
- **Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body:**
  ```json
  {
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0123456789",
    "studentCode": "SE12345",
    "major": "Software Engineering",
    "avatarUrl": "https://..."
  }
  ```
- **Response:**
  ```json
  {
    "code": 1000,
    "message": "Cập nhật thành công",
    "result": { ... }
  }
  ```

#### 4.3. POST `/users/change-password` - Đổi mật khẩu
- **File:** `src/components/shared/Profile.js`
- **Line:** 404
- **Method:** POST
- **Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body:**
  ```json
  {
    "oldPassword": "oldpass123",
    "newPassword": "newpass123"
  }
  ```
- **Response:**
  ```json
  {
    "code": 1000,
    "message": "Đổi mật khẩu thành công"
  }
  ```

#### 4.4. POST `/users/forgot-password` - Quên mật khẩu
- **File:** `src/pages/login.jsx`
- **Line:** 436
- **Method:** POST
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "code": 1000,
    "message": "Email đặt lại mật khẩu đã được gửi"
  }
  ```

---

## 5. LUỒNG TẠO CLB MỚI

### Mô tả
Sinh viên tạo yêu cầu thành lập CLB → Admin xem và duyệt/từ chối

### API Endpoints

#### 5.1. POST `/club-requests` - Tạo yêu cầu thành lập CLB
- **File:** `src/components/student/StudentDashboard.js`
- **Line:** 668
- **Method:** POST
- **Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body:**
  ```json
  {
    "clubName": "CLB Mới",
    "description": "Mô tả CLB...",
    "category": "HocThuat",
    "reason": "Lý do thành lập CLB"
  }
  ```
- **Response:**
  ```json
  {
    "code": 1000,
    "message": "Tạo yêu cầu thành công",
    "result": {
      "requestId": 1,
      "clubName": "CLB Mới",
      "status": "Pending",
      ...
    }
  }
  ```

#### 5.2. GET `/club-requests` - Lấy danh sách yêu cầu (Admin)
- **File:** `src/components/admin/ClubRequestsManagement.js`
- **Line:** 81, 170
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Array of club request objects

#### 5.3. PUT `/club-requests/{requestId}/review` - Duyệt/Từ chối yêu cầu
- **File:** `src/components/admin/ClubRequestsManagement.js`
- **Line:** 258, 347
- **Method:** PUT
- **Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer {token}"
  }
  ```
- **Request Body:**
  ```json
  {
    "status": "Approved", // hoặc "Rejected"
    "reviewComment": "Lý do duyệt/từ chối"
  }
  ```
- **Response:**
  ```json
  {
    "code": 1000,
    "message": "Duyệt yêu cầu thành công",
    "result": {
      "requestId": 1,
      "status": "Approved",
      ...
    }
  }
  ```

---

## 6. ADMIN - CHỨC NĂNG ĐẦY ĐỦ

### 6.1. Dashboard & Thống kê

#### GET `/clubs` - Lấy danh sách CLB
- **File:** `src/components/admin/Dashboard.js`
- **Line:** 360 (trong App.js)
- **Method:** GET
- **Response:** Array of clubs

#### GET `/clubs/{id}/stats` - Thống kê CLB
- **File:** `src/components/leader/ClubLeaderDashboard.js` (có thể dùng cho admin)
- **Line:** 321
- **Method:** GET
- **Response:**
  ```json
  {
    "code": 1000,
    "result": {
      "totalMembers": 50,
      "activeMembers": 45,
      "pendingRequests": 5,
      "totalRevenue": 5000000
    }
  }
  ```

### 6.2. Quản lý CLB

#### GET `/clubs/{id}` - Xem chi tiết CLB
- **File:** `src/components/admin/ClubManagement.js`
- **Method:** GET
- **Response:** Club object

#### PUT `/clubs/{id}` - Cập nhật CLB
- **File:** `src/components/admin/ClubManagement.js`
- **Method:** PUT
- **Request Body:**
  ```json
  {
    "name": "CLB Lập trình",
    "description": "...",
    "category": "HocThuat",
    ...
  }
  ```

#### DELETE `/clubs/{id}` - Xóa CLB (nếu có)
- **Method:** DELETE
- **Response:** Success message

### 6.3. Quản lý Thành viên

#### GET `/clubs` - Lấy danh sách CLB để map với clubIds
- **File:** `src/components/admin/MemberManagement.js`
- **Line:** 59
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}` (optional)
- **Mục đích:** Admin lấy danh sách tất cả CLB để map clubIds với club names khi hiển thị thông tin user
- **Response:**
  ```json
  {
    "code": 1000,
    "result": [
      {
        "clubId": 1,
        "clubName": "CLB Lập trình",
        ...
      }
    ]
  }
  ```
- **Lưu ý:** Response được dùng để tạo clubsMap (clubId -> clubName) để hiển thị tên CLB trong danh sách users

#### GET `/users` - Lấy danh sách users (có pagination)
- **File:** `src/components/admin/MemberManagement.js`
- **Line:** 110
- **Method:** GET
- **Query Params:** 
  - `page`: số trang (0-based)
  - `size`: số lượng items mỗi trang (10, 20, 50, 100)
  - `sort`: field để sort và direction (VD: "createdAt,DESC" hoặc "fullName,ASC")
- **Headers:** `Authorization: Bearer {token}` (optional)
- **Mục đích:** Admin lấy danh sách tất cả users trong hệ thống với phân trang và sắp xếp
- **Response:**
  ```json
  {
    "code": 1000,
    "result": {
      "content": [
        {
          "userId": 1,
          "fullName": "Nguyễn Văn A",
          "email": "user@example.com",
          "studentCode": "SE12345",
          "clubIds": [1, 2],
          "active": true,
          ...
        }
      ],
      "totalElements": 100,
      "totalPages": 10
    }
  }
  ```
- **Lưu ý:** Response được map để hiển thị clubName từ clubsMap

#### DELETE `/users/{id}` - Xóa user (Deactivate)
- **File:** `src/components/admin/MemberManagement.js`
- **Line:** 309
- **Method:** DELETE
- **Path Parameter:** `{userId}` - ID của user cần xóa
- **Headers:** `Authorization: Bearer {token}` (required)
- **Mục đích:** Admin deactivate (soft delete) user khỏi hệ thống - đánh dấu user không còn hoạt động
- **Response:**
  ```json
  {
    "code": 1000,
    "message": "Xóa user thành công"
  }
  ```
- **Lưu ý:** Đây là soft delete, user không bị xóa hoàn toàn mà chỉ bị đánh dấu inactive (status: "Tạm dừng")

### 6.4. Quản lý Đăng ký (Registrations)

#### GET `/registrations/club/{clubId}` - Lấy đăng ký của CLB
- **File:** `src/components/leader/JoinRequestsList.js`
- **Line:** 143 (fetch), 267 (polling)
- **Method:** GET
- **Query Params:** 
  - `?status={status}` (optional) - Filter theo status: ChoDuyet, DaDuyet, TuChoi
  - Hoặc endpoint: `/registrations/club/{clubId}/status/{status}`
- **Headers:** `Authorization: Bearer {token}` (optional)
- **Mục đích:** Leader lấy danh sách yêu cầu tham gia CLB (có thể filter theo status)
- **Response:** Array of registration objects
- **Lưu ý:** 
  - Tự động filter ra các yêu cầu đã rời CLB (status: DaRoiCLB)
  - Tự động filter ra chính leader khỏi danh sách (nếu leader đã từng là member)

#### PUT `/registrations/approve` - Duyệt đăng ký
- **File:** `src/components/leader/JoinRequestsList.js`
- **Line:** 397
- **Method:** PUT
- **Headers:** `Authorization: Bearer {token}` (optional)
- **Mục đích:** Leader duyệt yêu cầu tham gia CLB (chuyển status từ ChoDuyet → DaDuyet hoặc TuChoi)
- **Request Body:**
  ```json
  {
    "subscriptionId": 123,
    "status": "DaDuyet" // hoặc "TuChoi"
  }
  ```
- **Response:** Updated registration object với status mới

#### PUT `/registrations/confirm-payment` - Xác nhận thanh toán
- **File:** `src/components/leader/JoinRequestsList.js`
- **Line:** 456
- **Method:** PUT
- **Headers:** `Authorization: Bearer {token}` (optional)
- **Mục đích:** Leader xác nhận đã thu phí từ thành viên (set isPaid = true)
- **Request Body:**
  ```json
  {
    "subscriptionId": 123,
    "paymentMethod": "Offline" // hoặc "Online"
  }
  ```
- **Response:** Updated registration object với isPaid = true

#### GET `/registers/{subscriptionId}` - Lấy chi tiết đăng ký
- **File:** `src/components/leader/JoinRequestsList.js`
- **Line:** 514
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}` (optional)
- **Mục đích:** Lấy chi tiết đăng ký để hiển thị trong modal (studentName, joinReason, etc.)
- **Path Parameter:** `{subscriptionId}` - ID của đăng ký
- **Response:** Registration object với đầy đủ thông tin
- **Lưu ý:** Có thể bị 403 nếu không có quyền, có retry logic

### 6.5. Quản lý Packages

#### GET `/packages/club/{clubId}` - Lấy packages của CLB
- **File:** `src/components/admin/ClubManagement.js` (có thể dùng)
- **Method:** GET
- **Response:** Array of packages

#### GET `/packages/{packageId}` - Xem chi tiết package
- **File:** `src/components/leader/ClubFeeManagement.js`
- **Line:** 91, 136
- **Method:** GET
- **Response:** Package object

#### PUT `/packages/{packageId}` - Cập nhật package
- **File:** `src/components/leader/ClubFeeManagement.js`
- **Line:** 264
- **Method:** PUT
- **Request Body:**
  ```json
  {
    "name": "Gói 1 tháng",
    "price": 50000,
    "term": 1,
    "description": "..."
  }
  ```

---

## 📝 GHI CHÚ QUAN TRỌNG

### Authentication
- Hầu hết API cần `Authorization: Bearer {token}` header
- Token lấy từ `localStorage.getItem('authToken')`
- Nếu 401/403: Có thể retry không có auth header (một số API)

### Response Format
- API thường trả về:
  ```json
  {
    "code": 1000, // hoặc 0 = success
    "message": "Success message",
    "result": { ... }
  }
  ```
- Check `code === 1000 || code === 0` để xác định success

### Error Handling
- Network errors: Retry logic (ví dụ: `fetchClubs` có MAX_RETRIES = 2)
- Timeout: Một số API có timeout 10 giây
- 400/401/403: Hiển thị message từ `data.message`

### State Management
- Sau mỗi API call thành công, thường refresh lại danh sách
- Local state được update ngay (optimistic update) để UX tốt hơn

---

## 🔗 Xem thêm

- **Chi tiết đầy đủ:** `API_ENDPOINTS_COMPLETE.md`
- **Luồng chi tiết:** `API_FLOWS.md`
- **Cấu trúc code:** `COMPONENTS_STRUCTURE.md`

---

**"File này giúp tra cứu nhanh API theo từng luồng người dùng!"** 📚



