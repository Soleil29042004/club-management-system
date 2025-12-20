# API QUICK LOOKUP - TRA CỨU NHANH API

## 🔍 TÌM API THEO CHỨC NĂNG

### Đăng nhập/Đăng xuất
```bash
# Login
grep -r "/auth/token" src/
→ src/pages/login.jsx:94

# Logout  
grep -r "/auth/logout" src/
→ src/App.js:386
```

### Quản lý User
```bash
# Get user info
grep -r "/users/my-info" src/
→ src/components/JoinRequestModal.js:54
→ src/components/Profile.js:75, 283
→ src/components/StudentJoinedClubs.js:104

# Update profile
grep -r "PUT.*users/my-info" src/
→ src/components/Profile.js:283

# Change password
grep -r "/users/change-password" src/
→ src/components/Profile.js:397
```

### Quản lý CLB
```bash
# List clubs
grep -r "GET.*/clubs\"" src/
→ src/App.js:354
→ src/components/StudentDashboard.js:354
→ src/components/MemberManagement.js:50

# Club detail
grep -r "/clubs/\${" src/
→ src/components/ClubLeaderDashboard.js:176
→ src/components/JoinRequestModal.js:98

# Club members
grep -r "/clubs/.*/members" src/
→ src/components/ClubLeaderDashboard.js:261
```

### Gửi yêu cầu tham gia
```bash
# Create join request
grep -r "POST.*/registers\"" src/
→ src/components/StudentDashboard.js:447

# My registrations
grep -r "/registers/my-registrations" src/
→ src/components/StudentDashboard.js:64, 172, 543
→ src/components/StudentMyClubRequests.js:80, 186

# Leave club
grep -r "/registers/.*/leave" src/
→ src/components/StudentJoinedClubs.js:317
```

### Duyệt yêu cầu (Leader)
```bash
# Approve request
grep -r "/registrations/approve" src/
→ src/components/JoinRequestsList.js:318

# Confirm payment
grep -r "/registrations/confirm-payment" src/
→ src/components/JoinRequestsList.js:373
```

---

## 📝 TEMPLATE TRẢ LỜI

### "API X được gọi ở đâu?"
```
"API [tên endpoint] được gọi ở:
1. File: [tên file], line [số]
   - Function: [tên function]
   - Mục đích: [mô tả]
   - Method: [GET/POST/PUT/DELETE]
   
2. File: [tên file], line [số]
   - Function: [tên function]
   - Mục đích: [mô tả]
   - Method: [GET/POST/PUT/DELETE]"
```

---

**Xem file `API_ENDPOINTS_COMPLETE.md` để có danh sách đầy đủ!**



