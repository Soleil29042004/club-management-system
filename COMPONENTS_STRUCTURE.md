# CẤU TRÚC COMPONENTS THEO ROLE

## 📁 Cấu trúc mới

```
src/components/
├── shared/              # Components dùng chung cho tất cả roles
│   ├── Toast.js         # ✅ Đã di chuyển
│   ├── Sidebar.js       # ✅ Đã di chuyển
│   └── Profile.js       # ⏳ Cần di chuyển (dùng chung)
│
├── student/             # Components cho Student role
│   ├── StudentDashboard.js
│   ├── StudentClubList.js
│   ├── StudentJoinedClubs.js
│   ├── StudentMyClubRequests.js
│   ├── JoinRequestModal.js
│   ├── StudentStats.js
│   └── StudentUnpaidFees.js
│
├── leader/              # Components cho Club Leader role
│   ├── ClubLeaderDashboard.js
│   ├── JoinRequestsList.js
│   ├── ClubFeeManagement.js
│   ├── SubscriptionDetailModal.js
│   ├── LeaderStats.js
│   ├── MemberManagement.js (nếu dùng cho leader)
│   └── MembersList.js
│
└── admin/              # Components cho Admin role
    ├── Dashboard.js
    ├── ClubManagement.js
    ├── ClubRequestsManagement.js
    ├── MemberManagement.js
    ├── ClubList.js
    ├── ClubForm.js
    ├── ClubInfo.js
    ├── ClubInfoForm.js
    ├── ClubDetailsModal.js
    ├── ClubActivities.js
    ├── RegisterClubModal.js
    ├── PaymentModal.js
    ├── MemberForm.js
    └── MemberList.js
```

## 🔄 Cách cập nhật imports

### Trong App.js:

**Trước:**
```javascript
import { ToastProvider, useToast } from './components/Toast';
import Sidebar from './components/Sidebar';
import StudentDashboard from './components/StudentDashboard';
import ClubLeaderDashboard from './components/ClubLeaderDashboard';
import Profile from './components/Profile';
```

**Sau:**
```javascript
import { ToastProvider, useToast } from './components/shared/Toast';
import Sidebar from './components/shared/Sidebar';
import StudentDashboard from './components/student/StudentDashboard';
import ClubLeaderDashboard from './components/leader/ClubLeaderDashboard';
import Profile from './components/shared/Profile';
```

### Trong các components khác:

**Ví dụ: StudentDashboard.js**

**Trước:**
```javascript
import { useToast } from './Toast';
import StudentClubList from './StudentClubList';
import JoinRequestModal from './JoinRequestModal';
```

**Sau:**
```javascript
import { useToast } from '../shared/Toast';
import StudentClubList from './StudentClubList';
import JoinRequestModal from './JoinRequestModal';
```

## 📝 Checklist Migration

### Phase 1: Shared Components ✅
- [x] Toast.js → `components/shared/Toast.js`
- [x] Sidebar.js → `components/shared/Sidebar.js`
- [ ] Profile.js → `components/shared/Profile.js`

### Phase 2: Student Components
- [ ] StudentDashboard.js → `components/student/StudentDashboard.js`
- [ ] StudentClubList.js → `components/student/StudentClubList.js`
- [ ] StudentJoinedClubs.js → `components/student/StudentJoinedClubs.js`
- [ ] StudentMyClubRequests.js → `components/student/StudentMyClubRequests.js`
- [ ] JoinRequestModal.js → `components/student/JoinRequestModal.js`
- [ ] StudentStats.js → `components/student/StudentStats.js`
- [ ] StudentUnpaidFees.js → `components/student/StudentUnpaidFees.js`

### Phase 3: Leader Components
- [ ] ClubLeaderDashboard.js → `components/leader/ClubLeaderDashboard.js`
- [ ] JoinRequestsList.js → `components/leader/JoinRequestsList.js`
- [ ] ClubFeeManagement.js → `components/leader/ClubFeeManagement.js`
- [ ] SubscriptionDetailModal.js → `components/leader/SubscriptionDetailModal.js`
- [ ] LeaderStats.js → `components/leader/LeaderStats.js`
- [ ] MembersList.js → `components/leader/MembersList.js`

### Phase 4: Admin Components
- [ ] Dashboard.js → `components/admin/Dashboard.js`
- [ ] ClubManagement.js → `components/admin/ClubManagement.js`
- [ ] ClubRequestsManagement.js → `components/admin/ClubRequestsManagement.js`
- [ ] MemberManagement.js → `components/admin/MemberManagement.js`
- [ ] Các components khác...

### Phase 5: Cập nhật imports
- [ ] Cập nhật App.js
- [ ] Cập nhật tất cả imports trong các components
- [ ] Test lại toàn bộ ứng dụng

## ⚠️ Lưu ý

1. **File cũ vẫn tồn tại** - Để đảm bảo không break code, các file cũ vẫn giữ nguyên
2. **Cập nhật từng bước** - Nên cập nhật imports từng nhóm một và test kỹ
3. **Backup trước** - Nên commit code hiện tại trước khi migration

## 🎯 Lợi ích

1. **Tổ chức rõ ràng** - Dễ tìm component theo role
2. **Maintainability** - Dễ maintain và scale
3. **Code splitting** - Có thể lazy load theo role
4. **Team collaboration** - Dễ phân công công việc theo role



