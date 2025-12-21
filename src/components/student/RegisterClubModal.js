/**
 * RegisterClubModal Component
 * 
 * Modal form để student đăng ký mở club mới:
 * - Form điền thông tin club: tên, mô tả, danh mục, email, địa điểm, phí tham gia, mục tiêu
 * - Validation đầy đủ cho tất cả các trường
 * - Gửi yêu cầu đến admin để duyệt
 * 
 * @param {Object} props
 * @param {Function} props.onClose - Callback khi đóng modal
 * @param {Function} props.onSubmit - Callback khi submit form với clubRequest data
 */

import React, { useState } from 'react';
import { clubCategories, clubCategoryLabels } from '../../data/constants';

const RegisterClubModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'HocThuat', // default theo enum backend rút gọn
    email: '',
    location: '',
    participationFee: '',
    goals: ''
  });

  const [errors, setErrors] = useState({});

  /**
   * FUNCTION: HANDLE INPUT CHANGE
   * 
   * MỤC ĐÍCH: Xử lý khi input thay đổi và xóa error message tương ứng
   * 
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
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * FUNCTION: VALIDATE FORM
   * 
   * MỤC ĐÍCH: Validate form trước khi submit
   * 
   * VALIDATION RULES:
   * - name: Bắt buộc
   * - description: Bắt buộc, tối thiểu 20 ký tự
   * - email: Bắt buộc, format hợp lệ
   * - location: Bắt buộc
   * - participationFee: Nếu có, phải là số >= 0
   * - goals: Bắt buộc, tối thiểu 10 ký tự
   * 
   * @returns {boolean} - true nếu form hợp lệ
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate tên club (bắt buộc)
    if (!formData.name.trim()) {
      newErrors.name = 'Tên câu lạc bộ là bắt buộc';
    }

    // Validate mô tả (bắt buộc, tối thiểu 20 ký tự)
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Mô tả phải có ít nhất 20 ký tự';
    }

    // Validate email (bắt buộc, format hợp lệ)
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate địa điểm (bắt buộc)
    if (!formData.location.trim()) {
      newErrors.location = 'Địa điểm là bắt buộc';
    }

    // Validate phí tham gia (nếu có, phải là số >= 0)
    if (formData.participationFee && isNaN(formData.participationFee)) {
      newErrors.participationFee = 'Phí tham gia phải là số';
    } else if (formData.participationFee && parseFloat(formData.participationFee) < 0) {
      newErrors.participationFee = 'Phí tham gia phải >= 0';
    }

    // Validate mục tiêu hoạt động (bắt buộc, tối thiểu 10 ký tự)
    if (!formData.goals.trim()) {
      newErrors.goals = 'Mục tiêu hoạt động là bắt buộc';
    } else if (formData.goals.trim().length < 10) {
      newErrors.goals = 'Mục tiêu hoạt động phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * FUNCTION: HANDLE SUBMIT FORM
   * 
   * MỤC ĐÍCH: Xử lý khi submit form - validate và tạo clubRequest object
   * 
   * FLOW:
   * 1. Prevent default form submission
   * 2. Validate form
   * 3. Lấy thông tin user từ localStorage
   * 4. Tạo clubRequest object với applicantEmail, applicantName, status, requestDate
   * 5. Gọi onSubmit(clubRequest) để parent component xử lý
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Lấy thông tin user từ localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Tạo club request object
      const clubRequest = {
        ...formData,
        participationFee: formData.participationFee ? parseFloat(formData.participationFee) : 0,
        applicantEmail: user.email,
        applicantName: user.name,
        status: 'pending',
        requestDate: new Date().toISOString().split('T')[0]
      };
      
      onSubmit(clubRequest);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5">
      <div className="bg-white rounded-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
          <h2 className="m-0 text-2xl font-semibold">Đăng ký mở câu lạc bộ mới</h2>
          <button 
            className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-fpt-blue rounded">
            <p className="text-sm text-gray-700 m-0">
              <strong>Lưu ý:</strong> Yêu cầu đăng ký mở câu lạc bộ của bạn sẽ được gửi đến ban quản trị để xem xét và duyệt. 
              Bạn sẽ nhận được thông báo khi yêu cầu được xử lý.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="name" className="mb-2 font-semibold text-gray-800 text-sm">Tên câu lạc bộ *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên câu lạc bộ"
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
                  <option key={cat} value={cat}>{clubCategoryLabels[cat] || cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="mb-2 font-semibold text-gray-800 text-sm">Email liên hệ *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="club@example.com"
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label htmlFor="description" className="mb-2 font-semibold text-gray-800 text-sm">Mô tả câu lạc bộ *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Mô tả về câu lạc bộ, hoạt động, đối tượng tham gia..."
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans resize-y min-h-[80px] focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.description ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.description && <span className="text-red-500 text-xs mt-1">{errors.description}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="location" className="mb-2 font-semibold text-gray-800 text-sm">Địa điểm hoạt động *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ví dụ: Phòng A301, Sân vận động..."
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.location ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.location && <span className="text-red-500 text-xs mt-1">{errors.location}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="participationFee" className="mb-2 font-semibold text-gray-800 text-sm">Phí tham gia (VNĐ)</label>
              <input
                type="number"
                id="participationFee"
                name="participationFee"
                value={formData.participationFee}
                onChange={handleChange}
                placeholder="0 (để trống nếu miễn phí)"
                min="0"
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.participationFee ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.participationFee && <span className="text-red-500 text-xs mt-1">{errors.participationFee}</span>}
            </div>

            <div className="flex flex-col md:col-span-2">
              <label htmlFor="goals" className="mb-2 font-semibold text-gray-800 text-sm">Mục tiêu hoạt động *</label>
              <textarea
                id="goals"
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                rows="3"
                placeholder="Mô tả các mục tiêu và hoạt động dự kiến của câu lạc bộ..."
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans resize-y min-h-[80px] focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.goals ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.goals && <span className="text-red-500 text-xs mt-1">{errors.goals}</span>}
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-8 pt-5 border-t-2 border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gray-200 text-gray-600 hover:bg-gray-300"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
            >
              Gửi yêu cầu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterClubModal;

