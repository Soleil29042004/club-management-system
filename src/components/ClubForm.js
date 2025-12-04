import React, { useState, useEffect } from 'react';
import { clubCategories, statusOptions } from '../data/mockData';

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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5">
      <div className="bg-white rounded-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl">
          <h2 className="m-0 text-2xl font-semibold">{club ? 'Chỉnh sửa câu lạc bộ' : 'Thêm câu lạc bộ mới'}</h2>
          <button 
            className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
            onClick={onCancel}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col">
              <label htmlFor="name" className="mb-2 font-semibold text-gray-800 text-sm">Tên câu lạc bộ *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="category" className="mb-2 font-semibold text-gray-800 text-sm">Danh mục *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
              >
                {clubCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label htmlFor="description" className="mb-2 font-semibold text-gray-800 text-sm">Mô tả *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans resize-y min-h-[80px] focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.description ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.description && <span className="text-red-500 text-xs mt-1">{errors.description}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="president" className="mb-2 font-semibold text-gray-800 text-sm">Chủ tịch *</label>
              <input
                type="text"
                id="president"
                name="president"
                value={formData.president}
                onChange={handleChange}
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.president ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.president && <span className="text-red-500 text-xs mt-1">{errors.president}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="mb-2 font-semibold text-gray-800 text-sm">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="foundedDate" className="mb-2 font-semibold text-gray-800 text-sm">Ngày thành lập *</label>
              <input
                type="date"
                id="foundedDate"
                name="foundedDate"
                value={formData.foundedDate}
                onChange={handleChange}
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.foundedDate ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.foundedDate && <span className="text-red-500 text-xs mt-1">{errors.foundedDate}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="location" className="mb-2 font-semibold text-gray-800 text-sm">Địa điểm *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.location ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.location && <span className="text-red-500 text-xs mt-1">{errors.location}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="memberCount" className="mb-2 font-semibold text-gray-800 text-sm">Số thành viên</label>
              <input
                type="number"
                id="memberCount"
                name="memberCount"
                value={formData.memberCount}
                onChange={handleChange}
                min="0"
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.memberCount ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.memberCount && <span className="text-red-500 text-xs mt-1">{errors.memberCount}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="status" className="mb-2 font-semibold text-gray-800 text-sm">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-8 pt-5 border-t-2 border-gray-100 md:col-span-2">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gray-200 text-gray-600 hover:bg-gray-300"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
            >
              {club ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClubForm;

