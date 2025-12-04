import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ClubManagement from './components/ClubManagement';
import MemberManagement from './components/MemberManagement';
import StudentDashboard from './components/StudentDashboard';
import ClubLeaderDashboard from './components/ClubLeaderDashboard';
import Profile from './components/Profile';
import Login from './pages/login';
import Register from './pages/register';
import { ToastProvider } from './components/Toast';
import { mockClubs, mockMembers } from './data/mockData';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);
  const [clubs, setClubs] = useState(mockClubs);
  const [members, setMembers] = useState(mockMembers);

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

  // Check if user is already logged in on component mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role === 'admin' || userData.role === 'student' || userData.role === 'club_leader') {
        setIsAuthenticated(true);
        setUserRole(userData.role);
      }
    }
  }, []);

  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard clubs={clubs} members={members} />;
      case 'clubs':
        return <ClubManagement clubs={clubs} setClubs={setClubs} />;
      case 'members':
        return <MemberManagement members={members} setMembers={setMembers} clubs={clubs} />;
      case 'profile':
        return <Profile userRole={userRole} clubs={clubs} members={members} />;
      default:
        return <Dashboard clubs={clubs} members={members} />;
    }
  };

  // Show login/register page if not authenticated
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register 
          onRegisterSuccess={handleLoginSuccess}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Render student pages
  const renderStudentPage = () => {
    switch (currentPage) {
      case 'clubs':
        return <StudentDashboard clubs={clubs} currentPage={currentPage} />;
      case 'unpaid-fees':
        return <StudentDashboard clubs={clubs} currentPage={currentPage} />;
      case 'profile':
        return <Profile userRole={userRole} clubs={clubs} members={members} />;
      default:
        return <StudentDashboard clubs={clubs} currentPage="clubs" />;
    }
  };

  // Show student dashboard if authenticated as student
  if (userRole === 'student') {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white px-6 py-4 shadow-lg sticky top-0 z-50 flex justify-between items-center gap-5 min-h-[70px]">
          <div className="flex-shrink-0 min-w-0">
            <h1 className="text-2xl font-bold m-0 tracking-tight flex items-center gap-2.5 whitespace-nowrap flex-shrink min-w-0">
              <span className="text-3xl flex-shrink-0">🎓</span>
              FPT University - Hệ thống quản lý CLB
            </h1>
          </div>
          <div className="flex gap-2 items-center flex-wrap flex-shrink-0 overflow-x-auto flex-1 justify-end">
            <button
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit transition-all backdrop-blur-sm border-2 border-transparent ${
                currentPage === 'clubs' 
                  ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                  : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
              }`}
              onClick={() => setCurrentPage('clubs')}
            >
              <span className="text-lg">🏛️</span>
              Danh sách CLB
            </button>
            <button
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit border-2 border-transparent ${
                currentPage === 'unpaid-fees' 
                  ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                  : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
              }`}
              onClick={() => setCurrentPage('unpaid-fees')}
            >
              <span className="text-lg">💰</span>
              Phí chưa nộp
            </button>
            <button
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit border-2 border-transparent ${
                currentPage === 'profile' 
                  ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                  : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
              }`}
              onClick={() => setCurrentPage('profile')}
            >
              <span className="text-lg">👤</span>
              Hồ sơ
            </button>
            <button
              className="px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit bg-white/20 text-white hover:bg-red-600/80 border-2 border-transparent transition-all"
              onClick={handleLogout}
            >
              <span className="text-lg">🚪</span>
              Đăng xuất
            </button>
          </div>
        </nav>

        <main className="flex-1 px-8 py-10 max-w-[1600px] mx-auto w-full bg-transparent">
          {renderStudentPage()}
        </main>

        <footer className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white text-center py-6 px-5 shadow-lg mt-auto">
          <p className="m-0 text-sm font-medium opacity-95">© 2024 FPT University - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
        </footer>
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
      case 'profile':
        return <Profile userRole={userRole} clubs={clubs} members={members} />;
      default:
        return <ClubLeaderDashboard clubs={clubs} setClubs={setClubs} members={members} setMembers={setMembers} currentPage="manage" />;
    }
  };

  // Show club leader dashboard if authenticated as club_leader
  if (userRole === 'club_leader') {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white px-6 py-4 shadow-lg sticky top-0 z-50 flex justify-between items-center gap-5 min-h-[70px]">
          <div className="flex-shrink-0 min-w-0">
            <h1 className="text-2xl font-bold m-0 tracking-tight flex items-center gap-2.5 whitespace-nowrap flex-shrink min-w-0">
              <span className="text-3xl flex-shrink-0">🎓</span>
              FPT University - Hệ thống quản lý CLB
            </h1>
          </div>
          <div className="flex gap-2 items-center flex-wrap flex-shrink-0 overflow-x-auto flex-1 justify-end">
            <button
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit border-2 border-transparent ${
                currentPage === 'manage' 
                  ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                  : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
              }`}
              onClick={() => setCurrentPage('manage')}
            >
              <span className="text-lg">⚙️</span>
              Quản lý Club
            </button>
            <button
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit border-2 border-transparent ${
                currentPage === 'requests' 
                  ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                  : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
              }`}
              onClick={() => setCurrentPage('requests')}
            >
              <span className="text-lg">📋</span>
              Duyệt yêu cầu
            </button>
            <button
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit border-2 border-transparent ${
                currentPage === 'members' 
                  ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                  : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
              }`}
              onClick={() => setCurrentPage('members')}
            >
              <span className="text-lg">👥</span>
              Quản lý thành viên
            </button>
            <button
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit border-2 border-transparent ${
                currentPage === 'activities' 
                  ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                  : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
              }`}
              onClick={() => setCurrentPage('activities')}
            >
              <span className="text-lg">📅</span>
              Hoạt động
            </button>
            <button
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit border-2 border-transparent ${
                currentPage === 'profile' 
                  ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                  : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
              }`}
              onClick={() => setCurrentPage('profile')}
            >
              <span className="text-lg">👤</span>
              Hồ sơ
            </button>
            <button
              className="px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit bg-white/20 text-white hover:bg-red-600/80 border-2 border-transparent transition-all"
              onClick={handleLogout}
            >
              <span className="text-lg">🚪</span>
              Đăng xuất
            </button>
          </div>
        </nav>

        <main className="flex-1 px-8 py-10 max-w-[1600px] mx-auto w-full bg-transparent">
          {renderLeaderPage()}
        </main>

        <footer className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white text-center py-6 px-5 shadow-lg mt-auto">
          <p className="m-0 text-sm font-medium opacity-95">© 2024 FPT University - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
        </footer>
      </div>
    );
  }

  // Show admin dashboard if authenticated as admin
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white px-6 py-4 shadow-lg sticky top-0 z-50 flex justify-between items-center gap-5 min-h-[70px]">
        <div className="flex-shrink-0 min-w-0">
          <h1 className="text-2xl font-bold m-0 tracking-tight flex items-center gap-2.5 whitespace-nowrap flex-shrink min-w-0">
            <span className="text-3xl flex-shrink-0">🎓</span>
            FPT University - Hệ thống quản lý CLB
          </h1>
        </div>
        <div className="flex gap-2 items-center flex-wrap flex-shrink-0 overflow-x-auto flex-1 justify-end">
          <button
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit border-2 border-transparent ${
              currentPage === 'dashboard' 
                ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
            }`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="text-lg">📊</span>
            Tổng quan
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit border-2 border-transparent ${
              currentPage === 'clubs' 
                ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
            }`}
            onClick={() => setCurrentPage('clubs')}
          >
            <span className="text-lg">🏛️</span>
            Câu lạc bộ
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit border-2 border-transparent ${
              currentPage === 'members' 
                ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
            }`}
            onClick={() => setCurrentPage('members')}
          >
            <span className="text-lg">👥</span>
            Thành viên
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit border-2 border-transparent ${
              currentPage === 'profile' 
                ? 'bg-fpt-orange text-white border-fpt-orange shadow-lg shadow-fpt-orange/40 font-bold' 
                : 'bg-white/15 text-white hover:bg-white/25 hover:-translate-y-0.5 hover:shadow-md'
            }`}
            onClick={() => setCurrentPage('profile')}
          >
            <span className="text-lg">👤</span>
            Hồ sơ
          </button>
          <button
            className="px-4 py-2.5 text-sm font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 min-w-fit bg-white/20 text-white hover:bg-red-600/80 border-2 border-transparent transition-all"
            onClick={handleLogout}
          >
            <span className="text-lg">🚪</span>
            Đăng xuất
          </button>
        </div>
      </nav>

      <main className="flex-1 px-8 py-10 max-w-[1600px] mx-auto w-full bg-transparent">
        {renderPage()}
      </main>

      <footer className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white text-center py-6 px-5 shadow-lg mt-auto">
        <p className="m-0 text-sm font-medium opacity-95">© 2024 FPT University - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
      </footer>
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
