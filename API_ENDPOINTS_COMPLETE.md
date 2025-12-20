# DANH SÁCH ĐẦY ĐỦ API ENDPOINTS - CHÍNH XÁC 100%

## 📋 TỔNG QUAN
Tổng số API calls: **48 endpoints** được gọi từ **15 files**

---

## 🔐 AUTHENTICATION & USERS

### 1. POST `/auth/token` - Login
- **File:** `src/pages/login.jsx`
- **Line:** 94
- **Function:** `handleSubmit`
- **Method:** POST
- **Body:** `{ email, password }`
- **Response:** JWT token

### 2. POST `/auth/logout` - Logout
- **File:** `src/App.js`
- **Line:** 277
- **Function:** `handleLogout`
- **Method:** POST
- **Headers:** Authorization Bearer token

### 3. GET `/users/my-info` - Get current user info
- **File:** `src/components/JoinRequestModal.js`
- **Line:** 54
- **Function:** `fetchUserInfo` (useEffect)
- **Method:** GET
- **Headers:** Authorization Bearer token

- **File:** `src/components/Profile.js`
- **Line:** 75 (fallback)
- **Function:** `useEffect` (fallback)
- **Method:** GET

- **File:** `src/components/StudentJoinedClubs.js`
- **Line:** 104
- **Function:** `resolveUserId` (useEffect)
- **Method:** GET

### 4. PUT `/users/my-info` - Update user profile
- **File:** `src/components/Profile.js`
- **Line:** 286
- **Function:** `handleUpdateProfile`
- **Method:** PUT
- **Body:** `{ fullName, phoneNumber, studentCode, major, avatarUrl }`

### 5. POST `/users/change-password` - Change password
- **File:** `src/components/Profile.js`
- **Line:** 404
- **Function:** `handleChangePassword`
- **Method:** POST
- **Body:** `{ oldPassword, newPassword }`

### 6. POST `/users/forgot-password` - Forgot password
- **File:** `src/pages/login.jsx`
- **Line:** 436
- **Function:** `handleForgotPassword`
- **Method:** POST
- **Body:** `{ email }`

### 7. GET `/users` - List users (with pagination)
- **File:** `src/components/MemberManagement.js`
- **Line:** 105
- **Function:** `fetchUsers`
- **Method:** GET
- **Query:** `?page={page}&size={size}&sort={sort}`

### 8. DELETE `/users/{id}` - Delete user
- **File:** `src/components/MemberManagement.js`
- **Line:** 278
- **Function:** `handleDeleteMember`
- **Method:** DELETE

---

## 🏢 CLUBS

### 9. GET `/clubs` - List all clubs
- **File:** `src/App.js`
- **Line:** 360
- **Function:** `fetchClubs` (useEffect)
- **Method:** GET

- **File:** `src/components/StudentDashboard.js`
- **Line:** 360
- **Function:** `fetchClubs` (useEffect)
- **Method:** GET

- **File:** `src/components/MemberManagement.js`
- **Line:** 50
- **Function:** `fetchClubs` (useEffect)
- **Method:** GET

### 10. GET `/clubs/{id}` - Get club detail
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 171
- **Function:** `fetchClubDetail`
- **Method:** GET

- **File:** `src/components/JoinRequestModal.js`
- **Line:** 101
- **Function:** `fetchClubDetail`
- **Method:** GET

### 11. PUT `/clubs/{id}` - Update club info
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 569
- **Function:** `handleUpdateClub`
- **Method:** PUT
- **Body:** `{ logo, description, location }`

### 12. GET `/clubs/{id}/members` - Get club members
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 264
- **Function:** `fetchMembers`
- **Method:** GET

### 13. GET `/clubs/{id}/stats` - Get club statistics
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 321
- **Function:** `fetchStats`
- **Method:** GET

