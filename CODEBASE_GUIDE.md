# HƯỚNG DẪN HIỂU CODEBASE - CHUẨN BỊ BẢO VỆ ĐỒ ÁN

## 🎯 MỤC ĐÍCH
Guide này giúp bạn:
- Hiểu luồng code (flow)
- Biết file code nằm ở đâu
- Biết file code làm gì
- Tìm API calls ở đâu
- Tìm biến khai báo ở đâu
- Tìm endpoints ở đâu

---

## 📁 CẤU TRÚC THƯ MỤC

```
club-management-system/
├── src/
│   ├── App.js                    # Entry point, routing, auth state
│   ├── index.js                  # React root render
│   ├── pages/                    # Page components
│   │   ├── home.jsx             # Trang chủ
│   │   ├── login.jsx            # Trang đăng nhập
│   │   └── register.jsx         # Trang đăng ký
│   ├── components/              # React components
│   │   ├── StudentDashboard.js  # Dashboard cho sinh viên
│   │   ├── ClubLeaderDashboard.js # Dashboard cho leader
│   │   ├── JoinRequestModal.js  # Modal gửi yêu cầu tham gia
│   │   └── ...                  # Các components khác
│   ├── data/
│   │   └── constants.js         # Constants, labels
│   └── ...
└── ...
```

---

## 🔍 CÁCH TÌM CODE THEO CHỨC NĂNG

### 1. TÌM API ENDPOINTS VÀ CALLS

#### **API Base URL:**
```bash
# Tìm tất cả chỗ khai báo API_BASE_URL
grep -r "API_BASE_URL" src/
```

**Kết quả:** Tìm thấy ở nhiều file:
- `src/App.js` (line 30)
- `src/components/StudentDashboard.js` (line 11)
- `src/components/ClubLeaderDashboard.js` (line 42)
- `src/pages/login.jsx` (line 32)
- `src/components/JoinRequestModal.js` (line 25)
- ... và nhiều file khác

**Vấn đề:** Hardcode ở nhiều nơi, nên refactor vào 1 file config.

---

#### **API Endpoints cụ thể:**

**Tìm endpoint `/auth/token` (Login):**
```bash
grep -r "/auth/token" src/
```
**Kết quả:** `src/pages/login.jsx` (line 94)

**Chi tiết:**
- File: `src/pages/login.jsx`
- Line: 94
- Function: `handleSubmit`
- Method: POST
- Body: `{ email, password }`

**Tìm endpoint `/registers` (Gửi yêu cầu tham gia):**
```bash
grep -r "/registers" src/
```
**Kết quả:** 
- `src/components/StudentDashboard.js` (line 451)
- `src/components/JoinRequestsList.js` (line 443)

**Tìm endpoint `/clubs` (Lấy danh sách CLB):**
```bash
grep -r "/clubs" src/
```
**Kết quả:**
- `src/App.js` (line 360)
- `src/components/StudentDashboard.js` (line 360)
- `src/components/ClubLeaderDashboard.js` (line 171)

---

### 2. TÌM BIẾN VÀ STATE

#### **Tìm biến `authToken`:**
```bash
grep -r "authToken" src/
```

**Kết quả:** Xuất hiện ở:
- `src/App.js` - Lưu/lấy token từ localStorage
- `src/pages/login.jsx` - Lưu token sau login
- Tất cả components cần authentication

**Cách sử dụng:**
```javascript
// Lấy token
const token = localStorage.getItem('authToken');

// Lưu token
localStorage.setItem('authToken', token);
```

---

#### **Tìm state `isAuthenticated`:**
```bash
grep -r "isAuthenticated" src/
```
**Kết quả:** `src/App.js` (line 18)

**Luồng:**
1. `App.js` quản lý `isAuthenticated`
2. Check token từ localStorage khi mount
3. Set `isAuthenticated = true` nếu có token hợp lệ
4. Render component theo role

---

#### **Tìm state `userRole`:**
```bash
grep -r "userRole" src/
```
**Kết quả:** `src/App.js` (line 19)

**Giá trị có thể:**
- `'admin'` - Quản trị viên
- `'student'` - Sinh viên
- `'club_leader'` - Leader CLB
- `null` - Chưa đăng nhập

---

### 3. TÌM FUNCTIONS VÀ METHODS

#### **Tìm function `parseJWTToken`:**
```bash
grep -r "parseJWTToken" src/
```
**Kết quả:**
- `src/App.js` (line 45) - Định nghĩa
- `src/pages/login.jsx` (line 50) - Định nghĩa riêng
- Được gọi ở nhiều nơi để decode token

---

#### **Tìm function `mapScopeToRole`:**
```bash
grep -r "mapScopeToRole" src/
```
**Kết quả:**
- `src/App.js` (line 64) - Định nghĩa
- `src/pages/login.jsx` (line 76) - Định nghĩa riêng
- Map scope từ JWT → role của app

---

