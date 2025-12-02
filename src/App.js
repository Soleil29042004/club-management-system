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
import './App.css';

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
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>FPT University - Hệ thống quản lý CLB</h1>
          </div>
          <div className="nav-menu">
            <button
              className={`nav-item ${currentPage === 'clubs' ? 'active' : ''}`}
              onClick={() => setCurrentPage('clubs')}
            >
              <span className="nav-icon">🏛️</span>
              Danh sách CLB
            </button>
            <button
              className={`nav-item ${currentPage === 'unpaid-fees' ? 'active' : ''}`}
              onClick={() => setCurrentPage('unpaid-fees')}
            >
              <span className="nav-icon">💰</span>
              Phí chưa nộp
            </button>
            <button
              className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentPage('profile')}
            >
              <span className="nav-icon">👤</span>
              Hồ sơ
            </button>
            <button
              className="nav-item"
              onClick={handleLogout}
              style={{ marginLeft: 'auto' }}
            >
              <span className="nav-icon">🚪</span>
              Đăng xuất
            </button>
          </div>
        </nav>

        <main className="main-content">
          {renderStudentPage()}
        </main>

        <footer className="footer">
          <p>© 2024 FPT University - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
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
      case 'profile':
        return <Profile userRole={userRole} clubs={clubs} members={members} />;
      default:
        return <ClubLeaderDashboard clubs={clubs} setClubs={setClubs} members={members} setMembers={setMembers} currentPage="manage" />;
    }
  };

  // Show club leader dashboard if authenticated as club_leader
  if (userRole === 'club_leader') {
    return (
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>FPT University - Hệ thống quản lý CLB</h1>
          </div>
          <div className="nav-menu">
            <button
              className={`nav-item ${currentPage === 'manage' ? 'active' : ''}`}
              onClick={() => setCurrentPage('manage')}
            >
              <span className="nav-icon">⚙️</span>
              Quản lý Club
            </button>
            <button
              className={`nav-item ${currentPage === 'requests' ? 'active' : ''}`}
              onClick={() => setCurrentPage('requests')}
            >
              <span className="nav-icon">📋</span>
              Duyệt yêu cầu
            </button>
            <button
              className={`nav-item ${currentPage === 'members' ? 'active' : ''}`}
              onClick={() => setCurrentPage('members')}
            >
              <span className="nav-icon">👥</span>
              Quản lý thành viên
            </button>
            <button
              className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentPage('profile')}
            >
              <span className="nav-icon">👤</span>
              Hồ sơ
            </button>
            <button
              className="nav-item"
              onClick={handleLogout}
              style={{ marginLeft: 'auto' }}
            >
              <span className="nav-icon">🚪</span>
              Đăng xuất
            </button>
          </div>
        </nav>

        <main className="main-content">
          {renderLeaderPage()}
        </main>

        <footer className="footer">
          <p>© 2024 FPT University - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
        </footer>
      </div>
    );
  }

  // Show admin dashboard if authenticated as admin
  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>FPT University - Hệ thống quản lý CLB</h1>
        </div>
        <div className="nav-menu">
          <button
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Tổng quan
          </button>
          <button
            className={`nav-item ${currentPage === 'clubs' ? 'active' : ''}`}
            onClick={() => setCurrentPage('clubs')}
          >
            <span className="nav-icon">🏛️</span>
            Câu lạc bộ
          </button>
          <button
            className={`nav-item ${currentPage === 'members' ? 'active' : ''}`}
            onClick={() => setCurrentPage('members')}
          >
            <span className="nav-icon">👥</span>
            Thành viên
          </button>
          <button
            className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentPage('profile')}
          >
            <span className="nav-icon">👤</span>
            Hồ sơ
          </button>
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ marginLeft: 'auto' }}
          >
            <span className="nav-icon">🚪</span>
            Đăng xuất
          </button>
        </div>
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>

        <footer className="footer">
          <p>© 2024 FPT University - Hệ thống quản lý Câu lạc bộ Sinh viên</p>
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
