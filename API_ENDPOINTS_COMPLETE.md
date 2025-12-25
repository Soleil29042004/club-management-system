# DANH SÁCH ĐẦY ĐỦ API ENDPOINTS (THEO CODE HIỆN TẠI)

## 📋 TỔNG QUAN
- Ước tính ~**40+ endpoint** duy nhất, **>60 API calls**.
- Phạm vi: toàn bộ các component trong `student/`, `leader/`, `admin/`, `shared/`, và `utils/`.

---

## 🔐 AUTHENTICATION & USERS

1) **POST** `/auth/token` — Login  
   - File: `src/pages/login.jsx` (`handleSubmit`)  
   - Body: `{ email, password }`

2) **POST** `/auth/logout` — Logout  
   - File: `src/App.js` (`handleLogout`)  
   - Headers: Bearer token

3) **GET** `/users/my-info` — Current user info  
   - File: `src/App.js` (auth check + polling role)  
   - File: `src/components/student/JoinRequestModal.js`  
   - File: `src/components/shared/Profile.js`  
   - File: `src/components/student/StudentJoinedClubs.js` (fallback userId)  
   - Headers: Bearer token

4) **PUT** `/users/my-info` — Update profile  
   - File: `src/components/shared/Profile.js` (`handleSaveInfo`)  
   - Body: `{ fullName, phoneNumber, studentCode, major, avatarUrl }`

5) **POST** `/users/change-password`  
   - File: `src/components/shared/Profile.js`

6) **POST** `/users` — Register new user  
   - File: `src/pages/register.jsx`

7) **POST** `/users/forgot-password`  
   - File: `src/pages/login.jsx`

8) **GET** `/users` — List users (pagination)  
   - File: `src/components/admin/MemberManagement.js`  
   - Query: `page`, `size`, `sort`

9) **DELETE** `/users/{id}` — Deactivate user  
   - File: `src/components/admin/MemberManagement.js`

---

## 🏢 CLUBS

10) **GET** `/clubs`  
    - File: `src/App.js`  
    - File: `src/components/student/StudentDashboard.js`  
    - File: `src/components/admin/MemberManagement.js`

11) **GET** `/clubs/{id}`  
    - File: `src/components/leader/ClubLeaderDashboard.js`  
    - File: `src/components/student/JoinRequestModal.js`

12) **PUT** `/clubs/{id}`  
    - File: `src/components/leader/ClubLeaderDashboard.js` (`handleFormSubmit`)  
    - Body: `{ logo, description, location }`

13) **GET** `/clubs/{id}/members`  
    - File: `src/components/leader/ClubLeaderDashboard.js`

14) **GET** `/clubs/{id}/stats`  
    - File: `src/components/leader/ClubLeaderDashboard.js`

15) **GET** `/clubs/user/{userId}/joined`  
    - File: `src/components/student/StudentJoinedClubs.js`

---

## 📦 PACKAGES

16) **GET** `/packages/club/{clubId}`  
    - File: `src/components/student/JoinRequestModal.js`  
    - File: `src/components/student/StudentDashboard.js`  
    - File: `src/components/leader/ClubFeeManagement.js`

17) **GET** `/packages/{packageId}`  
    - File: `src/components/leader/ClubFeeManagement.js` (view detail + edit)

18) **PUT** `/packages/{packageId}`  
    - File: `src/components/leader/ClubFeeManagement.js`  
    - Body: `{ packageName, price, term, description }`

---

## 📝 REGISTRATIONS (JOIN REQUESTS)

19) **POST** `/registers` — Tạo đơn tham gia CLB  
    - File: `src/components/student/StudentDashboard.js`  
    - Body: `{ clubId, packageId, joinReason, fullName, phone, studentId, major }`

20) **GET** `/registers/my-registrations`  
    - File: `src/components/student/StudentDashboard.js` (init + polling + refresh)  
    - File: `src/components/student/StudentMyClubRequests.js` (init + polling)

