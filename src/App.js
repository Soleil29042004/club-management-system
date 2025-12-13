import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ClubManagement from './components/ClubManagement';
import MemberManagement from './components/MemberManagement';
import StudentDashboard from './components/StudentDashboard';
import ClubLeaderDashboard from './components/ClubLeaderDashboard';
import Profile from './components/Profile';
import ClubRequestsManagement from './components/ClubRequestsManagement';
import StudentMyClubRequests from './components/StudentMyClubRequests';
import StudentJoinedClubs from './components/StudentJoinedClubs';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
import { ToastProvider, useToast } from './components/Toast';
import { mockClubs, mockMembers, initializeDemoData } from './data/mockData';

function AppContent() {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [clubs, setClubs] = useState([]);
  const [members, setMembers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userReady, setUserReady] = useState(false);

  const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

  // Reset currentPage when user role changes
  useEffect(() => {
    if (userRole === 'student') {
      setCurrentPage('clubs');
    } else if (userRole === 'club_leader') {
      setCurrentPage('manage');
    } else if (userRole === 'admin') {
      setCurrentPage('dashboard');
    }
  }, [userRole]);

  // Initialize demo data on component mount
  useEffect(() => {
    initializeDemoData();
  }, []);

  // Parse JWT token to extract payload
  const parseJWTToken = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token (App):', error);
      return null;
    }
  };

  // Map scope to app role
  const mapScopeToRole = (scopeRaw) => {
    if (!scopeRaw) return 'student';
    const scope = String(scopeRaw).toLowerCase();
    if (scope === 'quantrivien' || scope === 'admin') return 'admin';
    if (scope === 'sinhvien' || scope === 'student') return 'student';
    return 'club_leader';
  };

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    // If no token, user is not authenticated
    if (!token) {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserReady(true);
      return;
    }

    // Parse token to get user info
    const payload = parseJWTToken(token);
    if (!payload) {
      // Invalid token, clear and logout
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUserRole(null);
      return;
    }

    // Extract role from token
    const scopeFromToken = payload.scope || payload.role || payload.Roles || payload.roleName;
    const roleFromToken = mapScopeToRole(scopeFromToken);
    
    // Extract other info from token
    const userIdFromToken = payload.sub || payload.nameid || payload.userId || payload.UserId;
    const tokenClubIds = Array.isArray(payload.clubIds || payload.clubIDs || payload.ClubIds || payload.ClubIDs)
      ? (payload.clubIds || payload.clubIDs || payload.ClubIds || payload.ClubIDs)
      : [];
    const clubIdFromToken =
      payload.clubId ||
      payload.clubID ||
      payload.ClubId ||
      payload.ClubID ||
      payload.club?.clubId ||
      tokenClubIds?.[0] ||
      null;

    // Check if role is valid
    if (roleFromToken === 'admin' || roleFromToken === 'student' || roleFromToken === 'club_leader') {
      // Set authenticated state
      setIsAuthenticated(true);
      setUserRole(roleFromToken);
      setShowHome(false);

      // Hydrate localStorage.user with complete info
      const storedUser = localStorage.getItem('user');
      let userData = {};
      
      if (storedUser) {
        try {
          userData = JSON.parse(storedUser);
        } catch (e) {
          console.warn('Cannot parse stored user', e);
          userData = {};
        }
      }

      // Update user data with token info
      const hydrated = {
        ...userData,
        role: roleFromToken,
        ...(userIdFromToken ? { userId: userIdFromToken } : {}),
        ...(clubIdFromToken ? { clubId: clubIdFromToken } : {}),
        ...(tokenClubIds && tokenClubIds.length ? { clubIds: tokenClubIds } : {})
      };
      
      localStorage.setItem('user', JSON.stringify(hydrated));
      
      // Fetch user info from API to ensure we have complete user data including userId
      const fetchUserInfo = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/users/my-info`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && (data.code === 1000 || data.code === 0)) {
            const info = data.result || data.data || data;
            // Chỉ dùng userIdFromToken nếu không phải email (không chứa @)
            const validUserId = info.userId || 
              (userIdFromToken && !userIdFromToken.includes('@') ? userIdFromToken : null) || 
              '';
            const normalized = {
              userId: validUserId,
              name: info.fullName || info.name || hydrated.name || '',
              email: info.email || hydrated.email || '',
              phone: info.phoneNumber || info.phone || hydrated.phone || '',
              studentId: info.studentCode || info.studentId || hydrated.studentId || '',
              major: info.major || hydrated.major || '',
              role: roleFromToken,
              avatar: info.avatarUrl || info.avatar || hydrated.avatar || '',
              clubIds: info.clubIds || tokenClubIds || hydrated.clubIds || []
            };
            const updatedUser = { ...hydrated, ...normalized };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (err) {
          console.warn('Failed to fetch user info, using token data:', err);
        } finally {
          setUserReady(true);
        }
      };
      
      fetchUserInfo();
    } else {
      // Invalid role, but still have token - might be a new role type
      // Keep authenticated but with null role (will show error if needed)
      console.warn('Unknown role from token:', scopeFromToken, 'mapped to:', roleFromToken);
      setIsAuthenticated(false);
      setUserRole(null);
      setUserReady(true);
    }
  }, []);

  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setShowHome(false);
    setShowLogin(false);
    setShowRegister(false);
    setUserReady(true);
  };

  const mapApiClub = (apiClub) => ({
    id: apiClub?.clubId,
    clubId: apiClub?.clubId,
    name: apiClub?.clubName || '',
    description: apiClub?.description || '',
    category: apiClub?.category || '',
    foundedDate: apiClub?.establishedDate || '',
    president: apiClub?.founderName || apiClub?.presidentName || '',
    memberCount: apiClub?.memberCount || apiClub?.members?.length || 0,
    status: apiClub?.isActive ? 'Hoạt động' : 'Tạm dừng',
    email: apiClub?.email || '',
    location: apiClub?.location || '',
    logo: apiClub?.logo || null,
    activityTime: apiClub?.activityTime || '',
    founderId: apiClub?.founderId,
    founderStudentCode: apiClub?.founderStudentCode,
    raw: apiClub
  });

  // Fetch clubs từ API khi đã đăng nhập
  useEffect(() => {
    if (!isAuthenticated || !userReady) return;

    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchClubs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/clubs`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          const mapped = (data.result || []).map(mapApiClub);
          setClubs(mapped);
        } else {
          console.warn('Fetch clubs failed', data);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Fetch clubs error:', err);
      }
    };

    fetchClubs();
    return () => controller.abort();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    // Xóa tất cả dữ liệu liên quan đến authentication và session trong localStorage
    const keysToRemove = [
      'authToken',
      'token',
      'user',
      'role',
      'joinRequests',
      'payments',
      'clubRequests',
      'registeredUsers' // Có thể giữ lại nếu muốn, nhưng xóa để clean hoàn toàn
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Reset state ngay lập tức
    setIsAuthenticated(false);
    setUserRole(null);
    setShowHome(true);
    setShowLogin(false);
    setShowRegister(false);
    
    // Reset clubs và members về empty array
    setClubs([]);
    setMembers([]);
    
    // Gọi API logout một cách không blocking (không chờ kết quả)
    // Nếu API không tồn tại hoặc lỗi, không ảnh hưởng đến việc logout
    const token = localStorage.getItem('authToken');
    if (token) {
      // Gọi API logout nhưng không await, để không block việc logout
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }).catch(error => {
        // Bỏ qua lỗi API, không hiển thị cho user
        console.log('Logout API call failed (optional):', error);
      });
    }
    
    showToast('Đã đăng xuất thành công', 'success');
  };

  const handleNavigateToLogin = () => {
    setShowHome(false);
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleNavigateToRegister = () => {
    setShowHome(false);
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleNavigateToHome = () => {
    setShowHome(true);
    setShowLogin(false);
    setShowRegister(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard clubs={clubs} members={members} />;
      case 'clubs':
        return <ClubManagement clubs={clubs} setClubs={setClubs} />;
      case 'members':
        return <MemberManagement members={members} setMembers={setMembers} clubs={clubs} />;
      case 'club-requests':
        return <ClubRequestsManagement clubs={clubs} setClubs={setClubs} />;
      case 'profile':
        return <Profile userRole={userRole} clubs={clubs} members={members} />;
      default:
        return <Dashboard clubs={clubs} members={members} />;
    }
  };

  // Show home/login/register page if not authenticated
  if (!userReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full mb-4"></div>
          <p className="m-0 text-base">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register 
          onRegisterSuccess={handleLoginSuccess}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
          onNavigateToHome={handleNavigateToHome}
        />
      );
    }
    if (showLogin) {
      return (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
          onNavigateToHome={handleNavigateToHome}
        />
      );
    }
    return (
      <Home 
        onNavigateToLogin={handleNavigateToLogin}
        onNavigateToRegister={handleNavigateToRegister}
      />
    );
  }

  // Render student pages
  const renderStudentPage = () => {
    switch (currentPage) {
      case 'clubs':
        return <StudentDashboard clubs={clubs} currentPage={currentPage} setClubs={setClubs} />;
      case 'my-requests':
        return <StudentMyClubRequests />;
      case 'joined-clubs':
        return <StudentJoinedClubs />;
      case 'profile':
        return <Profile userRole={userRole} clubs={clubs} members={members} />;
      default:
        return <StudentDashboard clubs={clubs} currentPage="clubs" setClubs={setClubs} />;
    }
  };

  // Show student dashboard if authenticated as student
  if (userRole === 'student') {
    return (
      <div className="min-h-screen flex">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`w-64 bg-gradient-to-b from-fpt-blue to-fpt-blue-light text-white shadow-xl flex-shrink-0 fixed h-full overflow-y-auto z-50 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none'
        }`}>
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold m-0 flex items-center gap-2">
                  <span className="text-2xl">🎓</span>
                  <span className="whitespace-nowrap">ClubHub</span>
                </h1>
                <p className="text-xs text-white/80 mt-1 whitespace-nowrap">Hệ thống quản lý CLB</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            <button
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                currentPage === 'clubs' 
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setCurrentPage('clubs');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <span className="text-xl flex-shrink-0">🏛️</span>
              <span className="whitespace-nowrap">Danh sách CLB</span>
            </button>
            <button
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                currentPage === 'my-requests' 
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setCurrentPage('my-requests');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <span className="text-xl flex-shrink-0">📄</span>
              <span className="whitespace-nowrap">Đơn đã gửi</span>
            </button>
            <button
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                currentPage === 'joined-clubs' 
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setCurrentPage('joined-clubs');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <span className="text-xl flex-shrink-0">🤝</span>
              <span className="whitespace-nowrap">CLB đã tham gia</span>
            </button>
            <button
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                currentPage === 'profile' 
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setCurrentPage('profile');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <span className="text-xl flex-shrink-0">👤</span>
              <span className="whitespace-nowrap">Hồ sơ</span>
            </button>
            <div className="pt-4 border-t border-white/20 mt-4">
              <button
                className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 text-white/90 hover:bg-red-600/80 transition-all"
                onClick={handleLogout}
              >
                <span className="text-xl">🚪</span>
                <span>Đăng xuất</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}`}>
          <header className="bg-white shadow-md px-6 py-4 sticky top-0 z-40">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button 
                  className="text-gray-600 text-2xl hover:bg-gray-100 rounded p-1 transition-all"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  ☰
                </button>
                <h2 className="text-xl font-semibold text-gray-800 m-0">
                  {currentPage === 'clubs' && 'Danh sách Câu lạc bộ'}
                  {currentPage === 'my-requests' && 'Đơn mở Club đã gửi'}
                {currentPage === 'joined-clubs' && 'CLB đã tham gia'}
                  {currentPage === 'profile' && 'Hồ sơ cá nhân'}
                </h2>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8 bg-transparent overflow-y-auto">
            {renderStudentPage()}
          </main>
          <footer className="bg-white border-t border-gray-200 text-center py-4 px-5">
            <p className="m-0 text-sm text-gray-600">© 2024 ClubHub - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
          </footer>
        </div>
      </div>
    );
  }

  // Render club leader pages
  const renderLeaderPage = () => {
    switch (currentPage) {
      case 'manage':
        return <ClubLeaderDashboard clubs={clubs} setClubs={setClubs} members={members} setMembers={setMembers} currentPage={currentPage} />;
      case 'requests':
        return <ClubLeaderDashboard clubs={clubs} setClubs={setClubs} members={members} setMembers={setMembers} currentPage={currentPage} />;
      case 'members':
        return <ClubLeaderDashboard clubs={clubs} setClubs={setClubs} members={members} setMembers={setMembers} currentPage={currentPage} />;
      case 'fee':
        return <ClubLeaderDashboard clubs={clubs} setClubs={setClubs} members={members} setMembers={setMembers} currentPage={currentPage} />;
      case 'profile':
        return <Profile userRole={userRole} clubs={clubs} members={members} />;
      default:
        return <ClubLeaderDashboard clubs={clubs} setClubs={setClubs} members={members} setMembers={setMembers} currentPage="manage" />;
    }
  };

  // Show club leader dashboard if authenticated as club_leader
  if (userRole === 'club_leader') {
    return (
      <div className="min-h-screen flex">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`w-64 bg-gradient-to-b from-fpt-blue to-fpt-blue-light text-white shadow-xl flex-shrink-0 fixed h-full overflow-y-auto z-50 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none'
        }`}>
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold m-0 flex items-center gap-2">
                  <span className="text-2xl">🎓</span>
                  <span className="whitespace-nowrap">ClubHub</span>
                </h1>
                <p className="text-xs text-white/80 mt-1 whitespace-nowrap">Hệ thống quản lý CLB</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            <button
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                currentPage === 'manage' 
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setCurrentPage('manage');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <span className="text-xl flex-shrink-0">⚙️</span>
              <span className="whitespace-nowrap">Quản lý Club</span>
            </button>
            <button
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                currentPage === 'requests' 
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setCurrentPage('requests');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <span className="text-xl flex-shrink-0">📋</span>
              <span className="whitespace-nowrap">Duyệt yêu cầu</span>
            </button>
            <button
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                currentPage === 'members' 
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setCurrentPage('members');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <span className="text-xl flex-shrink-0">👥</span>
              <span className="whitespace-nowrap">Quản lý thành viên</span>
            </button>
            <button
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                currentPage === 'fee' 
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setCurrentPage('fee');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <span className="text-xl flex-shrink-0">💰</span>
              <span className="whitespace-nowrap">Phí & Thời hạn</span>
            </button>
            <button
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                currentPage === 'profile' 
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setCurrentPage('profile');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <span className="text-xl flex-shrink-0">👤</span>
              <span className="whitespace-nowrap">Hồ sơ</span>
            </button>
            <div className="pt-4 border-t border-white/20 mt-4">
              <button
                className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 text-white/90 hover:bg-red-600/80 transition-all"
                onClick={handleLogout}
              >
                <span className="text-xl">🚪</span>
                <span>Đăng xuất</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}`}>
          <header className="bg-white shadow-md px-6 py-4 sticky top-0 z-40">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button 
                  className="text-gray-600 text-2xl hover:bg-gray-100 rounded p-1 transition-all"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  ☰
                </button>
                <h2 className="text-xl font-semibold text-gray-800 m-0">
                  {currentPage === 'manage' && 'Quản lý Club'}
                  {currentPage === 'requests' && 'Duyệt yêu cầu'}
                  {currentPage === 'members' && 'Quản lý thành viên'}
                  {currentPage === 'fee' && 'Phí & Thời hạn'}
                  {currentPage === 'profile' && 'Hồ sơ cá nhân'}
                </h2>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8 bg-transparent overflow-y-auto">
            {renderLeaderPage()}
          </main>
          <footer className="bg-white border-t border-gray-200 text-center py-4 px-5">
            <p className="m-0 text-sm text-gray-600">© 2024 ClubHub - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
          </footer>
        </div>
      </div>
    );
  }

  // Show admin dashboard if authenticated as admin
  return (
    <div className="min-h-screen flex">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-fpt-blue to-fpt-blue-light text-white shadow-xl flex-shrink-0 fixed h-full overflow-y-auto z-50 transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none'
      }`}>
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold m-0 flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <span className="whitespace-nowrap">ClubHub</span>
              </h1>
              <p className="text-xs text-white/80 mt-1 whitespace-nowrap">Hệ thống quản lý CLB</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          <button
            className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
              currentPage === 'dashboard' 
                ? 'bg-fpt-orange text-white shadow-lg' 
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => {
              setCurrentPage('dashboard');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          >
            <span className="text-xl flex-shrink-0">📊</span>
            <span className="whitespace-nowrap">Tổng quan</span>
          </button>
          <button
            className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
              currentPage === 'clubs' 
                ? 'bg-fpt-orange text-white shadow-lg' 
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => {
              setCurrentPage('clubs');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          >
            <span className="text-xl flex-shrink-0">🏛️</span>
            <span className="whitespace-nowrap">Câu lạc bộ</span>
          </button>
          <button
            className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
              currentPage === 'members' 
                ? 'bg-fpt-orange text-white shadow-lg' 
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => {
              setCurrentPage('members');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          >
            <span className="text-xl flex-shrink-0">👥</span>
            <span className="whitespace-nowrap">Thành viên</span>
          </button>
          <button
            className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
              currentPage === 'club-requests' 
                ? 'bg-fpt-orange text-white shadow-lg' 
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => {
              setCurrentPage('club-requests');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          >
            <span className="text-xl flex-shrink-0">📝</span>
            <span className="whitespace-nowrap">Duyệt yêu cầu CLB</span>
          </button>
          <button
            className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
              currentPage === 'profile' 
                ? 'bg-fpt-orange text-white shadow-lg' 
                : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => {
              setCurrentPage('profile');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          >
            <span className="text-xl flex-shrink-0">👤</span>
            <span className="whitespace-nowrap">Hồ sơ</span>
          </button>
          <div className="pt-4 border-t border-white/20 mt-4">
            <button
              className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 text-white/90 hover:bg-red-600/80 transition-all"
              onClick={handleLogout}
            >
              <span className="text-xl">🚪</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <header className="bg-white shadow-md px-6 py-4 sticky top-0 z-40">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                className="text-gray-600 text-2xl hover:bg-gray-100 rounded p-1 transition-all"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </button>
              <h2 className="text-xl font-semibold text-gray-800 m-0">
                {currentPage === 'dashboard' && 'Tổng quan hệ thống'}
                {currentPage === 'clubs' && 'Quản lý Câu lạc bộ'}
                {currentPage === 'members' && 'Quản lý Thành viên'}
                {currentPage === 'club-requests' && 'Duyệt yêu cầu đăng ký mở Club'}
                {currentPage === 'profile' && 'Hồ sơ cá nhân'}
              </h2>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 bg-transparent overflow-y-auto">
          {renderPage()}
        </main>
        <footer className="bg-white border-t border-gray-200 text-center py-4 px-5">
          <p className="m-0 text-sm text-gray-600">© 2024 ClubHub - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;