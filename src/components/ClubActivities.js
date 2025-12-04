import React, { useState, useEffect } from 'react';

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
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b-2 border-gray-200">
        <h2 className="text-2xl font-bold text-fpt-blue m-0 flex items-center gap-2">
          <span>📅</span> Quản lý hoạt động
        </h2>
        <button 
          className="px-6 py-3 bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-md hover:-translate-y-1 hover:shadow-lg"
          onClick={() => setShowAddForm(true)}
        >
          + Thêm hoạt động
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200">
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold text-fpt-blue mb-6 m-0">
              {editingIndex !== null ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}
            </h3>
            
            <div className="mb-5">
              <label htmlFor="title" className="block mb-2 text-sm font-semibold text-gray-800">Tên hoạt động *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Workshop Lập trình Web"
                className={`w-full px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.title ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.title && <span className="block mt-1 text-xs text-red-500">{errors.title}</span>}
            </div>

            <div className="mb-5">
              <label htmlFor="description" className="block mb-2 text-sm font-semibold text-gray-800">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về hoạt động..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all font-sans resize-y min-h-[100px] focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label htmlFor="date" className="block mb-2 text-sm font-semibold text-gray-800">Ngày tổ chức *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                    errors.date ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.date && <span className="block mt-1 text-xs text-red-500">{errors.date}</span>}
              </div>

              <div>
                <label htmlFor="location" className="block mb-2 text-sm font-semibold text-gray-800">Địa điểm</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="VD: Phòng A301"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-5 border-t-2 border-gray-200">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="px-6 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-all bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg"
              >
                {editingIndex !== null ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-12 px-5 text-gray-500 italic bg-gray-50 rounded-xl">
            <p className="m-0">Chưa có hoạt động nào. Hãy thêm hoạt động đầu tiên!</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id || index} className="bg-white border-2 border-gray-200 rounded-xl p-5 transition-all hover:border-fpt-blue hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h4 className="text-lg font-semibold text-gray-800 m-0">{activity.title}</h4>
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 bg-green-500 text-white border-none rounded-lg text-xs font-medium cursor-pointer transition-all hover:bg-green-600"
                    onClick={() => handleEdit(index)}
                  >
                    ✏️ Sửa
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-500 text-white border-none rounded-lg text-xs font-medium cursor-pointer transition-all hover:bg-red-600"
                    onClick={() => handleDelete(index)}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
              <div className="mt-4">
                {activity.description && (
                  <p className="text-gray-600 leading-relaxed mb-4">{activity.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <span>📅</span>
                    {activity.date ? new Date(activity.date).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                  {activity.location && (
                    <span className="flex items-center gap-2">
                      <span>📍</span>
                      {activity.location}
                    </span>
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

