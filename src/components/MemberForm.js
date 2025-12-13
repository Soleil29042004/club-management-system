import React, { useState, useEffect } from 'react';
import { memberRoles, statusOptions } from '../data/constants';

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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5">
      <div className="bg-white rounded-xl w-full max-w-[900px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl">
          <h2 className="m-0 text-2xl font-semibold">{member ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</h2>
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
              <label htmlFor="studentId" className="mb-2 font-semibold text-gray-800 text-sm">MSSV *</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="VD: SE150001"
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.studentId ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.studentId && <span className="text-red-500 text-xs mt-1">{errors.studentId}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="fullName" className="mb-2 font-semibold text-gray-800 text-sm">Họ và tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.fullName && <span className="text-red-500 text-xs mt-1">{errors.fullName}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="mb-2 font-semibold text-gray-800 text-sm">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@student.com"
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="phone" className="mb-2 font-semibold text-gray-800 text-sm">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0901234567"
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.phone ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="clubId" className="mb-2 font-semibold text-gray-800 text-sm">Câu lạc bộ *</label>
              <select
                id="clubId"
                name="clubId"
                value={formData.clubId}
                onChange={handleChange}
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.clubId ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">-- Chọn câu lạc bộ --</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
              {errors.clubId && <span className="text-red-500 text-xs mt-1">{errors.clubId}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="role" className="mb-2 font-semibold text-gray-800 text-sm">Vai trò *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
              >
                {memberRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="major" className="mb-2 font-semibold text-gray-800 text-sm">Chuyên ngành *</label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="VD: Kỹ thuật phần mềm"
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.major ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.major && <span className="text-red-500 text-xs mt-1">{errors.major}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="joinDate" className="mb-2 font-semibold text-gray-800 text-sm">Ngày tham gia *</label>
              <input
                type="date"
                id="joinDate"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                  errors.joinDate ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.joinDate && <span className="text-red-500 text-xs mt-1">{errors.joinDate}</span>}
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
              {member ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;