21) **GET** `/registers/{id}`  
    - File: `src/components/leader/JoinRequestsList.js`  
    - File: `src/components/leader/SubscriptionDetailModal.js`

22) **POST** `/registers/{clubId}/leave`  
    - File: `src/components/student/StudentJoinedClubs.js`

23) **POST** `/registers/{subscriptionId}/renew`  
    - File: `src/components/student/StudentJoinedClubs.js`

24) **DELETE** `/registers/{subscriptionId}`  
    - File: `src/components/student/StudentMyClubRequests.js`

---

## 👥 REGISTRATIONS MANAGEMENT (LEADER)

25) **GET** `/registrations/club/{clubId}`  
    - File: `src/components/leader/JoinRequestsList.js`  
    - Query optional: `status`

26) **GET** `/registrations/club/{clubId}/status/{status}`  
    - File: `src/components/leader/JoinRequestsList.js`

27) **PUT** `/registrations/approve`  
    - File: `src/components/leader/JoinRequestsList.js`  
    - Body: `{ subscriptionId, status }` (`DaDuyet` | `TuChoi`)

28) **PUT** `/registrations/confirm-payment`  
    - File: `src/components/leader/JoinRequestsList.js`  
    - Body: `{ subscriptionId, paymentMethod }`

29) **DELETE** `/registrations/club/{clubId}/user/{userId}`  
    - File: `src/components/leader/ClubLeaderDashboard.js`

30) **PUT** `/registrations/club/{clubId}/user/{userId}/role`  
    - File: `src/components/leader/ClubLeaderDashboard.js`  
    - Body: `{ newRole }`

---

## 🏛️ CLUB REQUESTS (MỞ CLB)

31) **POST** `/club-requests`  
    - File: `src/components/student/StudentDashboard.js`  
    - Body: `{ proposedName, purpose, category, location, email, defaultMembershipFee }`

32) **GET** `/club-requests`  
    - File: `src/components/admin/ClubRequestsManagement.js` (list + polling)  
    - Query: optional `status`

33) **PUT** `/club-requests/{requestId}/review`  
    - File: `src/components/admin/ClubRequestsManagement.js`  
    - Body: `{ status: 'ChapThuan' | 'TuChoi', adminNote }`

---

## 💳 PAYMENTS

34) **POST** `/payments/create-link`  
    - File: `src/components/student/StudentMyClubRequests.js`  
    - Body: `{ subscriptionId }`

---

## 💰 PAYMENT HISTORY & REVENUE

35) **GET** `/payment-history/my-history`  
    - File: `src/components/student/StudentPaymentHistory.js`  
    - Query: `page`, `size`, `sortBy=paymentDate`, `sortDir=DESC`

36) **GET** `/payment-history/club/{clubId}`  
    - File: `src/components/leader/ClubPaymentHistory.js`  
    - Query: `page`, `size`, `sortBy=paymentDate`, `sortDir=DESC`

37) **GET** `/payment-history/revenue/club/{clubId}/date-range`  
    - File: `src/components/leader/ClubLeaderDashboard.js`  
    - Query: `startDate`, `endDate`

38) **GET** `/payment-history/revenue/club/{clubId}`  
    - File: `src/components/leader/ClubLeaderDashboard.js`

39) **GET** `/payment-history/revenue/by-month/date-range`  
    - File: `src/components/admin/RevenueByMonth.js`  
    - Query: `startDate`, `endDate`

---

## 🧭 ADMIN DASHBOARD

40) **GET** `/admin/dashboard`  
    - File: `src/components/admin/Dashboard.js`  
    - Headers: Bearer token

---

## 📊 THEO FILE / COMPONENT (4 THƯ MỤC ĐƯỢC YÊU CẦU)