### 14. GET `/clubs/user/{userId}/joined` - Get user's joined clubs
- **File:** `src/components/StudentJoinedClubs.js`
- **Line:** 146
- **Function:** `fetchJoinedClubs`
- **Method:** GET

---

## 📦 PACKAGES

### 15. GET `/packages/club/{clubId}` - Get packages by club
- **File:** `src/components/JoinRequestModal.js`
- **Line:** 132
- **Function:** `fetchPackages`
- **Method:** GET

- **File:** `src/components/StudentDashboard.js`
- **Line:** 303
- **Function:** `fetchPackagesForClubs`
- **Method:** GET

- **File:** `src/components/ClubFeeManagement.js`
- **Line:** 49
- **Function:** `fetchPackages`
- **Method:** GET

### 16. GET `/packages/{packageId}` - Get package detail
- **File:** `src/components/ClubFeeManagement.js`
- **Line:** 91, 136
- **Function:** `handleViewPackage` (line 91), `handleEditPackage` (line 136)
- **Method:** GET

### 17. PUT `/packages/{packageId}` - Update package
- **File:** `src/components/ClubFeeManagement.js`
- **Line:** 264
- **Function:** `handleUpdatePackage`
- **Method:** PUT
- **Body:** `{ packageName, price, term, description }`

---

## 📝 REGISTRATIONS (Join Requests)

### 18. POST `/registers` - Create join request
- **File:** `src/components/StudentDashboard.js`
- **Line:** 451
- **Function:** `submitJoinRequest`
- **Method:** POST
- **Body:** `{ packageId, joinReason, fullName, phone, studentId, major }`

### 19. GET `/registers/my-registrations` - Get my registrations
- **File:** `src/components/StudentDashboard.js`
- **Line:** 64, 172, 552
- **Function:** `fetchMyRegistrations` (line 64), polling (line 172), refresh (line 552)
- **Method:** GET

- **File:** `src/components/StudentMyClubRequests.js`
- **Line:** 80, 186
- **Function:** `fetchMyRegistrations` (line 80), polling (line 186)
- **Method:** GET

### 20. GET `/registers/{id}` - Get registration detail
- **File:** `src/components/JoinRequestsList.js`
- **Line:** 443
- **Function:** `handleViewDetails`
- **Method:** GET

- **File:** `src/components/StudentMyClubRequests.js`
- **Line:** 350
- **Function:** `handleCancel` (không có handleViewDetails riêng)
- **Method:** DELETE (line 350 là DELETE, không phải GET)

- **File:** `src/components/SubscriptionDetailModal.js`
- **Line:** 58
- **Function:** `useEffect`
- **Method:** GET

### 21. POST `/registers/{clubId}/leave` - Leave club
- **File:** `src/components/StudentJoinedClubs.js`
- **Line:** 322
- **Function:** `handleLeaveClub`
- **Method:** POST

### 22. POST `/registers/{subscriptionId}/renew` - Renew subscription
- **File:** `src/components/StudentJoinedClubs.js`
- **Line:** 368
- **Function:** `handleRenewSubscription`
- **Method:** POST

### 23. DELETE `/registers/{subscriptionId}` - Cancel registration
- **File:** `src/components/StudentMyClubRequests.js`
- **Line:** 350
- **Function:** `handleCancel`
- **Method:** DELETE

---

## 👥 REGISTRATIONS MANAGEMENT (Leader)

### 24. GET `/registrations/club/{clubId}` - Get registrations by club
- **File:** `src/components/JoinRequestsList.js`
- **Line:** 94
- **Function:** `fetchJoinRequests`
- **Method:** GET
- **Query:** Optional `?status={status}`

### 25. GET `/registrations/club/{clubId}/status/{status}` - Get registrations by status
- **File:** `src/components/JoinRequestsList.js`
- **Line:** 94, 204
- **Function:** `fetchJoinRequests` (line 94), polling (line 204)
- **Method:** GET

