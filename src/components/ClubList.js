import React, { useState } from 'react';
import './ClubList.css';

const ClubList = ({ clubs, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || club.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || club.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(clubs.map(club => club.category))];
  const statuses = [...new Set(clubs.map(club => club.status))];

  return (
    <div className="club-list-container">
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm câu lạc bộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="clubs-grid">
        {filteredClubs.length === 0 ? (
          <div className="no-results">
            <p>Không tìm thấy câu lạc bộ nào</p>
          </div>
        ) : (
          filteredClubs.map(club => (
            <div key={club.id} className="club-card">
              <div className="club-card-header">
                <h3>{club.name}</h3>
                <span className={`status-badge status-${club.status.toLowerCase()}`}>
                  {club.status}
                </span>
              </div>
              <div className="club-card-body">
                <p className="club-description">{club.description}</p>
                <div className="club-info">
                  <div className="info-item">
                    <span className="info-label">Danh mục:</span>
                    <span className="info-value">{club.category}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Chủ tịch:</span>
                    <span className="info-value">{club.president}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Số thành viên:</span>
                    <span className="info-value">{club.memberCount}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Địa điểm:</span>
                    <span className="info-value">{club.location}</span>
                  </div>
                </div>
              </div>
              <div className="club-card-actions">
                <button onClick={() => onView(club)} className="btn-view">
                  Xem chi tiết
                </button>
                <button onClick={() => onEdit(club)} className="btn-edit">
                  Sửa
                </button>
                <button onClick={() => onDelete(club.id)} className="btn-delete">
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClubList;






