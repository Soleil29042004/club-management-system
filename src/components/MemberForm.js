import React, { useState, useEffect } from 'react';
import { memberRoles, statusOptions } from '../data/mockData';
import './MemberForm.css';

const MemberForm = ({ member, clubs, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    phone: '',
    clubId: clubs.length > 0 ? clubs[0].id : '',
    clubName: clubs.length > 0 ? clubs[0].name : '',
    role: 'Thành viên',
    joinDate: '',
    status: 'Hoạt động',
    major: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (member) {
      setFormData(member);
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'clubId') {
      const selectedClub = clubs.find(club => club.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        clubId: parseInt(value),
        clubName: selectedClub ? selectedClub.name : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'MSSV là bắt buộc';
    } else if (!/^[A-Z]{2}\d{6}$/.test(formData.studentId)) {
      newErrors.studentId = 'MSSV phải có định dạng: 2 chữ cái + 6 số (VD: SE150001)';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10 số và bắt đầu bằng 0';
    }

    if (!formData.clubId) {
      newErrors.clubId = 'Vui lòng chọn câu lạc bộ';
    }

    if (!formData.joinDate) {
      newErrors.joinDate = 'Ngày tham gia là bắt buộc';
    }

    if (!formData.major.trim()) {
      newErrors.major = 'Chuyên ngành là bắt buộc';
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
    <div className="member-form-overlay">
      <div className="member-form-container">
        <div className="form-header">
          <h2>{member ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="studentId">MSSV *</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="VD: SE150001"
                className={errors.studentId ? 'error' : ''}
              />
              {errors.studentId && <span className="error-message">{errors.studentId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Họ và tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@student.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0901234567"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="clubId">Câu lạc bộ *</label>
              <select
                id="clubId"
                name="clubId"
                value={formData.clubId}
                onChange={handleChange}
                className={errors.clubId ? 'error' : ''}
              >
                <option value="">-- Chọn câu lạc bộ --</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
              {errors.clubId && <span className="error-message">{errors.clubId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="role">Vai trò *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                {memberRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="major">Chuyên ngành *</label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="VD: Kỹ thuật phần mềm"
                className={errors.major ? 'error' : ''}
              />
              {errors.major && <span className="error-message">{errors.major}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="joinDate">Ngày tham gia *</label>
              <input
                type="date"
                id="joinDate"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                className={errors.joinDate ? 'error' : ''}
              />
              {errors.joinDate && <span className="error-message">{errors.joinDate}</span>}
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
              {member ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;






