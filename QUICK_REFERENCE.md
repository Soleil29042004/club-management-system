# QUICK REFERENCE - TRA CỨU NHANH

## 🔍 TÌM NHANH THEO CHỨC NĂNG

### Authentication & Login
| Chức năng | File | Line | Mô tả |
|-----------|------|------|-------|
| Login form | `src/pages/login.jsx` | 85-103 | Handle submit login |
| API login | `src/pages/login.jsx` | 94 | POST /auth/token |
| Parse JWT | `src/pages/login.jsx` | 121 | Parse token để lấy role |
| Save token | `src/pages/login.jsx` | ~200+ | localStorage.setItem('authToken') |
| Check auth | `src/App.js` | 73-285 | Check token khi mount |

### Student Features
| Chức năng | File | Line | Mô tả |
|-----------|------|------|-------|
| Student Dashboard | `src/components/StudentDashboard.js` | - | Main dashboard |
| List clubs | `src/components/StudentDashboard.js` | 360 | GET /clubs |
| Join request | `src/components/StudentDashboard.js` | 451 | POST /registers |
| My registrations | `src/components/StudentDashboard.js` | 64 | GET /registers/my-registrations |
| Joined clubs | `src/components/StudentJoinedClubs.js` | 146 | GET /clubs/user/{id}/joined |
| Leave club | `src/components/StudentJoinedClubs.js` | 322 | POST /registers/{clubId}/leave |

### Leader Features
| Chức năng | File | Line | Mô tả |
|-----------|------|------|-------|
| Leader Dashboard | `src/components/ClubLeaderDashboard.js` | - | Main dashboard |
| Club detail | `src/components/ClubLeaderDashboard.js` | 171 | GET /clubs/{id} |
| Members list | `src/components/ClubLeaderDashboard.js` | 264 | GET /clubs/{id}/members |
| Approve request | `src/components/JoinRequestsList.js` | 323 | PUT /registrations/approve |
| Confirm payment | `src/components/JoinRequestsList.js` | 382 | PUT /registrations/confirm-payment |

### API Endpoints (33 unique endpoints)
| Endpoint | Method | File | Line | Mô tả |
|----------|--------|------|------|-------|
| **Authentication** |
| `/auth/token` | POST | `src/pages/login.jsx` | 94 | Login |
| `/auth/logout` | POST | `src/App.js` | 277 | Logout |
| **Users** |
| `/users/my-info` | GET | `src/components/JoinRequestModal.js` | 54 | Get user info |
| `/users/my-info` | PUT | `src/components/Profile.js` | 286 | Update profile |
| `/users/change-password` | POST | `src/components/Profile.js` | 404 | Change password |
| `/users/forgot-password` | POST | `src/pages/login.jsx` | 436 | Forgot password |
| `/users` | GET | `src/components/MemberManagement.js` | 105 | List users (paginated) |
| `/users/{id}` | DELETE | `src/components/MemberManagement.js` | 278 | Delete user |
| **Clubs** |
| `/clubs` | GET | `src/App.js` | 360 | List all clubs |
| `/clubs` | GET | `src/components/StudentDashboard.js` | 360 | List all clubs |
| `/clubs/{id}` | GET | `src/components/ClubLeaderDashboard.js` | 171 | Club detail |
| `/clubs/{id}` | GET | `src/components/JoinRequestModal.js` | 101 | Club detail |
| `/clubs/{id}` | PUT | `src/components/ClubLeaderDashboard.js` | 569 | Update club |
| `/clubs/{id}/members` | GET | `src/components/ClubLeaderDashboard.js` | 264 | Club members |
| `/clubs/{id}/stats` | GET | `src/components/ClubLeaderDashboard.js` | 321 | Club statistics |
| `/clubs/user/{userId}/joined` | GET | `src/components/StudentJoinedClubs.js` | 146 | User's joined clubs |
| **Packages** |
| `/packages/club/{clubId}` | GET | `src/components/JoinRequestModal.js` | 132 | Club packages |
| `/packages/club/{clubId}` | GET | `src/components/StudentDashboard.js` | 303 | Club packages |
| `/packages/club/{clubId}` | GET | `src/components/ClubFeeManagement.js` | 49 | Club packages |
| `/packages/{packageId}` | GET | `src/components/ClubFeeManagement.js` | 91, 136 | Package detail |
| `/packages/{packageId}` | PUT | `src/components/ClubFeeManagement.js` | 264 | Update package |
| **Registrations** |
| `/registers` | POST | `src/components/StudentDashboard.js` | 451 | Create join request |
| `/registers/my-registrations` | GET | `src/components/StudentDashboard.js` | 64, 172, 552 | My registrations |
| `/registers/my-registrations` | GET | `src/components/StudentMyClubRequests.js` | 80, 186 | My registrations |
| `/registers/{id}` | GET | `src/components/JoinRequestsList.js` | 443 | Registration detail |
| `/registers/{subscriptionId}` | GET | `src/components/SubscriptionDetailModal.js` | 58 | Registration detail |
| `/registers/{clubId}/leave` | POST | `src/components/StudentJoinedClubs.js` | 322 | Leave club |
| `/registers/{subscriptionId}/renew` | POST | `src/components/StudentJoinedClubs.js` | 368 | Renew subscription |
| `/registers/{subscriptionId}` | DELETE | `src/components/StudentMyClubRequests.js` | 350 | Cancel registration |
| **Registrations Management (Leader)** |
| `/registrations/club/{clubId}` | GET | `src/components/JoinRequestsList.js` | 94, 204 | Club registrations |
| `/registrations/club/{clubId}/status/{status}` | GET | `src/components/JoinRequestsList.js` | 94, 204 | Filtered registrations |
| `/registrations/approve` | PUT | `src/components/JoinRequestsList.js` | 323 | Approve registration |
| `/registrations/confirm-payment` | PUT | `src/components/JoinRequestsList.js` | 382 | Confirm payment |
| `/registrations/club/{clubId}/user/{userId}` | DELETE | `src/components/ClubLeaderDashboard.js` | 646 | Remove member |
| `/registrations/club/{clubId}/user/{userId}/role` | PUT | `src/components/ClubLeaderDashboard.js` | 721 | Update member role |
| **Club Requests** |
| `/club-requests` | POST | `src/components/StudentDashboard.js` | 668 | Create club request |
| `/club-requests` | GET | `src/components/ClubRequestsManagement.js` | 81, 170 | List club requests |
| `/club-requests/{requestId}/review` | PUT | `src/components/ClubRequestsManagement.js` | 258, 347 | Review request |
| **Payments** |
| `/payments/create-link` | POST | `src/components/StudentMyClubRequests.js` | 286 | Create payment link |

