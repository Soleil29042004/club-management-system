import React from 'react';
import './LeaderStats.css';

const LeaderStats = ({ memberCount, pendingRequestsCount, category, location }) => {
  return (
    <div className="leader-stats">
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-info">
          <h3>Thành viên</h3>
          <p className="stat-number">{memberCount}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-info">
          <h3>Yêu cầu chờ duyệt</h3>
          <p className="stat-number">{pendingRequestsCount}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📂</div>
        <div className="stat-info">
          <h3>Danh mục</h3>
          <p className="stat-number">{category}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📍</div>
        <div className="stat-info">
          <h3>Địa điểm</h3>
          <p className="stat-number-small">{location}</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderStats;

