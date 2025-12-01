import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ClubManagement from './components/ClubManagement';
import MemberManagement from './components/MemberManagement';
import { mockClubs, mockMembers } from './data/mockData';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [clubs, setClubs] = useState(mockClubs);
  const [members, setMembers] = useState(mockMembers);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard clubs={clubs} members={members} />;
      case 'clubs':
        return <ClubManagement clubs={clubs} setClubs={setClubs} />;
      case 'members':
        return <MemberManagement members={members} setMembers={setMembers} clubs={clubs} />;
      default:
        return <Dashboard clubs={clubs} members={members} />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>🎓 Student Club Management</h1>
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
        </div>
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="footer">
        <p>© 2024 Student Club Management System. Made with ❤️ by React</p>
      </footer>
    </div>
  );
}

export default App;