### State Management
| State | File | Line | Mô tả |
|-------|------|------|-------|
| `isAuthenticated` | `src/App.js` | 18 | Auth status |
| `userRole` | `src/App.js` | 19 | User role |
| `clubs` | `src/App.js` | 24 | List of clubs |
| `joinRequests` | `src/components/StudentDashboard.js` | 12 | Join requests |
| `selectedClub` | `src/components/StudentDashboard.js` | 21 | Selected club |

### LocalStorage Keys
| Key | File | Line | Mô tả |
|-----|------|------|-------|
| `authToken` | `src/pages/login.jsx` | 212 | JWT token |
| `user` | `src/pages/login.jsx` | 213 | User data |
| `joinRequests` | `src/components/StudentDashboard.js` | 157 | Cached requests |
| `payments` | `src/components/StudentDashboard.js` | 161 | Cached payments |

### Constants & Config
| Constant | File | Line | Mô tả |
|----------|------|------|-------|
| `API_BASE_URL` | Multiple files | - | API base URL (hardcoded) |
| `clubCategoryLabels` | `src/data/constants.js` | - | Club category labels |

---

## 🔄 LUỒNG CODE QUAN TRỌNG

### 1. Login Flow
```
login.jsx:handleSubmit (line ~85)
  → POST /auth/token (line 94)
  → extractTokenFromResponse (line 114)
  → parseJWTToken (line 121)
  → mapScopeToRole (line 131)
  → localStorage.setItem('authToken') (line ~200+)
  → onLoginSuccess (line ~220+)
  → App.js:handleLoginSuccess (line 287)
  → Set isAuthenticated = true
```

### 2. Join Request Flow
```
StudentDashboard:handleJoinRequest
  → setShowJoinModal(true)
  → JoinRequestModal mount
  → Fetch user info (line 35)
  → Fetch club detail (line 76)
  → Fetch packages (line 104)
  → User submit form
  → validateForm (line 225)
  → onSubmit(formData)
  → StudentDashboard:submitJoinRequest (line 312)
  → POST /registers (line 338)
  → Update joinRequests state
```

### 3. Approve Request Flow
```
JoinRequestsList:handleApproveClick
  → PUT /registers/{id}/approve
  → Update request status
  → Refresh list
```

---

## 🎯 CÂU TRẢ LỜI MẪU

### "Token được lưu ở đâu?"
> "Token JWT được lưu ở **localStorage** với key `'authToken'`. 
> Tôi có thể thấy trong file `src/pages/login.jsx` line 212:
> ```javascript
> localStorage.setItem('authToken', token);
> ```
> Và được lấy ở nhiều file khác như `src/App.js` line 77:
> ```javascript
> const token = localStorage.getItem('authToken');
> ```"

### "API login được gọi ở đâu?"
> "API login được gọi trong file `src/pages/login.jsx`, function `handleSubmit` ở line 94:
> ```javascript
> const response = await fetch(`${API_BASE_URL}/auth/token`, {
>   method: 'POST',
>   headers: { 'Content-Type': 'application/json' },
>   body: JSON.stringify({ email, password })
> });
> ```
> Sau khi nhận response, token được extract ở line 114 và lưu vào localStorage."

### "Luồng đăng nhập như thế nào?"
> "Luồng đăng nhập bắt đầu từ:
> 1. User nhập email/password trong `src/pages/login.jsx`
> 2. Submit form → `handleSubmit` (line ~85)
> 3. Validate form (line ~60+)
> 4. POST `/auth/token` (line 94)
> 5. Extract token từ response (line 114)
> 6. Parse JWT để lấy role (line 121)
> 7. Map scope to role (line 131)
> 8. Lưu token vào localStorage (line ~200+)
> 9. Gọi `onLoginSuccess(role)` (line ~220+)
> 10. App.js update state `isAuthenticated = true` (line 288)
> 11. Render dashboard theo role"

---

**"Ghi nhớ các file và line numbers quan trọng để trả lời nhanh!"** 📝

