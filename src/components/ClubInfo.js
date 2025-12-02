import React from 'react';
import ClubInfoForm from './ClubInfoForm';
import './ClubInfo.css';

const ClubInfo = ({ club, onEdit, showEditForm, formData, onFormChange, onFormSubmit, onFormCancel }) => {
  if (!club) return null;

  if (showEditForm) {
    return (
      <ClubInfoForm
        formData={formData}
        onFormChange={onFormChange}
        onFormSubmit={onFormSubmit}
        onFormCancel={onFormCancel}
      />
    );
  }

  return (
    <div className="manage-club-section">
      <div className="club-info-card">
        <div className="club-info-header">
          <div className="club-header-content">
            <div className="club-icon">🏛️</div>
            <div>
              <h2>{club.name}</h2>
              <p className="club-subtitle">{club.category}</p>
            </div>
          </div>
          <button className="btn-edit-club" onClick={onEdit}>
            ✏️ Chỉnh sửa
          </button>
        </div>
        <div className="club-info-body">
          <div className="club-description-section">
            <h3>📝 Mô tả</h3>
            <p>{club.description}</p>
          </div>
          <div className="club-details-grid">
            <div className="detail-card">
              <div className="detail-icon">📅</div>
              <div className="detail-content">
                <span className="detail-label">Ngày thành lập</span>
                <span className="detail-value">{club.foundedDate}</span>
              </div>
            </div>
            <div className="detail-card">
              <div className="detail-icon">👤</div>
              <div className="detail-content">
                <span className="detail-label">Chủ tịch</span>
                <span className="detail-value">{club.president}</span>
              </div>
            </div>
            <div className="detail-card">
              <div className="detail-icon">👥</div>
              <div className="detail-content">
                <span className="detail-label">Số thành viên</span>
                <span className="detail-value">{club.memberCount}</span>
              </div>
            </div>
            <div className="detail-card">
              <div className="detail-icon">📍</div>
              <div className="detail-content">
                <span className="detail-label">Địa điểm</span>
                <span className="detail-value">{club.location}</span>
              </div>
            </div>
            <div className="detail-card">
              <div className="detail-icon">📧</div>
              <div className="detail-content">
                <span className="detail-label">Email</span>
                <span className="detail-value">{club.email}</span>
              </div>
            </div>
            <div className="detail-card">
              <div className="detail-icon">⚡</div>
              <div className="detail-content">
                <span className="detail-label">Trạng thái</span>
                <span className={`detail-value status-badge status-${club.status.toLowerCase().replace(' ', '-')}`}>
                  {club.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubInfo;

