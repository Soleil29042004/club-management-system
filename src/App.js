import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ClubManagement from './components/ClubManagement';
import MemberManagement from './components/MemberManagement';
import StudentDashboard from './components/StudentDashboard';
import ClubLeaderDashboard from './components/ClubLeaderDashboard';
import Profile from './components/Profile';
import ClubRequestsManagement from './components/ClubRequestsManagement';
import StudentMyClubRequests from './components/StudentMyClubRequests';
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
  const [clubs, setClubs] = useState(mockClubs);
  const [members, setMembers] = useState(mockMembers);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  // Check if user is already logged in on component mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role === 'admin' || userData.role === 'student' || userData.role === 'club_leader') {
        setIsAuthenticated(true);
        setUserRole(userData.role);
        setShowHome(false);
      }
    }
  }, []);

  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setShowHome(false);
    setShowLogin(false);
    setShowRegister(false);
  };

  const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

  const handleLogout = async () => {
    const storedUser = localStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : {};
    const token = localStorage.getItem('authToken') || userData.token;

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    setShowHome(true);
    setShowLogin(false);
    setShowRegister(false);
    showToast('Đã đăng xuất', 'success');
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
      case 'unpaid-fees':
        return <StudentDashboard clubs={clubs} currentPage={currentPage} setClubs={setClubs} />;
      case 'my-requests':
        return <StudentMyClubRequests />;
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
                currentPage === 'unpaid-fees' 
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setCurrentPage('unpaid-fees');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <span className="text-xl flex-shrink-0">💰</span>
              <span className="whitespace-nowrap">Phí chưa nộp</span>
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
                  {currentPage === 'unpaid-fees' && 'Phí chưa nộp'}
                  {currentPage === 'my-requests' && 'Đơn mở Club đã gửi'}
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
      case 'activities':
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
                currentPage === 'activities' 
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => {
                setCurrentPage('activities');
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
            >
              <span className="text-xl flex-shrink-0">📅</span>
              <span className="whitespace-nowrap">Hoạt động</span>
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
                  {currentPage === 'activities' && 'Hoạt động'}
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