### 4. TÌM COMPONENTS THEO CHỨC NĂNG

#### **Component Login:**
**File:** `src/pages/login.jsx`
**Chức năng:**
- Form đăng nhập
- Validate email/password
- Gọi API `/auth/token`
- Lưu token vào localStorage
- Parse JWT để lấy role
- Redirect theo role

**Luồng:**
```
User nhập email/password
  ↓
Validate form (line ~60+)
  ↓
POST /auth/token (line 94)
  ↓
Nhận token từ response
  ↓
Extract token (line 114)
  ↓
Parse JWT để lấy role (line 121)
  ↓
Map scope to role (line 131)
  ↓
Lưu token vào localStorage (line ~200+)
  ↓
Set isAuthenticated = true
  ↓
Redirect theo role
```

---

#### **Component StudentDashboard:**
**File:** `src/components/StudentDashboard.js`
**Chức năng:**
- Dashboard cho sinh viên
- Hiển thị danh sách CLB
- Gửi yêu cầu tham gia CLB
- Xem đơn đã gửi
- Xem CLB đã tham gia

**API calls:**
- `GET /clubs` - Lấy danh sách CLB (line 360)
- `GET /registers/my-registrations` - Lấy đơn đã gửi (line 64, 172, 552)
- `POST /registers` - Gửi yêu cầu tham gia (line 451)
- `GET /packages/club/{id}` - Lấy gói membership (line 303)

---

#### **Component ClubLeaderDashboard:**
**File:** `src/components/ClubLeaderDashboard.js`
**Chức năng:**
- Dashboard cho leader
- Quản lý CLB của mình
- Duyệt yêu cầu tham gia
- Quản lý thành viên
- Xem thống kê

**API calls:**
- `GET /clubs/{id}` - Lấy thông tin CLB (line 171)
- `GET /clubs/{id}/members` - Lấy danh sách thành viên (line 264)
- `GET /clubs/{id}/stats` - Lấy thống kê CLB (line 321)
- `PUT /clubs/{id}` - Cập nhật thông tin CLB (line 569)
- `GET /registrations/club/{clubId}` - Lấy yêu cầu tham gia (line 94, 204)
- `PUT /registrations/approve` - Duyệt yêu cầu (line 323)
- `PUT /registrations/confirm-payment` - Xác nhận thanh toán (line 382)

---

#### **Component JoinRequestModal:**
**File:** `src/components/JoinRequestModal.js`
**Chức năng:**
- Modal form gửi yêu cầu tham gia CLB
- Tự động điền thông tin từ API/localStorage
- Validate form
- Submit yêu cầu

**API calls:**
- `GET /users/my-info` - Lấy thông tin user (line 54)
- `GET /clubs/{id}` - Lấy thông tin CLB (line 101)
- `GET /packages/club/{id}` - Lấy gói membership (line 132)
- `POST /registers` - Gửi yêu cầu (qua onSubmit callback, line 451 trong StudentDashboard)

---

## 🔄 LUỒNG CODE CHÍNH

### LUỒNG 1: ĐĂNG NHẬP

```
1. User mở app
   ↓
2. App.js mount
   ↓
3. Check localStorage.getItem('authToken')
   ↓
4a. Có token → Parse JWT → Set isAuthenticated = true
4b. Không có token → Show Home page
   ↓
5. User click "Đăng nhập"
   ↓
6. Render Login component (src/pages/login.jsx)
   ↓
7. User nhập email/password → Submit
   ↓
8. POST /auth/token (line 94)
   ↓
9. Nhận token từ response
   ↓
10. Parse JWT để lấy role (line 121)
  ↓
11. localStorage.setItem('authToken', token) (line ~200+)
  ↓
12. localStorage.setItem('user', userData) (line ~200+)
   ↓
13. onLoginSuccess(role) → App.js
   ↓
14. Set isAuthenticated = true, userRole = role
   ↓
15. Render Dashboard theo role
```

---

### LUỒNG 2: SINH VIÊN GỬI YÊU CẦU THAM GIA CLB

```
1. StudentDashboard render
   ↓
2. Fetch danh sách CLB: GET /clubs (line 360)
   ↓
3. User click "Gửi yêu cầu tham gia"
   ↓
4. setShowJoinModal(true) → Render JoinRequestModal
   ↓
5. JoinRequestModal mount
   ↓
6. Fetch user info: GET /users/my-info (line 54)
  ↓
7. Fetch club detail: GET /clubs/{id} (line 101)
  ↓
8. Fetch packages: GET /packages/club/{id} (line 132)
   ↓
9. Tự động điền form từ API/localStorage
   ↓
10. User điền form → Submit
   ↓
11. Validate form (line 225)
   ↓
12. onSubmit(formData) → StudentDashboard.submitJoinRequest
   ↓
13. POST /registers với packageId và joinReason (line 451)
  ↓
14. Nhận response → Update joinRequests state
  ↓
15. Refresh: GET /registers/my-registrations (line 552)
   ↓
16. Show success toast
```

