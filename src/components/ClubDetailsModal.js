import React from 'react';
import './ClubDetailsModal.css';

const ClubDetailsModal = ({ club, onClose }) => {
  if (!club) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content club-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết câu lạc bộ</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="club-details-header">
            <h3>{club.name}</h3>
            <span className={`status-badge ${club.status === 'Hoạt động' ? 'active' : 'inactive'}`}>
              {club.status}
            </span>
          </div>

          <div className="club-details-section">
            <h4>Thông tin cơ bản</h4>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Danh mục:</span>
                <span className="detail-value">{club.category}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Chủ tịch:</span>
                <span className="detail-value">{club.president}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Số thành viên:</span>
                <span className="detail-value">{club.memberCount}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Địa điểm:</span>
                <span className="detail-value">{club.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{club.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ngày thành lập:</span>
                <span className="detail-value">
                  {club.foundedDate ? new Date(club.foundedDate).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phí tham gia:</span>
                <span className="detail-value">
                  {club.participationFee ? `${club.participationFee.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}
                </span>
              </div>
            </div>
          </div>

          <div className="club-details-section">
            <h4>Mô tả</h4>
            <p className="club-description-full">{club.description}</p>
          </div>

          <div className="club-details-section">
            <h4>Hoạt động của club</h4>
            {club.activities && club.activities.length > 0 ? (
              <div className="activities-list">
                {club.activities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-header">
                      <h5>{activity.title}</h5>
                      <span className="activity-date">
                        {activity.date ? new Date(activity.date).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="activity-description">{activity.description}</p>
                    )}
                    {activity.location && (
                      <div className="activity-meta">
                        <span>📍 {activity.location}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-activities">Chưa có hoạt động nào được ghi nhận.</p>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubDetailsModal;

