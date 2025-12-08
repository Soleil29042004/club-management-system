import React from 'react';
import './Dashboard.css';

const Dashboard = ({ clubs, members }) => {
  const activeClubs = clubs.filter(club => club.status === 'Hoạt động').length;
  const totalMembers = members.length;
  const activeMembers = members.filter(member => member.status === 'Hoạt động').length;
  
  const clubsByCategory = clubs.reduce((acc, club) => {
    acc[club.category] = (acc[club.category] || 0) + 1;
    return acc;
  }, {});

  const membersByRole = members.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {});

  const topClubs = clubs
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tổng quan hệ thống</h1>
        <p className="subtitle">Thống kê và báo cáo hoạt động câu lạc bộ</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">🏛️</div>
          <div className="stat-content">
            <h3>Tổng số câu lạc bộ</h3>
            <p className="stat-number">{clubs.length}</p>
            <span className="stat-detail">{activeClubs} đang hoạt động</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Tổng số thành viên</h3>
            <p className="stat-number">{totalMembers}</p>
            <span className="stat-detail">{activeMembers} đang hoạt động</span>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Trung bình thành viên/CLB</h3>
            <p className="stat-number">
              {clubs.length > 0 ? Math.round(totalMembers / clubs.length) : 0}
            </p>
            <span className="stat-detail">Người/câu lạc bộ</span>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">📂</div>
          <div className="stat-content">
            <h3>Số danh mục</h3>
            <p className="stat-number">{Object.keys(clubsByCategory).length}</p>
            <span className="stat-detail">Danh mục hoạt động</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Câu lạc bộ theo danh mục</h2>
          <div className="category-list">
            {Object.entries(clubsByCategory).map(([category, count]) => (
              <div key={category} className="category-item">
                <span className="category-name">{category}</span>
                <div className="category-bar-container">
                  <div 
                    className="category-bar" 
                    style={{ width: `${(count / clubs.length) * 100}%` }}
                  ></div>
                </div>
                <span className="category-count">{count} CLB</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Thành viên theo vai trò</h2>
          <div className="role-grid">
            {Object.entries(membersByRole).map(([role, count]) => (
              <div key={role} className="role-card">
                <h4>{role}</h4>
                <p className="role-count">{count}</p>
                <span className="role-percentage">
                  {((count / totalMembers) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section full-width">
          <h2>Top 5 câu lạc bộ có nhiều thành viên nhất</h2>
          <div className="top-clubs-list">
            {topClubs.map((club, index) => (
              <div key={club.id} className="top-club-item">
                <div className="rank-badge">{index + 1}</div>
                <div className="club-info-top">
                  <h4>{club.name}</h4>
                  <p>{club.category}</p>
                </div>
                <div className="member-count-badge">
                  {club.memberCount} thành viên
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;






