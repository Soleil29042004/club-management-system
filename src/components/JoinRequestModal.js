import React from 'react';
import './JoinRequestModal.css';

const JoinRequestModal = ({ club, onClose, onSubmit }) => {
  if (!club) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gửi yêu cầu tham gia</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Bạn có muốn gửi yêu cầu tham gia <strong>{club.name}</strong> không?</p>
          <div className="club-details">
            <p><strong>Danh mục:</strong> {club.category}</p>
            <p><strong>Chủ tịch:</strong> {club.president}</p>
            <p><strong>Số thành viên:</strong> {club.memberCount}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-submit" onClick={onSubmit}>
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestModal;