### student
- `student/StudentDashboard.js`: GET `/registers/my-registrations` (init + polling + refresh), GET `/club-requests` (polling), GET `/packages/club/{clubId}`, GET `/clubs`, POST `/registers`, POST `/club-requests`
- `student/StudentMyClubRequests.js`: GET `/registers/my-registrations` (init + polling), POST `/payments/create-link`, DELETE `/registers/{subscriptionId}`
- `student/StudentJoinedClubs.js`: GET `/users/my-info` (fallback), GET `/clubs/user/{userId}/joined`, POST `/registers/{clubId}/leave`, POST `/registers/{subscriptionId}/renew`
- `student/JoinRequestModal.js`: GET `/users/my-info`, GET `/clubs/{id}`, GET `/packages/club/{clubId}`
- `student/StudentPaymentHistory.js`: GET `/payment-history/my-history`
- (Các file khác trong student không gọi API trực tiếp)

### leader
- `leader/ClubLeaderDashboard.js`: GET `/users/my-info`, GET `/clubs/{id}`, GET `/clubs/{id}/members`, GET `/clubs/{id}/stats`, GET `/payment-history/revenue/club/{clubId}/date-range`, GET `/payment-history/revenue/club/{clubId}`, GET `/registrations/club/{clubId}` (polling payment), DELETE `/registrations/club/{clubId}/user/{userId}`, PUT `/registrations/club/{clubId}/user/{userId}/role`
- `leader/ClubFeeManagement.js`: GET `/packages/club/{clubId}`, GET `/packages/{packageId}`, PUT `/packages/{packageId}`
- `leader/JoinRequestsList.js`: GET `/registrations/club/{clubId}`, GET `/registrations/club/{clubId}/status/{status}`, PUT `/registrations/approve`, PUT `/registrations/confirm-payment`, GET `/registers/{subscriptionId}`
- `leader/SubscriptionDetailModal.js`: GET `/registers/{subscriptionId}`
- `leader/ClubPaymentHistory.js`: GET `/payment-history/club/{clubId}`
- (Các file còn lại trong leader không gọi API)

### admin
- `admin/MemberManagement.js`: GET `/clubs`, GET `/users?page={...}&size={...}&sort={...}`, DELETE `/users/{id}`
- `admin/ClubRequestsManagement.js`: GET `/club-requests`, PUT `/club-requests/{requestId}/review` (approve/reject)
- `admin/RevenueByMonth.js`: GET `/payment-history/revenue/by-month/date-range`
- `admin/Dashboard.js`: GET `/admin/dashboard`
- (Các file còn lại trong admin không gọi API)

### shared
- `shared/Profile.js`: GET `/users/my-info`, PUT `/users/my-info`, POST `/users/change-password`, GET `/registers/{subscriptionId}` (qua modal)
- `shared/Sidebar.js`, `shared/Toast.js`: không gọi API

---

## 🎯 API_BASE_URL

- Trung tâm: `src/utils/api.js` (`API_BASE_URL = 'https://clubmanage.azurewebsites.net/api'`).
- Các file vẫn hardcode `API_BASE_URL` thay vì import:
  - student: `StudentDashboard.js`, `StudentMyClubRequests.js`, `StudentJoinedClubs.js`, `StudentPaymentHistory.js`, `JoinRequestModal.js`
  - leader: `ClubLeaderDashboard.js`, `ClubFeeManagement.js`, `JoinRequestsList.js`, `SubscriptionDetailModal.js`, `ClubPaymentHistory.js`
  - admin: `ClubRequestsManagement.js`, `MemberManagement.js`, `RevenueByMonth.js`
  - shared: `Profile.js`
- Khuyến nghị: refactor dùng `utils/api.js` thống nhất, tránh hardcode URL đầy đủ.

---

## ⚠️ LƯU Ý
- Danh sách bám sát code hiện tại (không dùng line number cũ).  
- Có thể trích service layer chung cho user/profile, club requests, registrations, payments để giảm lặp.  

**Cập nhật:** 2025-12-24


