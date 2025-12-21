/**
 * App Component - Main Application Component
 * 
 * Component chính của ứng dụng, quản lý:
 * - Authentication state và routing
 * - User role-based navigation
 * - State management cho clubs và members
 * - Integration với API backend
 */

import React, { useState, useEffect } from 'react';
import Dashboard from './components/admin/Dashboard';
import ClubManagement from './components/admin/ClubManagement';
import MemberManagement from './components/admin/MemberManagement';
import StudentDashboard from './components/student/StudentDashboard';
import ClubLeaderDashboard from './components/leader/ClubLeaderDashboard';
import Profile from './components/shared/Profile';
import ClubRequestsManagement from './components/admin/ClubRequestsManagement';
import StudentMyClubRequests from './components/student/StudentMyClubRequests';
import StudentJoinedClubs from './components/student/StudentJoinedClubs';
import Sidebar from './components/shared/Sidebar';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
import { ToastProvider, useToast } from './components/shared/Toast';
import { 
  parseJWTToken, 
  mapScopeToRole, 
  extractUserIdFromToken, 
  extractClubIdFromToken, 
  extractClubIdsFromToken, 
  extractScopeFromToken,
  getAuthToken,
  clearAuthData,
  getUserFromStorage,
  saveUserToStorage
} from './utils/auth';
import { API_BASE_URL, apiRequest } from './utils/api';
import { mapApiClubToComponent } from './utils/clubMapper';

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
  const [hasSetUserReady, setHasSetUserReady] = useState(false); // Flag để tránh set userReady trùng lặp

  /**
   * USE EFFECT 1: RESET CURRENT PAGE ON ROLE CHANGE
   * 
   * KHI NÀO CHẠY: Khi userRole thay đổi
   * 
   * MỤC ĐÍCH: Reset currentPage về trang mặc định của role
   * 
   * LOGIC:
   * - student → 'clubs'
   * - club_leader → 'manage'
   * - admin → 'dashboard'
   * 
   * DEPENDENCIES: [userRole]
   */
  useEffect(() => {
    if (userRole === 'student') {
      setCurrentPage('clubs');
    } else if (userRole === 'club_leader') {
      setCurrentPage('manage');
    } else if (userRole === 'admin') {
      setCurrentPage('dashboard');
    }
  }, [userRole]);

  /**
   * USE EFFECT 2: CHECK AUTHENTICATION ON MOUNT
   * 
   * KHI NÀO CHẠY: Khi component mount lần đầu
   * 
   * MỤC ĐÍCH: Kiểm tra authentication và load thông tin user
   * 
   * FLOW:
   * 1. Lấy token từ localStorage
   * 2. Parse JWT token để lấy thông tin (role, userId, clubId, clubIds)
   * 3. Set authentication state và userRole
   * 4. Fetch thông tin user từ API GET /users/my-info để có đầy đủ thông tin
   * 5. Hydrate localStorage.user với thông tin từ token và API
   * 
   * DEPENDENCIES: [] (chỉ chạy một lần)
   */
  useEffect(() => {
    let isMounted = true;
    
    const token = getAuthToken();
    
    // Nếu không có token, user chưa đăng nhập
    if (!token) {
      if (isMounted && !hasSetUserReady) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserReady(true);
        setHasSetUserReady(true);
      }
      return;
    }

    // Parse token để lấy thông tin user
    const payload = parseJWTToken(token);
    if (!payload) {
      // Token không hợp lệ, xóa và logout
      clearAuthData();
      if (isMounted && !hasSetUserReady) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserReady(true);
        setHasSetUserReady(true);
      }
      return;
    }

    // Extract thông tin từ token
    const scopeFromToken = extractScopeFromToken(payload);
    const roleFromToken = mapScopeToRole(scopeFromToken);
    const userIdFromToken = extractUserIdFromToken(payload);
    const tokenClubIds = extractClubIdsFromToken(payload);
    const clubIdFromToken = extractClubIdFromToken(payload);

    // Check if role is valid
    if (roleFromToken === 'admin' || roleFromToken === 'student' || roleFromToken === 'club_leader') {
      // Set authenticated state
      if (isMounted) {
        setIsAuthenticated(true);
        setUserRole(roleFromToken);
        setShowHome(false);
      }

      // Hydrate localStorage.user với thông tin đầy đủ từ token
      const storedUser = getUserFromStorage();
      const userData = storedUser || {};
      
      // Cập nhật user data với thông tin từ token
      const hydrated = {
        ...userData,
        role: roleFromToken,
        ...(userIdFromToken ? { userId: userIdFromToken } : {}),
        ...(clubIdFromToken ? { clubId: clubIdFromToken } : {}),
        ...(tokenClubIds && tokenClubIds.length ? { clubIds: tokenClubIds } : {})
      };
      
      saveUserToStorage(hydrated);
      
      /**
       * FUNCTION: FETCH USER INFO
       * 
       * MỤC ĐÍCH: Fetch thông tin user từ API để đảm bảo có đầy đủ thông tin
       * 
       * FLOW:
       * 1. Gọi API GET /users/my-info
       * 2. Merge thông tin từ API với thông tin từ token
       * 3. Cập nhật localStorage.user
       * 
       */
      const fetchUserInfo = async () => {
        try {
          // ========== API CALL: GET /users/my-info - Get User Info ==========
          // Mục đích: Lấy thông tin đầy đủ của user từ API (userId, fullName, email, etc.)
          // Response: User object với đầy đủ thông tin
          const data = await apiRequest('/users/my-info', {
            method: 'GET',
            token
          });
          
          if (data.code === 1000 || data.code === 0) {
            const info = data.result || data.data || data;
            
            // Chỉ dùng userIdFromToken nếu không phải email (không chứa @)
            const validUserId = info.userId || 
              (userIdFromToken && !userIdFromToken.includes('@') ? userIdFromToken : null) || 
              '';
            
            // Normalize user data từ API response
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
            saveUserToStorage(updatedUser);
          }
        } catch (err) {
          console.warn('Failed to fetch user info, using token data:', err);
        } finally {
          // Set userReady sau khi fetch xong (hoặc lỗi)
          // Sử dụng functional update để tránh race condition
          if (isMounted) {
            setHasSetUserReady(prev => {
              if (!prev) {
                setUserReady(true);
                return true;
              }
              return prev;
            });
          }
        }
      };
      
      fetchUserInfo();
    } else {
      // Invalid role, but still have token - might be a new role type
      // Keep authenticated but with null role (will show error if needed)
      console.warn('Unknown role from token:', scopeFromToken, 'mapped to:', roleFromToken);
      if (isMounted && !hasSetUserReady) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserReady(true);
        setHasSetUserReady(true);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * FUNCTION: HANDLE LOGIN SUCCESS
   * 
   * MỤC ĐÍCH: Xử lý khi đăng nhập thành công
   * 
   * FLOW:
   * 1. Set isAuthenticated = true
   * 2. Set userRole từ parameter
   * 3. Ẩn home/login/register pages
   * 4. Set userReady nếu chưa được set bởi useEffect
   * 
   * @param {string} role - Role của user ('admin', 'student', 'club_leader')
   */
  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setShowHome(false);
    setShowLogin(false);
    setShowRegister(false);
    // Set userReady ngay để UI hiển thị, useEffect sẽ fetch user info ở background
    // Nhưng chỉ set nếu chưa được set bởi useEffect
    if (!hasSetUserReady) {
      setUserReady(true);
      setHasSetUserReady(true);
    }
  };


  /**
   * USE EFFECT 3: FETCH CLUBS ON AUTHENTICATION
   * 
   * KHI NÀO CHẠY: Khi isAuthenticated hoặc userReady thay đổi
   * 
   * MỤC ĐÍCH: Fetch danh sách clubs từ API khi user đã đăng nhập
   * 
   * FLOW:
   * 1. Gọi API GET /clubs
   * 2. Map dữ liệu từ API format sang component format
   * 3. Cập nhật clubs state
   * 
   * DEPENDENCIES: [isAuthenticated, userReady]
   */
  useEffect(() => {
    if (!isAuthenticated || !userReady) return;

    const controller = new AbortController();
    const token = getAuthToken();

    const fetchClubs = async () => {
      try {
          // ========== API CALL: GET /clubs - List All Clubs ==========
          // Mục đích: Lấy danh sách tất cả clubs để hiển thị trong dashboard
          // Response: Array of club objects
          const data = await apiRequest('/clubs', {
            method: 'GET',
            token,
            signal: controller.signal
          });
        
        if (data.code === 1000 || data.code === 0) {
          const mapped = (data.result || []).map(mapApiClubToComponent);
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
  }, [isAuthenticated, userReady]);

  /**
   * FUNCTION: HANDLE LOGOUT
   * 
   * MỤC ĐÍCH: Xử lý khi user đăng xuất
   * 
   * FLOW:
   * 1. Xóa authentication data từ localStorage (clearAuthData)
   * 2. Reset tất cả state về giá trị ban đầu
   * 3. Gọi API POST /auth/logout (không blocking) để invalidate token ở backend
   * 4. Hiển thị toast thành công
   * 
   */
  const handleLogout = async () => {
    // Xóa tất cả dữ liệu authentication
    clearAuthData();

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
    const token = getAuthToken();
    if (token) {
      // ========== API CALL: POST /auth/logout - Logout ==========
      // Mục đích: Gọi API logout để invalidate token ở backend (optional, không block logout)
      // Response: Success message (không quan trọng, chỉ để cleanup ở backend)
      apiRequest('/auth/logout', {
        method: 'POST',
        token
      }).catch(error => {
        // Bỏ qua lỗi API, không hiển thị cho user
        console.log('Logout API call failed (optional):', error);
      });
    }
    
    showToast('Đã đăng xuất thành công', 'success');
  };

  /**
   * FUNCTION: HANDLE NAVIGATE TO LOGIN
   * 
   * MỤC ĐÍCH: Chuyển đến trang đăng nhập
   */
  const handleNavigateToLogin = () => {
    setShowHome(false);
    setShowLogin(true);
    setShowRegister(false);
  };

  /**
   * FUNCTION: HANDLE NAVIGATE TO REGISTER
   * 
   * MỤC ĐÍCH: Chuyển đến trang đăng ký
   */
  const handleNavigateToRegister = () => {
    setShowHome(false);
    setShowLogin(false);
    setShowRegister(true);
  };

  /**
   * FUNCTION: HANDLE NAVIGATE TO HOME
   * 
   * MỤC ĐÍCH: Chuyển về trang chủ
   */
  const handleNavigateToHome = () => {
    setShowHome(true);
    setShowLogin(false);
    setShowRegister(false);
  };

  /**
   * FUNCTION: RENDER PAGE (ADMIN)
   * 
   * MỤC ĐÍCH: Render page component dựa trên currentPage cho admin role
   * 
   * PAGES:
   * - 'dashboard' → Dashboard component
   * - 'clubs' → ClubManagement component
   * - 'members' → MemberManagement component
   * - 'club-requests' → ClubRequestsManagement component
   * - 'profile' → Profile component
   * - default → Dashboard component
   * 
   * @returns {JSX.Element} - Page component tương ứng với currentPage
   */
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

  /**
   * Loading state: hiển thị khi đang kiểm tra authentication
   */
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

  /**
   * FUNCTION: RENDER STUDENT PAGE
   * 
   * MỤC ĐÍCH: Render page component dựa trên currentPage cho student role
   * 
   * PAGES:
   * - 'clubs' → StudentDashboard component
   * - 'my-requests' → StudentMyClubRequests component
   * - 'joined-clubs' → StudentJoinedClubs component
   * - 'profile' → Profile component
   * - default → StudentDashboard component với currentPage="clubs"
   * 
   * @returns {JSX.Element} - Page component tương ứng với currentPage
   */
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

  /**
   * Render student dashboard với sidebar và navigation
   */
  if (userRole === 'student') {
    return (
      <div className="min-h-screen flex">
        {/* Sidebar Component */}
        <Sidebar
          userRole={userRole}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

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
            <p className="m-0 text-sm text-gray-600">© 2025 ClubHub - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
          </footer>
        </div>
      </div>
    );
  }

  /**
   * FUNCTION: RENDER LEADER PAGE
   * 
   * MỤC ĐÍCH: Render page component dựa trên currentPage cho club_leader role
   * 
   * PAGES:
   * - 'manage' → ClubLeaderDashboard component với currentPage='manage'
   * - 'requests' → ClubLeaderDashboard component với currentPage='requests'
   * - 'members' → ClubLeaderDashboard component với currentPage='members'
   * - 'fee' → ClubLeaderDashboard component với currentPage='fee'
   * - 'profile' → Profile component
   * - default → ClubLeaderDashboard component với currentPage='manage'
   * 
   * @returns {JSX.Element} - Page component tương ứng với currentPage
   */
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

  /**
   * Render club leader dashboard với sidebar và navigation
   */
  if (userRole === 'club_leader') {
    return (
      <div className="min-h-screen flex">
        {/* Sidebar Component */}
        <Sidebar
          userRole={userRole}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

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
            <p className="m-0 text-sm text-gray-600">© 2025 ClubHub - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
          </footer>
        </div>
      </div>
    );
  }

  /**
   * Render admin dashboard với sidebar và navigation
   */
  return (
    <div className="min-h-screen flex">
      {/* Sidebar Component */}
      <Sidebar
        userRole={userRole}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
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
          <p className="m-0 text-sm text-gray-600">© 2025 ClubHub - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
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