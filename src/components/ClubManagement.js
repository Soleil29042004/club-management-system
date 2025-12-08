import React, { useState } from 'react';
import ClubList from './ClubList';
import ClubForm from './ClubForm';
import { getNextClubId } from '../data/mockData';
import './ClubManagement.css';

const ClubManagement = ({ clubs, setClubs }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [viewingClub, setViewingClub] = useState(null);

  const handleAdd = () => {
    setEditingClub(null);
    setShowForm(true);
  };

  const handleEdit = (club) => {
    setEditingClub(club);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu lạc bộ này?')) {
      setClubs(clubs.filter(club => club.id !== id));
    }
  };

  const handleView = (club) => {
    setViewingClub(club);
  };

  const handleSubmit = (formData) => {
    if (editingClub) {
      // Update existing club
      setClubs(clubs.map(club => 
        club.id === editingClub.id ? { ...formData, id: editingClub.id } : club
      ));
    } else {
      // Add new club
      const newClub = {
        ...formData,
        id: getNextClubId(clubs)
      };
      setClubs([...clubs, newClub]);
    }
    setShowForm(false);
    setEditingClub(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClub(null);
  };

  const closeViewModal = () => {
    setViewingClub(null);
  };

  return (
    <div className="club-management">
      <div className="management-header">
        <div>
          <h1>Quản lý Câu lạc bộ</h1>
          <p className="subtitle">Quản lý thông tin các câu lạc bộ trong trường</p>
        </div>
        <button onClick={handleAdd} className="btn-add-new">
          <span className="plus-icon">+</span>
          Thêm câu lạc bộ mới
        </button>
      </div>

      <ClubList
        clubs={clubs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {showForm && (
        <ClubForm
          club={editingClub}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {viewingClub && (
        <div className="view-modal-overlay" onClick={closeViewModal}>
          <div className="view-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="view-modal-header">
              <h2>Chi tiết câu lạc bộ</h2>
              <button className="close-btn" onClick={closeViewModal}>&times;</button>
            </div>
            <div className="view-modal-body">
              <div className="detail-section">
                <h3>{viewingClub.name}</h3>
                <span className={`status-badge status-${viewingClub.status.toLowerCase()}`}>
                  {viewingClub.status}
                </span>
              </div>
              <div className="detail-section">
                <label>Mô tả:</label>
                <p>{viewingClub.description}</p>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Danh mục:</label>
                  <p>{viewingClub.category}</p>
                </div>
                <div className="detail-item">
                  <label>Chủ tịch:</label>
                  <p>{viewingClub.president}</p>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <p>{viewingClub.email}</p>
                </div>
                <div className="detail-item">
                  <label>Địa điểm:</label>
                  <p>{viewingClub.location}</p>
                </div>
                <div className="detail-item">
                  <label>Ngày thành lập:</label>
                  <p>{new Date(viewingClub.foundedDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="detail-item">
                  <label>Số thành viên:</label>
                  <p>{viewingClub.memberCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManagement;