---

### LUỒNG 3: LEADER DUYỆT YÊU CẦU

```
1. ClubLeaderDashboard render
   ↓
2. Fetch club detail: GET /clubs/{id} (line 171)
  ↓
3. Fetch members: GET /clubs/{id}/members (line 264)
   ↓
4. Fetch join requests: GET /registers (JoinRequestsList)
   ↓
5. Leader click "Chấp nhận"
   ↓
6. PUT /registers/{id}/approve
   ↓
7. Update request status → 'DaDuyet'
   ↓
8. Refresh danh sách requests
   ↓
9. Show success toast
```

---

## 📋 CHECKLIST ĐỂ HIỂU CODEBASE

### ✅ Bước 1: Hiểu cấu trúc
- [ ] Đọc `src/App.js` - Entry point
- [ ] Đọc `src/pages/login.jsx` - Authentication flow
- [ ] Đọc `src/components/StudentDashboard.js` - Student features
- [ ] Đọc `src/components/ClubLeaderDashboard.js` - Leader features

### ✅ Bước 2: Trace API calls
- [ ] Tìm tất cả `fetch()` calls
- [ ] Liệt kê tất cả endpoints
- [ ] Hiểu request/response format
- [ ] Hiểu error handling

### ✅ Bước 3: Trace state flow
- [ ] Tìm tất cả `useState` hooks
- [ ] Hiểu state được pass như thế nào
- [ ] Hiểu state được update ở đâu
- [ ] Hiểu localStorage usage

### ✅ Bước 4: Trace component flow
- [ ] Hiểu component hierarchy
- [ ] Hiểu props flow
- [ ] Hiểu callback flow
- [ ] Hiểu routing logic

---

## 🛠️ CÔNG CỤ HỮU ÍCH

### 1. **VS Code Search:**
```
Ctrl+Shift+F (Windows/Linux)
Cmd+Shift+F (Mac)
```
Tìm text trong toàn bộ project

### 2. **VS Code Go to Definition:**
```
F12
```
Jump đến định nghĩa của function/variable

### 3. **VS Code Find References:**
```
Shift+F12
```
Tìm tất cả chỗ sử dụng function/variable

### 4. **Command Line Grep:**
```bash
# Tìm tất cả chỗ dùng "authToken"
grep -r "authToken" src/

# Tìm tất cả API calls
grep -r "fetch(" src/

# Tìm tất cả endpoints
grep -r "/api/" src/
```

---

## 📝 TEMPLATE ĐỂ TRẢ LỜI CÂU HỎI

### Khi được hỏi: "File X làm gì?"

**Template:**
```
"File [tên file] nằm ở [đường dẫn], có chức năng:
1. [Chức năng 1]
2. [Chức năng 2]
3. [Chức năng 3]

Luồng hoạt động:
- [Bước 1]
- [Bước 2]
- [Bước 3]

API calls:
- [Endpoint 1] - [Mục đích]
- [Endpoint 2] - [Mục đích]

State quản lý:
- [State 1] - [Mục đích]
- [State 2] - [Mục đích]"
```

### Khi được hỏi: "API X được gọi ở đâu?"

**Template:**
```
"API [tên endpoint] được gọi ở:
1. File: [tên file], line [số dòng]
   - Component: [tên component]
   - Function: [tên function]
   - Mục đích: [mô tả]

2. File: [tên file], line [số dòng]
   - Component: [tên component]
   - Function: [tên function]
   - Mục đích: [mô tả]"
```

---

## 🎯 PRACTICE EXERCISES

### Exercise 1: Trace Login Flow
1. Mở `src/pages/login.jsx`
2. Tìm function `handleSubmit`
3. Trace từng bước:
   - Validate form
   - API call
   - Parse response
   - Save token
   - Update state

### Exercise 2: Trace Join Request Flow
1. Mở `src/components/StudentDashboard.js`
2. Tìm function `submitJoinRequest`
3. Trace:
   - Form data từ đâu?
   - API call như thế nào?
   - Response được xử lý ra sao?
   - State được update như thế nào?

### Exercise 3: Find All API Calls
1. Dùng grep tìm tất cả `fetch(`
2. Liệt kê tất cả endpoints
3. Phân loại theo chức năng:
   - Authentication
   - Clubs
   - Registrations
   - Users

---

## 💡 TIPS ĐỂ BẢO VỆ TỐT

1. **Đọc code từ trên xuống:** Bắt đầu từ App.js
2. **Trace một flow hoàn chỉnh:** Từ user action đến API response
3. **Ghi chú:** Viết notes về các file quan trọng
4. **Practice:** Giải thích code cho người khác
5. **Draw diagrams:** Vẽ flow chart cho các luồng chính

---

**"Hiểu code của mình là bước đầu tiên để bảo vệ tốt!"** 📚

