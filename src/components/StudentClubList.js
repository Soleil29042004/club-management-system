import React, { useState } from 'react';
import './StudentClubList.css';

const StudentClubList = ({ 
  clubs, 
  joinRequests, 
  payments, 
  onJoinRequest, 
  getRequestStatus, 
  hasPayment,
  onViewDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || club.category === filterCategory;
    return matchesSearch && matchesCategory && club.status === 'Hoạt động';
  });

  const categories = [...new Set(clubs.map(club => club.category))];

  return (
    <div className="clubs-section">
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
        </div>
      </div>

      <div className="clubs-grid">
        {filteredClubs.length === 0 ? (
          <div className="no-results">
            <p>Không tìm thấy câu lạc bộ nào</p>
          </div>
        ) : (
          filteredClubs.map(club => {
            const requestStatus = getRequestStatus(club.id);
            const paid = hasPayment(club.id);
            
            return (
              <div key={club.id} className="club-card">
                <div className="club-card-header">
                  <h3>{club.name}</h3>
                  <span className="status-badge status-active">
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
                    <div className="info-item">
                      <span className="info-label">Phí tham gia:</span>
                      <span className="info-value">
                        {club.participationFee ? `${club.participationFee.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="club-card-actions">
                  <button 
                    onClick={() => onViewDetails && onViewDetails(club)} 
                    className="btn-details"
                  >
                    📋 Chi tiết
                  </button>
                  {requestStatus === 'pending' && (
                    <span className="request-badge pending">Đang chờ duyệt</span>
                  )}
                  {requestStatus === 'approved' && (
                    <span className="request-badge approved">Đã được chấp nhận</span>
                  )}
                  {requestStatus === 'rejected' && (
                    <span className="request-badge rejected">Đã bị từ chối</span>
                  )}
                  {!requestStatus && (
                    <button 
                      onClick={() => onJoinRequest(club)} 
                      className="btn-join"
                    >
                      Gửi yêu cầu tham gia
                    </button>
                  )}
                  {paid && (
                    <span className="payment-badge">✓ Đã nộp phí</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentClubList;

