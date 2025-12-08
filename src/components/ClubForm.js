import React, { useState, useEffect } from 'react';
import { clubCategories, statusOptions } from '../data/mockData';
import './ClubForm.css';

const ClubForm = ({ club, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Công nghệ',
    foundedDate: '',
    president: '',
    memberCount: 0,
    status: 'Hoạt động',
    email: '',
    location: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (club) {
      setFormData(club);
    }
  }, [club]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'memberCount' ? parseInt(value) || 0 : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên câu lạc bộ là bắt buộc';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    }

    if (!formData.foundedDate) {
      newErrors.foundedDate = 'Ngày thành lập là bắt buộc';
    }

    if (!formData.president.trim()) {
      newErrors.president = 'Tên chủ tịch là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Địa điểm là bắt buộc';
    }

    if (formData.memberCount < 0) {
      newErrors.memberCount = 'Số thành viên phải >= 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="club-form-overlay">
      <div className="club-form-container">
        <div className="form-header">
          <h2>{club ? 'Chỉnh sửa câu lạc bộ' : 'Thêm câu lạc bộ mới'}</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="club-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Tên câu lạc bộ *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Danh mục *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {clubCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Mô tả *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="president">Chủ tịch *</label>
              <input
                type="text"
                id="president"
                name="president"
                value={formData.president}
                onChange={handleChange}
                className={errors.president ? 'error' : ''}
              />
              {errors.president && <span className="error-message">{errors.president}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="foundedDate">Ngày thành lập *</label>
              <input
                type="date"
                id="foundedDate"
                name="foundedDate"
                value={formData.foundedDate}
                onChange={handleChange}
                className={errors.foundedDate ? 'error' : ''}
              />
              {errors.foundedDate && <span className="error-message">{errors.foundedDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="location">Địa điểm *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? 'error' : ''}
              />
              {errors.location && <span className="error-message">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="memberCount">Số thành viên</label>
              <input
                type="number"
                id="memberCount"
                name="memberCount"
                value={formData.memberCount}
                onChange={handleChange}
                min="0"
                className={errors.memberCount ? 'error' : ''}
              />
              {errors.memberCount && <span className="error-message">{errors.memberCount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              {club ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClubForm;






