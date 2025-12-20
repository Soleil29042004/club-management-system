/**
 * ClubForm Component
 * 
 * Component form để thêm/sửa thông tin club:
 * - Form modal để chỉnh sửa mô tả, địa điểm, logo
 * - Validation cho các trường bắt buộc
 * - Hỗ trợ cả add và edit mode
 * 
 * @param {Object} props
 * @param {Object|null} props.club - Club object cần edit (null nếu là add mode)
 * @param {Function} props.onSubmit - Callback khi submit form
 * @param {Function} props.onCancel - Callback khi cancel/hủy form
 */

import React, { useState, useEffect } from 'react';

const ClubForm = ({ club, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    logo: ''
  });

  const [errors, setErrors] = useState({});

  /**
   * Load dữ liệu club vào form khi edit mode
   */
  useEffect(() => {
    if (club) {
      setFormData({
        description: club.description || '',
        location: club.location || '',
        logo: club.logo || ''
      });
    }
  }, [club]);

  /**
   * Xử lý khi input thay đổi
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Xóa error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate form trước khi submit
   * @returns {boolean} - true nếu form hợp lệ
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate mô tả (bắt buộc)
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    }

    // Validate địa điểm (bắt buộc)
    if (!formData.location.trim()) {
      newErrors.location = 'Địa điểm là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Xử lý khi submit form
   * @param {Event} e - Form submit event
   */
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
          <div className="grid grid-cols-1 gap-5">
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
              <label htmlFor="logo" className="mb-2 font-semibold text-gray-800 text-sm">Logo URL</label>
              <input
                type="url"
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 border-gray-200"
              />
              <span className="text-xs text-gray-500 mt-1">Dán URL logo hợp lệ (PNG/JPG/SVG).</span>
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