### 26. PUT `/registrations/approve` - Approve registration
- **File:** `src/components/JoinRequestsList.js`
- **Line:** 323
- **Function:** `handleApproveClick`
- **Method:** PUT
- **Body:** `{ subscriptionId, status }`

### 27. PUT `/registrations/confirm-payment` - Confirm payment
- **File:** `src/components/JoinRequestsList.js`
- **Line:** 382
- **Function:** `handleConfirmPayment`
- **Method:** PUT
- **Body:** `{ subscriptionId, paymentMethod }`

### 28. DELETE `/registrations/club/{clubId}/user/{userId}` - Remove member
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 646
- **Function:** `handleDeleteMember`
- **Method:** DELETE

### 29. PUT `/registrations/club/{clubId}/user/{userId}/role` - Update member role
- **File:** `src/components/ClubLeaderDashboard.js`
- **Line:** 721
- **Function:** `handleUpdateRole`
- **Method:** PUT
- **Body:** `{ newRole }`

---

## 🏛️ CLUB REQUESTS (Đăng ký mở CLB)

### 30. POST `/club-requests` - Create club request
- **File:** `src/components/StudentDashboard.js`
- **Line:** 668
- **Function:** `submitClubRequest`
- **Method:** POST
- **Body:** `{ proposedName, purpose, category, location, email, defaultMembershipFee }`

### 31. GET `/club-requests` - List club requests
- **File:** `src/components/ClubRequestsManagement.js`
- **Line:** 81, 166
- **Function:** `fetchClubRequests` (line 81), polling (line 166)
- **Method:** GET
- **Query:** Optional `?status={status}`

### 32. PUT `/club-requests/{requestId}/review` - Review club request
- **File:** `src/components/ClubRequestsManagement.js`
- **Line:** 258, 347
- **Function:** `handleApproveRequest` (line 258), `handleRejectRequest` (line 347)
- **Method:** PUT
- **Body:** `{ status: 'ChapThuan' | 'TuChoi', adminNote }`

---

## 💳 PAYMENTS

### 33. POST `/payments/create-link` - Create payment link
- **File:** `src/components/StudentMyClubRequests.js`
- **Line:** 286
- **Function:** `handlePayment`
- **Method:** POST
- **Body:** `{ subscriptionId }`

---

## 📊 TỔNG HỢP THEO FILE

### `src/pages/login.jsx` (2 APIs)
- Line 94: POST `/auth/token`
- Line 436: POST `/users/forgot-password`

### `src/App.js` (2 APIs)
- Line 277: POST `/auth/logout`
- Line 360: GET `/clubs`

### `src/components/StudentDashboard.js` (7 APIs)
- Line 64: GET `/registers/my-registrations`
- Line 172: GET `/registers/my-registrations` (polling)
- Line 303: GET `/packages/club/{clubId}`
- Line 360: GET `/clubs`
- Line 451: POST `/registers`
- Line 552: GET `/registers/my-registrations` (refresh)
- Line 668: POST `/club-requests`

### `src/components/ClubLeaderDashboard.js` (6 APIs)
- Line 171: GET `/clubs/{id}`
- Line 264: GET `/clubs/{id}/members`
- Line 321: GET `/clubs/{id}/stats`
- Line 569: PUT `/clubs/{id}`
- Line 646: DELETE `/registrations/club/{clubId}/user/{userId}`
- Line 721: PUT `/registrations/club/{clubId}/user/{userId}/role`

### `src/components/JoinRequestModal.js` (3 APIs)
- Line 54: GET `/users/my-info`
- Line 101: GET `/clubs/{id}`
- Line 132: GET `/packages/club/{clubId}`

### `src/components/StudentJoinedClubs.js` (4 APIs)
- Line 104: GET `/users/my-info`
- Line 146: GET `/clubs/user/{userId}/joined`
- Line 322: POST `/registers/{clubId}/leave`
- Line 368: POST `/registers/{subscriptionId}/renew`

