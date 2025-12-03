import React, { useState, useEffect } from 'react';
import './JoinRequestModal.css';

const JoinRequestModal = ({ club, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    phone: '',
    studentId: '',
    major: '',
    reason: '',
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const detailedUser = registeredUsers.find(u => u.email === user.email);
    
    if (detailedUser) {
      setFormData(prev => ({
        ...prev,
        phone: detailedUser.phone || '',
        studentId: detailedUser.studentId || '',
        major: detailedUser.major || ''
      }));
    }
  }, []);

  if (!club) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Mã sinh viên không được để trống';
    }

    if (!formData.major.trim()) {
      newErrors.major = 'Chuyên ngành không được để trống';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Lý do gia nhập không được để trống';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu không được để trống';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc không được để trống';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content join-request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gửi yêu cầu tham gia</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="club-details">
            <p><strong>Câu lạc bộ:</strong> {club.name}</p>
            <p><strong>Danh mục:</strong> {club.category}</p>
            <p><strong>Chủ tịch:</strong> {club.president}</p>
          </div>

          <form onSubmit={handleSubmit} className="join-request-form">
            <div className="form-section">
              <h3>Thông tin cá nhân</h3>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="studentId">Mã sinh viên *</label>
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
            </div>

            <div className="form-section">
              <h3>Lý do gia nhập</h3>
              <div className="form-group">
                <label htmlFor="reason"></label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Vui lòng nêu rõ lý do bạn muốn tham gia câu lạc bộ này..."
                  rows="4"
                  className={errors.reason ? 'error' : ''}
                />
                {errors.reason && <span className="error-message">{errors.reason}</span>}
              </div>
            </div>

            <div className="form-section">
              <h3>Thời gian tham gia</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Từ ngày *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={errors.startDate ? 'error' : ''}
                  />
                  {errors.startDate && <span className="error-message">{errors.startDate}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">Đến ngày *</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                    className={errors.endDate ? 'error' : ''}
                  />
                  {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="btn-submit">
                Gửi yêu cầu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestModal;

