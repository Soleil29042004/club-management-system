import React from 'react';
import './StudentUnpaidFees.css';

const StudentUnpaidFees = ({ unpaidFees, onPayment }) => {
  if (unpaidFees.length === 0) {
    return (
      <div className="unpaid-fees-section">
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h2>Bạn đã nộp đủ tất cả các phí!</h2>
          <p>Không có phí nào cần nộp tại thời điểm này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="unpaid-fees-section">
      <div className="unpaid-fees-list">
        {unpaidFees.map((item) => (
          <div key={item.id} className="unpaid-fee-card">
            <div className="fee-card-header">
              <div className="fee-club-info">
                <h3>{item.clubName}</h3>
                <span className="fee-category">{item.club.category}</span>
              </div>
              <span className="fee-status-badge">Chưa nộp</span>
            </div>
            <div className="fee-card-body">
              <div className="fee-details">
                <div className="detail-item">
                  <span className="detail-label">Ngày được chấp nhận:</span>
                  <span className="detail-value">{item.requestDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Chủ tịch:</span>
                  <span className="detail-value">{item.club.president}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Địa điểm:</span>
                  <span className="detail-value">{item.club.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Số thành viên:</span>
                  <span className="detail-value">{item.club.memberCount}</span>
                </div>
              </div>
              <p className="fee-description">{item.club.description}</p>
            </div>
            <div className="fee-card-actions">
              <button
                onClick={() => onPayment(item.club)}
                className="btn-pay-fee"
              >
                💰 Nộp phí ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentUnpaidFees;