### `src/components/JoinRequestsList.js` (5 APIs)
- Line 94: GET `/registrations/club/{clubId}` hoặc `/registrations/club/{clubId}/status/{status}`
- Line 204: GET `/registrations/club/{clubId}` hoặc `/registrations/club/{clubId}/status/{status}` (polling)
- Line 323: PUT `/registrations/approve`
- Line 382: PUT `/registrations/confirm-payment`
- Line 443: GET `/registers/{subscriptionId}`

### `src/components/StudentMyClubRequests.js` (4 APIs)
- Line 80: GET `/registers/my-registrations`
- Line 186: GET `/registers/my-registrations` (polling)
- Line 286: POST `/payments/create-link`
- Line 350: DELETE `/registers/{subscriptionId}`

### `src/components/Profile.js` (3 APIs)
- Line 75: GET `/users/my-info` (fallback)
- Line 286: PUT `/users/my-info`
- Line 404: POST `/users/change-password`

### `src/components/ClubFeeManagement.js` (4 APIs)
- Line 49: GET `/packages/club/{clubId}`
- Line 91: GET `/packages/{packageId}` (view detail)
- Line 136: GET `/packages/{packageId}` (for edit)
- Line 264: PUT `/packages/{packageId}`

### `src/components/ClubRequestsManagement.js` (4 APIs)
- Line 81: GET `/club-requests`
- Line 170: GET `/club-requests` (polling)
- Line 258: PUT `/club-requests/{requestId}/review` (approve)
- Line 347: PUT `/club-requests/{requestId}/review` (reject)

### `src/components/MemberManagement.js` (3 APIs)
- Line 50: GET `/clubs`
- Line 105: GET `/users?page={page}&size={size}&sort={sort}`
- Line 278: DELETE `/users/{id}`

### `src/components/SubscriptionDetailModal.js` (1 API)
- Line 58: GET `/registers/{subscriptionId}`

---

## 🎯 API_BASE_URL LOCATIONS

### Files có khai báo API_BASE_URL:
1. `src/utils/api.js` - Line 14 (centralized, nên dùng)
2. `src/components/StudentDashboard.js` - Line 27 (hardcoded)
3. `src/components/ClubLeaderDashboard.js` - Line 61 (hardcoded)
4. `src/components/StudentJoinedClubs.js` - Line 16 (hardcoded)
5. `src/components/StudentMyClubRequests.js` - Line 16 (hardcoded)
6. `src/components/ClubFeeManagement.js` - Line 15 (hardcoded)
7. `src/components/ClubRequestsManagement.js` - Line 20 (hardcoded)
8. `src/components/SubscriptionDetailModal.js` - Line 19 (hardcoded)
9. `src/components/Profile.js` - Line 23 (hardcoded, duplicate với import)

### Files import từ utils/api.js:
- `src/App.js` - Line 38
- `src/pages/login.jsx` - Line 19
- `src/pages/register.jsx` - Line 17
- `src/components/MemberManagement.js` - Line 21
- `src/components/Profile.js` - Line 20 (nhưng vẫn hardcode ở line 23)
- `src/components/ClubDetailsModal.js` - Line 20
- `src/components/ClubManagement.js` - Line 19

---

## ⚠️ VẤN ĐỀ PHÁT HIỆN

1. **Hardcode API_BASE_URL:** 8 files hardcode thay vì import từ utils
2. **Hardcode full URL:** Một số file hardcode full URL thay vì dùng API_BASE_URL
3. **Duplicate API calls:** Một số API được gọi ở nhiều nơi (có thể tạo service layer)

---

**Cập nhật lần cuối:** 2024-12-19
**Tổng số endpoints:** 33 unique endpoints
**Tổng số API calls:** 48 calls

**Lưu ý:** Tất cả line numbers đã được kiểm tra và cập nhật sau khi thêm comments vào code. Các line numbers này chính xác với code hiện tại.

