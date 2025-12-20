# API FLOWS - LUỒNG API THEO FLOW HOẠT ĐỘNG

## 📋 MỤC LỤC
1. [Login Flow](#1-login-flow)
2. [Student Browse & Join Club Flow](#2-student-browse--join-club-flow)
3. [Leader Approve Request Flow](#3-leader-approve-request-flow)
4. [Payment Flow](#4-payment-flow)
5. [Leave Club Flow](#5-leave-club-flow)
6. [Profile Management Flow](#6-profile-management-flow)
7. [Club Management Flow (Leader)](#7-club-management-flow-leader)
8. [Club Request Flow](#8-club-request-flow)

---

## 1. LOGIN FLOW

### Mô tả
Luồng đăng nhập của user, từ khi nhập email/password đến khi vào dashboard.

### Flow Diagram
```
User nhập email/password
  ↓
Validate form (client-side)
  ↓
POST /auth/token (line 94 - login.jsx)
  ↓
Nhận JWT token từ response
  ↓
Extract token từ response (line 114)
  ↓
Parse JWT để lấy role (line 121)
  ↓
Map scope to role (line 131)
  ↓
Lưu token vào localStorage (line ~200+)
  ↓
Lưu user data vào localStorage
  ↓
Gọi onLoginSuccess(role)
  ↓
App.js set isAuthenticated = true
  ↓
Redirect đến dashboard theo role
```

### API Calls Chi Tiết

#### Bước 1: POST `/auth/token` - Login
- **File:** `src/pages/login.jsx`
- **Line:** 94
- **Function:** `handleSubmit`
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
      "user": { ... }
    }
  }
  ```
- **Xử lý sau API:**
  - Extract token từ `data.result.token` hoặc `data.token` (line 114)
  - Parse JWT để lấy `scope` (line 121)
  - Map scope → role: `Student`, `ClubLeader`, `Admin` (line 131)
  - Lưu vào localStorage: `authToken`, `user` (line ~200+)
  - Gọi `onLoginSuccess(role)` để update App.js state

#### Bước 2: App.js Check Authentication
- **File:** `src/App.js`
- **Line:** 73-285
- **Function:** `useEffect` (on mount)
- **Logic:**
  - Đọc `localStorage.getItem('authToken')`
  - Parse JWT để validate token
  - Set `isAuthenticated = true` nếu token hợp lệ
  - Render dashboard theo `userRole`

### Logout Flow
- **File:** `src/App.js`
- **Line:** 277
- **Function:** `handleLogout`
- **API:** POST `/auth/logout` (optional, không block logout)
- **Actions:**
  - Clear localStorage (`authToken`, `user`)
  - Set `isAuthenticated = false`
  - Redirect về Home page

---

## 2. STUDENT BROWSE & JOIN CLUB FLOW

### Mô tả
Luồng sinh viên xem danh sách CLB, chọn CLB, và gửi yêu cầu tham gia.

### Flow Diagram
```
StudentDashboard mount
  ↓
GET /clubs (line 360 - StudentDashboard.js)
  ↓
Hiển thị danh sách CLB
  ↓
User click "Gửi yêu cầu tham gia"
  ↓
Mở JoinRequestModal
  ↓
GET /users/my-info (line 54 - JoinRequestModal.js)
  ↓
GET /clubs/{id} (line 101 - JoinRequestModal.js)
  ↓
GET /packages/club/{clubId} (line 132 - JoinRequestModal.js)
  ↓
Tự động điền form từ API/localStorage
  ↓
User điền form → Submit
  ↓
POST /registers (line 451 - StudentDashboard.js)
  ↓
Nhận subscriptionId từ response
  ↓
GET /registers/my-registrations (line 552 - refresh)
  ↓
Cập nhật UI: Hiển thị "Đang chờ duyệt"
```

### API Calls Chi Tiết

#### Bước 1: GET `/clubs` - List All Clubs
- **File:** `src/components/StudentDashboard.js`
- **Line:** 360
- **Function:** `fetchClubs` (useEffect)
- **Method:** GET
- **Headers:** `Content-Type: application/json`
- **Response:**
  ```json
  {
    "code": 1000,
    "result": [
      {
        "clubId": 1,
        "name": "CLB Lập trình",
        "description": "...",
        "category": "Technology",
        "memberCount": 50,
        ...
      }
    ]
  }
  ```
- **Xử lý:**
  - Normalize club data (line 378)
  - Set state `clubs` (line 382)
  - Fetch packages cho mỗi club để hiển thị fee (line 386)

#### Bước 2: GET `/users/my-info` - Get User Info
- **File:** `src/components/JoinRequestModal.js`
- **Line:** 54
- **Function:** `fetchUserInfo` (useEffect)
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

#### Bước 3: GET `/clubs/{id}` - Get Club Detail
- **File:** `src/components/JoinRequestModal.js`
- **Line:** 101
- **Function:** `fetchClubDetail` (useEffect)
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Club object với đầy đủ thông tin
- **Mục đích:** Hiển thị thông tin CLB trong modal

#### Bước 4: GET `/packages/club/{clubId}` - Get Club Packages
- **File:** `src/components/JoinRequestModal.js`
- **Line:** 132
- **Function:** `fetchPackages` (useEffect)
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
- **Mục đích:** Hiển thị các gói membership để user chọn

#### Bước 5: POST `/registers` - Create Join Request
- **File:** `src/components/StudentDashboard.js`
- **Line:** 451
- **Function:** `submitJoinRequest`
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
      "term": 1,
      "isPaid": false,
      ...
    }
  }
  ```
- **Xử lý:**
  - Tạo `newRequest` object từ response (line 489-519)
  - Update state `joinRequests` (line 522-540)
  - Refresh danh sách requests (line 552)
  - Show success toast

#### Bước 6: GET `/registers/my-registrations` - Refresh My Registrations
- **File:** `src/components/StudentDashboard.js`
- **Line:** 64, 172, 552
- **Function:** `fetchMyRegistrations`
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Array of registration objects
- **Mục đích:** Refresh danh sách đơn đã gửi sau khi tạo mới

---

## 3. LEADER APPROVE REQUEST FLOW

### Mô tả
Luồng leader xem yêu cầu tham gia, duyệt/từ chối, và xác nhận thanh toán.

### Flow Diagram
```
ClubLeaderDashboard mount
  ↓
GET /clubs/{id} (line 171 - ClubLeaderDashboard.js)
  ↓
GET /registrations/club/{clubId} (line 94 - JoinRequestsList.js)
  ↓
Hiển thị danh sách yêu cầu
  ↓
Leader click "Chấp nhận"
  ↓
PUT /registrations/approve (line 323 - JoinRequestsList.js)
  ↓
Update status = "DaDuyet"
  ↓
Refresh danh sách requests
  ↓
[Optional] Leader xác nhận thanh toán
  ↓
PUT /registrations/confirm-payment (line 382)
  ↓
Update isPaid = true
```

### API Calls Chi Tiết

#### Bước 1: GET `/clubs/{id}` - Get Club Detail
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 171
- **Function:** `fetchClubDetail`
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Club object với thông tin đầy đủ
- **Mục đích:** Hiển thị thông tin CLB của leader

#### Bước 2: GET `/registrations/club/{clubId}` - Get Club Registrations
- **File:** `src/components/JoinRequestsList.js`
- **Line:** 94, 204
- **Function:** `fetchRegistrations`
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Query Params:** `?status={status}` (optional, để filter)
- **Response:**
  ```json
  {
    "code": 1000,
    "result": [
      {
        "subscriptionId": 123,
        "clubId": 1,
        "clubName": "CLB Lập trình",
        "studentName": "Nguyễn Văn A",
        "status": "ChoDuyet",
        "isPaid": false,
        "packageId": 1,
        "price": 50000,
        ...
      }
    ]
  }
  ```
- **Xử lý:** Set state `apiRequests` để hiển thị danh sách

#### Bước 3: GET `/registers/{id}` - Get Registration Detail
- **File:** `src/components/JoinRequestsList.js`
- **Line:** 443
- **Function:** `handleViewDetails`
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Registration object với đầy đủ thông tin
- **Mục đích:** Hiển thị chi tiết đơn trong modal
- **Lưu ý:** Có retry logic nếu gặp 401/403 (thử lại không có auth header)

#### Bước 4: PUT `/registrations/approve` - Approve Request
- **File:** `src/components/JoinRequestsList.js`
- **Line:** 323
- **Function:** `updateStatus` (với status = "DaDuyet")
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
    "subscriptionId": 123,
    "status": "DaDuyet"
  }
  ```
- **Response:**
  ```json
  {
    "code": 1000,
    "message": "Duyệt thành công",
    "result": {
      "subscriptionId": 123,
      "status": "DaDuyet",
      ...
    }
  }
  ```
- **Xử lý:**
  - Update local state `apiRequests` (line 348-352)
  - Update `selectedRequest` nếu đang xem chi tiết (line 353-355)
  - Refresh danh sách

#### Bước 5: PUT `/registrations/confirm-payment` - Confirm Payment
- **File:** `src/components/JoinRequestsList.js`
- **Line:** 382
- **Function:** `handleConfirmPayment`
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
    "subscriptionId": 123,
    "paymentMethod": "Offline" // hoặc "Online"
  }
  ```
- **Response:**
  ```json
  {
    "code": 1000,
    "result": {
      "subscriptionId": 123,
      "isPaid": true,
      "paymentMethod": "Offline",
      ...
    }
  }
  ```
- **Mục đích:** Leader xác nhận đã thu phí từ thành viên

---

## 4. PAYMENT FLOW

### Mô tả
Luồng thanh toán phí tham gia CLB sau khi đơn được duyệt.

### Flow Diagram
```
Student xem đơn đã được duyệt (DaDuyet)
  ↓
Status = "DaDuyet" && isPaid = false
  ↓
Hiển thị nút "Thanh toán"
  ↓
User click "Thanh toán"
  ↓
POST /payments/create-link (line 286 - StudentMyClubRequests.js)
  ↓
Nhận paymentLink hoặc qrCode từ response
  ↓
Mở paymentLink trong tab mới (nếu có)
  ↓
User thanh toán trên trang payment
  ↓
[Backend callback] Update isPaid = true
  ↓
Student refresh trang → isPaid = true
```

### API Calls Chi Tiết

#### Bước 1: POST `/payments/create-link` - Create Payment Link
- **File:** `src/components/StudentMyClubRequests.js`
- **Line:** 286
- **Function:** `handlePayment`
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
      "qrCode": "data:image/png;base64,..." // optional
    }
  }
  ```
- **Xử lý:**
  - Nếu có `paymentLink`: Mở trong tab mới (line 308)
  - Nếu có `qrCode`: Hiển thị QR code
  - Show toast notification

#### Bước 2: Refresh Registration Status
- **File:** `src/components/StudentMyClubRequests.js`
- **Line:** 80, 186
- **Function:** `fetchMyRegistrations`
- **API:** GET `/registers/my-registrations`
- **Mục đích:** Kiểm tra `isPaid` đã được update chưa sau khi thanh toán

---

## 5. LEAVE CLUB FLOW

### Mô tả
Luồng sinh viên rời khỏi CLB mà mình đang tham gia.

### Flow Diagram
```
Student xem danh sách CLB đã tham gia
  ↓
GET /clubs/user/{userId}/joined (line 146 - StudentJoinedClubs.js)
  ↓
Hiển thị danh sách CLB với nút "Rời CLB"
  ↓
Điều kiện: isActive && role = "Thành viên" (không phải Chủ tịch)
  ↓
User click "Rời CLB"
  ↓
Confirm dialog
  ↓
POST /registers/{clubId}/leave (line 322 - StudentJoinedClubs.js)
  ↓
Nhận response thành công
  ↓
Remove club khỏi danh sách joined clubs
  ↓
Show success toast
```

### API Calls Chi Tiết

#### Bước 1: GET `/clubs/user/{userId}/joined` - Get Joined Clubs
- **File:** `src/components/StudentJoinedClubs.js`
- **Line:** 146
- **Function:** `fetchJoinedClubs` (useEffect)
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
        "clubRole": "Thành viên", // hoặc "Chủ tịch"
        "isActive": true,
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        ...
      }
    ]
  }
  ```
- **Xử lý:** Set state `clubs` để hiển thị

#### Bước 2: Check Eligibility
- **File:** `src/components/StudentJoinedClubs.js`
- **Line:** 206-214
- **Function:** `canLeaveClub`
- **Logic:**
  ```javascript
  const isActive = club.isActive !== false && (!endDate || endDate >= now);
  const isMember = club.clubRole.toLowerCase() === 'thành viên';
  return isActive && isMember; // Chỉ thành viên active mới được rời
  ```

#### Bước 3: POST `/registers/{clubId}/leave` - Leave Club
- **File:** `src/components/StudentJoinedClubs.js`
- **Line:** 322
- **Function:** `handleLeaveClub`
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
- **Xử lý:**
  - Remove club khỏi state `clubs` (line 333)
  - Show success toast
  - Update UI: Club sẽ hiện lại nút "Gửi yêu cầu tham gia" ở StudentClubList

---

## 6. PROFILE MANAGEMENT FLOW

### Mô tả
Luồng user xem và cập nhật thông tin profile, đổi mật khẩu.

### Flow Diagram
```
User vào trang Profile
  ↓
GET /users/my-info (line 75 - Profile.js, fallback)
  ↓
Hiển thị form với thông tin hiện tại
  ↓
User chỉnh sửa thông tin
  ↓
PUT /users/my-info (line 286 - Profile.js)
  ↓
Update localStorage user data
  ↓
Show success toast
```

### API Calls Chi Tiết

#### Bước 1: GET `/users/my-info` - Get User Info
- **File:** `src/components/Profile.js`
- **Line:** 75 (fallback, nếu không có từ localStorage)
- **Function:** `useEffect`
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:** User object với đầy đủ thông tin

#### Bước 2: PUT `/users/my-info` - Update Profile
- **File:** `src/components/Profile.js`
- **Line:** 286
- **Function:** `handleUpdateProfile`
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
- **Xử lý:**
  - Update localStorage `user` data
  - Show success toast

#### Bước 3: POST `/users/change-password` - Change Password
- **File:** `src/components/Profile.js`
- **Line:** 404
- **Function:** `handleChangePassword`
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

#### Bước 4: POST `/users/forgot-password` - Forgot Password
- **File:** `src/pages/login.jsx`
- **Line:** 436
- **Function:** `handleForgotPassword`
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

## 7. CLUB MANAGEMENT FLOW (LEADER)

### Mô tả
Luồng leader quản lý CLB: xem thống kê, cập nhật thông tin, quản lý thành viên.

### Flow Diagram
```
ClubLeaderDashboard mount
  ↓
GET /clubs/{id} (line 171 - ClubLeaderDashboard.js)
  ↓
GET /clubs/{id}/members (line 264 - ClubLeaderDashboard.js)
  ↓
GET /clubs/{id}/stats (line 321 - ClubLeaderDashboard.js)
  ↓
Hiển thị dashboard với thông tin CLB
  ↓
[Optional] Leader cập nhật thông tin CLB
  ↓
PUT /clubs/{id} (line 569 - ClubLeaderDashboard.js)
  ↓
[Optional] Leader thay đổi role thành viên
  ↓
PUT /registrations/club/{clubId}/user/{userId}/role (line 721)
  ↓
[Optional] Leader xóa thành viên
  ↓
DELETE /registrations/club/{clubId}/user/{userId} (line 646)
```

### API Calls Chi Tiết

#### Bước 1: GET `/clubs/{id}` - Get Club Detail
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 171
- **Function:** `fetchClubDetail`
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Club object với đầy đủ thông tin

#### Bước 2: GET `/clubs/{id}/members` - Get Club Members
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 264
- **Function:** `fetchMembers`
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "code": 1000,
    "result": [
      {
        "userId": 1,
        "fullName": "Nguyễn Văn A",
        "clubRole": "Thành viên",
        "isActive": true,
        ...
      }
    ]
  }
  ```

#### Bước 3: GET `/clubs/{id}/stats` - Get Club Statistics
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 321
- **Function:** `fetchStats`
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "code": 1000,
    "result": {
      "totalMembers": 50,
      "activeMembers": 45,
      "pendingRequests": 5,
      "totalRevenue": 5000000,
      ...
    }
  }
  ```

#### Bước 4: PUT `/clubs/{id}` - Update Club
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 569
- **Function:** `handleUpdateClub`
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
    "name": "CLB Lập trình",
    "description": "...",
    "category": "Technology",
    ...
  }
  ```

#### Bước 5: PUT `/registrations/club/{clubId}/user/{userId}/role` - Update Member Role
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 721
- **Function:** `handleUpdateMemberRole`
- **Method:** PUT
- **Request Body:**
  ```json
  {
    "role": "Phó Chủ tịch" // hoặc "Thành viên", "Chủ tịch"
  }
  ```

#### Bước 6: DELETE `/registrations/club/{clubId}/user/{userId}` - Remove Member
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 646
- **Function:** `handleRemoveMember`
- **Method:** DELETE
- **Response:**
  ```json
  {
    "code": 1000,
    "message": "Xóa thành viên thành công"
  }
  ```

---

## 8. CLUB REQUEST FLOW

### Mô tả
Luồng sinh viên tạo yêu cầu thành lập CLB mới và admin duyệt.

### Flow Diagram
```
Student tạo yêu cầu thành lập CLB
  ↓
POST /club-requests (line 668 - StudentDashboard.js)
  ↓
Admin xem danh sách yêu cầu
  ↓
GET /club-requests (line 81 - ClubRequestsManagement.js)
  ↓
Admin duyệt/từ chối
  ↓
PUT /club-requests/{requestId}/review (line 258, 347)
  ↓
Update status = "Approved" hoặc "Rejected"
```

### API Calls Chi Tiết

#### Bước 1: POST `/club-requests` - Create Club Request
- **File:** `src/components/StudentDashboard.js`
- **Line:** 668
- **Function:** `handleCreateClubRequest`
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
    "description": "...",
    "category": "Technology",
    "reason": "Lý do thành lập CLB"
  }
  ```

#### Bước 2: GET `/club-requests` - List Club Requests
- **File:** `src/components/ClubRequestsManagement.js`
- **Line:** 81, 170
- **Function:** `fetchClubRequests`
- **Method:** GET
- **Headers:** `Authorization: Bearer {token}`
- **Response:** Array of club request objects

#### Bước 3: PUT `/club-requests/{requestId}/review` - Review Request
- **File:** `src/components/ClubRequestsManagement.js`
- **Line:** 258, 347
- **Function:** `handleReviewRequest`
- **Method:** PUT
- **Request Body:**
  ```json
  {
    "status": "Approved", // hoặc "Rejected"
    "reviewComment": "Lý do duyệt/từ chối"
  }
  ```

---

## 📝 GHI CHÚ QUAN TRỌNG

### Error Handling
- Tất cả API calls đều có try-catch để xử lý lỗi
- Network errors thường có retry logic (ví dụ: `fetchClubs` có MAX_RETRIES = 2)
- Timeout: Một số API có timeout 10 giây (ví dụ: `fetchClubs`)

### Authentication
- Hầu hết API cần `Authorization: Bearer {token}` header
- Token được lấy từ `localStorage.getItem('authToken')`
- Nếu 401/403: Có thể retry không có auth header (ví dụ: `handleViewDetails`)

### State Management
- Sau mỗi API call thành công, thường refresh lại danh sách để đảm bảo data mới nhất
- Local state được update ngay lập tức để UX tốt hơn (optimistic update)

### Response Format
- API thường trả về format:
  ```json
  {
    "code": 1000, // hoặc 0 = success
    "message": "Success message",
    "result": { ... }
  }
  ```
- Check `code === 1000 || code === 0` để xác định success

---

**"Hiểu flow API giúp debug và bảo vệ đồ án tốt hơn!"** 🚀

