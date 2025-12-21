# CẤU TRÚC DỰ ÁN MỚI - THEO ROLE

## 📁 Cấu trúc thư mục mới

```
src/
├── app/                          # Application entry & routing
│   └── AppRoutes.jsx            # Main routing logic (sẽ refactor từ App.js)
│
├── components/                    # Shared UI components (không gắn role)
│   ├── Toast.js                  # Toast notification system
│   ├── Sidebar.js                # Navigation sidebar
│   └── ...                       # Các components UI chung khác
│
├── features/                      # Features organized by role
│   ├── auth/                     # Authentication features
│   │   ├── login/
│   │   │   └── LoginPage.jsx     # Login page (từ pages/login.jsx)
│   │   └── register/
│   │       └── RegisterPage.jsx  # Register page
│   │
│   ├── shared/                   # Shared utilities & constants
│   │   ├── utils/
│   │   │   ├── auth.js           # Auth utilities (JWT parsing, etc.)
│   │   │   └── clubMapper.js     # Club data mapper
│   │   └── constants.js          # Constants (categories, roles, etc.)
│   │
│   ├── student/                  # Student features
│   │   ├── dashboard/
│   │   │   └── StudentDashboard.js
│   │   ├── clubs/
│   │   │   ├── StudentClubList.js
│   │   │   ├── StudentJoinedClubs.js
│   │   │   └── JoinRequestModal.js
│   │   └── requests/
│   │       └── StudentMyClubRequests.js
│   │
│   ├── leader/                   # Club Leader features
│   │   ├── dashboard/
│   │   │   └── ClubLeaderDashboard.js
│   │   ├── registrations/
│   │   │   ├── JoinRequestsList.js
│   │   │   └── SubscriptionDetailModal.js
│   │   ├── members/
│   │   │   └── MemberManagement.js
│   │   └── fees/
│   │       └── ClubFeeManagement.js
│   │
│   └── admin/                    # Admin features
│       ├── dashboard/
│       │   └── Dashboard.js
│       ├── clubs/
│       │   └── ClubManagement.js
│       ├── members/
│       │   └── MemberManagement.js
│       └── requests/
│           └── ClubRequestsManagement.js
│
├── pages/                        # Entry pages (public routes)
│   └── home.jsx                  # Home page
│
├── services/                     # API Service Layer
│   ├── apiClient.js              # Base API client
│   ├── authService.js            # Auth APIs
│   ├── userService.js            # User APIs
│   ├── clubService.js            # Club APIs
│   ├── registrationService.js    # Registration APIs
│   ├── packageService.js         # Package APIs
│   ├── paymentService.js         # Payment APIs
│   └── clubRequestService.js     # Club Request APIs
│
└── utils/                        # Legacy utils (sẽ migrate dần)
    └── ...
```

## 🔄 Migration Plan

### Phase 1: Service Layer ✅
- [x] Tạo `services/` với tất cả API services
- [x] Tạo `features/shared/` với utilities và constants

### Phase 2: Auth Features
- [ ] Di chuyển `pages/login.jsx` → `features/auth/login/LoginPage.jsx`
- [ ] Di chuyển `pages/register.jsx` → `features/auth/register/RegisterPage.jsx`
- [ ] Cập nhật imports trong App.js

### Phase 3: Student Features
- [ ] Di chuyển Student components vào `features/student/`
- [ ] Cập nhật imports để dùng services mới

### Phase 4: Leader Features
- [ ] Di chuyển Leader components vào `features/leader/`
- [ ] Cập nhật imports để dùng services mới

### Phase 5: Admin Features
- [ ] Di chuyển Admin components vào `features/admin/`
- [ ] Cập nhật imports để dùng services mới

### Phase 6: Refactor App.js
- [ ] Tách routing logic vào `app/AppRoutes.jsx`
- [ ] Cleanup và optimize

## 📝 Import Paths

### Cũ:
```javascript
import { API_BASE_URL } from './utils/api';
import { parseJWTToken } from './utils/auth';
import StudentDashboard from './components/StudentDashboard';
```

### Mới:
```javascript
import { API_BASE_URL } from '../services/apiClient';
import { parseJWTToken } from '../shared/utils/auth';
import StudentDashboard from '../student/dashboard/StudentDashboard';
```

## 🎯 Benefits

1. **Tổ chức rõ ràng theo role** - Dễ tìm code theo chức năng
2. **Service layer** - Tách biệt API logic khỏi components
3. **Shared utilities** - Code dùng chung được tập trung
4. **Dễ maintain** - Cấu trúc rõ ràng, dễ scale
5. **Dễ test** - Services có thể test độc lập

## ⚠️ Lưu ý

- Các file cũ vẫn tồn tại để đảm bảo không break code
- Migration sẽ làm từng bước một
- Cần test kỹ sau mỗi phase migration



