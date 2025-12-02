import React from 'react';
import { clubCategories, statusOptions } from '../data/mockData';
import './ClubInfoForm.css';

const ClubInfoForm = ({ formData, onFormChange, onFormSubmit, onFormCancel }) => {
  return (
    <div className="manage-club-section">
      <div className="edit-club-form">
        <div className="form-header">
          <h2>Chỉnh sửa thông tin Câu lạc bộ</h2>
        </div>
        <form onSubmit={onFormSubmit} className="club-form">
          <div className="form-row">
            <div className="form-group">
              <label>Tên câu lạc bộ *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Danh mục *</label>
              <select
                name="category"
                value={formData.category}
                onChange={onFormChange}
                required
              >
                {clubCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onFormChange}
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày thành lập *</label>
              <input
                type="date"
                name="foundedDate"
                value={formData.foundedDate}
                onChange={onFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Trạng thái *</label>
              <select
                name="status"
                value={formData.status}
                onChange={onFormChange}
                required
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onFormChange}
              />
            </div>
            <div className="form-group">
              <label>Địa điểm</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={onFormChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Số thành viên</label>
            <input
              type="number"
              name="memberCount"
              value={formData.memberCount}
              onChange={onFormChange}
              min="0"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onFormCancel}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClubInfoForm;

