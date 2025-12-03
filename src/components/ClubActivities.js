import React, { useState, useEffect } from 'react';
import './ClubActivities.css';

const ClubActivities = ({ club, onUpdateActivities }) => {
  const [activities, setActivities] = useState(club?.activities || []);

  // Update activities when club changes
  useEffect(() => {
    if (club?.activities) {
      setActivities(club.activities);
    }
  }, [club]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tên hoạt động không được để trống';
    }

    if (!formData.date) {
      newErrors.date = 'Ngày tổ chức không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newActivity = {
        ...formData,
        id: editingIndex !== null ? activities[editingIndex].id : Date.now()
      };

      let updatedActivities;
      if (editingIndex !== null) {
        updatedActivities = activities.map((act, idx) => 
          idx === editingIndex ? newActivity : act
        );
      } else {
        updatedActivities = [...activities, newActivity];
      }

      setActivities(updatedActivities);
      onUpdateActivities(updatedActivities);
      setFormData({ title: '', description: '', date: '', location: '' });
      setShowAddForm(false);
      setEditingIndex(null);
    }
  };

  const handleEdit = (index) => {
    setFormData(activities[index]);
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hoạt động này?')) {
      const updatedActivities = activities.filter((_, idx) => idx !== index);
      setActivities(updatedActivities);
      onUpdateActivities(updatedActivities);
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', description: '', date: '', location: '' });
    setShowAddForm(false);
    setEditingIndex(null);
    setErrors({});
  };

  return (
    <div className="club-activities">
      <div className="activities-header">
        <h2>📅 Quản lý hoạt động</h2>
        <button 
          className="btn-add-activity"
          onClick={() => setShowAddForm(true)}
        >
          + Thêm hoạt động
        </button>
      </div>

      {showAddForm && (
        <div className="activity-form-container">
          <form onSubmit={handleSubmit} className="activity-form">
            <h3>{editingIndex !== null ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}</h3>
            
            <div className="form-group">
              <label htmlFor="title">Tên hoạt động *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Workshop Lập trình Web"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về hoạt động..."
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Ngày tổ chức *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={errors.date ? 'error' : ''}
                />
                {errors.date && <span className="error-message">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="location">Địa điểm</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="VD: Phòng A301"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn-cancel">
                Hủy
              </button>
              <button type="submit" className="btn-submit">
                {editingIndex !== null ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="activities-list">
        {activities.length === 0 ? (
          <div className="no-activities">
            <p>Chưa có hoạt động nào. Hãy thêm hoạt động đầu tiên!</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id || index} className="activity-card">
              <div className="activity-card-header">
                <h4>{activity.title}</h4>
                <div className="activity-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(index)}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(index)}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
              <div className="activity-card-body">
                {activity.description && (
                  <p className="activity-desc">{activity.description}</p>
                )}
                <div className="activity-info">
                  <span className="activity-date">
                    📅 {activity.date ? new Date(activity.date).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                  {activity.location && (
                    <span className="activity-location">📍 {activity.location}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClubActivities;

