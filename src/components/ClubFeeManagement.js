import React, { useState } from 'react';

const ClubFeeManagement = ({ club, onUpdate }) => {
  const [formData, setFormData] = useState({
    participationFee: club?.participationFee || 0,
    membershipDuration: club?.membershipDuration || 6
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const valueNum = name === 'membershipDuration' || name === 'participationFee' 
      ? parseInt(value) || 0 
      : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: valueNum
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.participationFee < 0) {
      newErrors.participationFee = 'Phí tham gia không được âm';
    }

    if (formData.membershipDuration < 1) {
      newErrors.membershipDuration = 'Thời hạn phải ít nhất 1 tháng';
    }

    if (formData.membershipDuration > 60) {
      newErrors.membershipDuration = 'Thời hạn không được vượt quá 60 tháng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onUpdate({
      participationFee: formData.participationFee,
      membershipDuration: formData.membershipDuration
    });
  };

  const handleReset = () => {
    setFormData({
      participationFee: club?.participationFee || 0,
      membershipDuration: club?.membershipDuration || 6
    });
    setErrors({});
  };

  if (!club) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy thông tin club</h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light p-6">
        <h2 className="text-2xl font-bold text-white m-0 flex items-center gap-3">
          <span>💰</span>
          <span>Quản lý Phí tham gia & Thời hạn</span>
        </h2>
        <p className="text-white/90 text-base mt-2">Cập nhật phí tham gia và thời hạn thành viên cho câu lạc bộ</p>
      </div>

      <div className="p-8">
        {/* Current Information */}
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Thông tin hiện tại</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <span className="text-sm text-gray-600 font-medium block mb-2">Phí tham gia hiện tại:</span>
              <span className="text-xl font-bold text-fpt-blue">
                {club.participationFee 
                  ? `${club.participationFee.toLocaleString('vi-VN')} VNĐ`
                  : 'Miễn phí'}
              </span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <span className="text-sm text-gray-600 font-medium block mb-2">Thời hạn hiện tại:</span>
              <span className="text-xl font-bold text-fpt-blue">
                {club.membershipDuration || 6} tháng
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>✏️</span>
                <span>Chỉnh sửa thông tin</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="participationFee" className="mb-2 font-semibold text-gray-800 text-sm">
                  Phí tham gia (VNĐ) *
                </label>
                <input
                  type="number"
                  id="participationFee"
                  name="participationFee"
                  value={formData.participationFee}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  placeholder="Nhập phí tham gia (0 = Miễn phí)"
                  className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                    errors.participationFee ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.participationFee && (
                  <span className="text-red-500 text-xs mt-1">{errors.participationFee}</span>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Nhập 0 nếu club miễn phí tham gia
                </p>
              </div>

              <div className="flex flex-col">
                <label htmlFor="membershipDuration" className="mb-2 font-semibold text-gray-800 text-sm">
                  Thời hạn thành viên (tháng) *
                </label>
                <input
                  type="number"
                  id="membershipDuration"
                  name="membershipDuration"
                  value={formData.membershipDuration}
                  onChange={handleChange}
                  min="1"
                  max="60"
                  placeholder="Nhập số tháng (1-60)"
                  className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                    errors.membershipDuration ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.membershipDuration && (
                  <span className="text-red-500 text-xs mt-1">{errors.membershipDuration}</span>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Thời hạn từ 1 đến 60 tháng
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>👁️</span>
                <span>Xem trước</span>
              </h4>
              <div className="bg-white p-4 rounded-lg border border-green-100">
                <p className="text-gray-700 m-0">
                  <strong>Phí tham gia:</strong>{' '}
                  <span className="text-fpt-blue font-semibold">
                    {formData.participationFee 
                      ? `${formData.participationFee.toLocaleString('vi-VN')} VNĐ`
                      : 'Miễn phí'}
                  </span>
                  {' / '}
                  <strong>Thời hạn:</strong>{' '}
                  <span className="text-fpt-blue font-semibold">
                    {formData.membershipDuration} tháng
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2 m-0">
                  Đây là cách thông tin sẽ hiển thị cho sinh viên trong danh sách club
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6 mt-8 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gray-200 text-gray-600 hover:bg-gray-300"
            >
              🔄 Đặt lại
            </button>
            <button
              type="submit"
              className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
            >
              💾 Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClubFeeManagement;

