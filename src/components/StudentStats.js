import React from 'react';
import './StudentStats.css';

const StudentStats = ({ requestsCount, paymentsCount, unpaidFeesCount, clubsCount }) => {
  return (
    <div className="student-stats">
      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-info">
          <h3>Yêu cầu đã gửi</h3>
          <p className="stat-number">{requestsCount}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-info">
          <h3>Đã nộp phí</h3>
          <p className="stat-number">{paymentsCount}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⚠️</div>
        <div className="stat-info">
          <h3>Phí chưa nộp</h3>
          <p className="stat-number">{unpaidFeesCount}</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🏛️</div>
        <div className="stat-info">
          <h3>CLB đang hoạt động</h3>
          <p className="stat-number">{clubsCount}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentStats;

