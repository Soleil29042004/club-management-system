import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';

const ClubFeeSettings = ({ club, onUpdate }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    participationFee: 0,
    membershipDuration: 6 // Số tháng mặc định
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (club) {
      setFormData({
        participationFee: club.participationFee || 0,
        membershipDuration: club.membershipDuration || 6
      });
    }
  }, [club]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'participationFee' || name === 'membershipDuration' 
        ? (value === '' ? '' : parseInt(value) || 0)
        : value
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
      newErrors.membershipDuration = 'Thời hạn tham gia phải ít nhất 1 tháng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin!', 'error');
      return;
    }

    const updatedClub = {
      ...club,
      participationFee: formData.participationFee,
      membershipDuration: formData.membershipDuration
    };

    onUpdate(updatedClub);
    showToast('Đã cập nhật cài đặt phí và thời hạn tham gia thành công!', 'success');
  };

  const handleReset = () => {
    if (club) {
      setFormData({
        participationFee: club.participationFee || 0,
        membershipDuration: club.membershipDuration || 6
      });
      setErrors({});
    }
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
    <div className="max-w-[900px] mx-auto">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg mb-8 border border-fpt-blue/10 p-8">
        <h1 className="text-3xl font-bold text-fpt-blue mb-2">💰 Cài đặt Phí và Thời hạn tham gia</h1>
        <p className="text-gray-600 text-lg">Quản lý phí tham gia và thời hạn thành viên cho <strong className="text-fpt-blue">{club.name}</strong></p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit}>
          {/* Phí tham gia */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span>💵</span>
              <span>Phí tham gia</span>
            </h2>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 mb-6">
              <div className="flex flex-col">
                <label htmlFor="participationFee" className="mb-3 font-semibold text-gray-800 text-base">
                  Phí tham gia (VNĐ) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="participationFee"
                    name="participationFee"
                    value={formData.participationFee}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    placeholder="Nhập phí tham gia"
                    className={`w-full px-4 py-3 pr-20 border-2 rounded-lg text-lg font-semibold transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                      errors.participationFee ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">VNĐ</span>
                </div>
                {errors.participationFee && (
                  <span className="text-red-500 text-sm mt-2 block">{errors.participationFee}</span>
                )}
                <p className="text-sm text-gray-600 mt-3">
                  <strong>Lưu ý:</strong> Đặt 0 nếu câu lạc bộ miễn phí. Phí này sẽ được áp dụng cho các thành viên mới tham gia.
                </p>
                <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700 m-0">
                    <strong>Phí hiện tại:</strong>{' '}
                    <span className="text-fpt-blue font-bold text-lg">
                      {club.participationFee ? club.participationFee.toLocaleString('vi-VN') : 0} VNĐ
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Thời hạn tham gia */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span>⏰</span>
              <span>Thời hạn tham gia</span>
            </h2>

            <div className="space-y-6">
              {/* Thời hạn theo tháng */}
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <div className="flex flex-col">
                  <label htmlFor="membershipDuration" className="mb-3 font-semibold text-gray-800 text-base">
                    Thời hạn tham gia (tháng) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="membershipDuration"
                      name="membershipDuration"
                      value={formData.membershipDuration}
                      onChange={handleChange}
                      min="1"
                      max="24"
                      placeholder="Nhập số tháng"
                      className={`w-full px-4 py-3 pr-20 border-2 rounded-lg text-lg font-semibold transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                        errors.membershipDuration ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">tháng</span>
                  </div>
                  {errors.membershipDuration && (
                    <span className="text-red-500 text-sm mt-2 block">{errors.membershipDuration}</span>
                  )}
                  <p className="text-sm text-gray-600 mt-3">
                    Thời hạn mặc định cho các thành viên mới tham gia câu lạc bộ (từ 1 đến 24 tháng).
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Thông tin hiện tại */}
          <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Thông tin hiện tại</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Phí tham gia:</p>
                <p className="text-lg font-bold text-fpt-blue">
                  {club.participationFee ? club.participationFee.toLocaleString('vi-VN') : 0} VNĐ
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Thời hạn mặc định:</p>
                <p className="text-lg font-bold text-fpt-blue">
                  {club.membershipDuration || 6} tháng
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
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

export default ClubFeeSettings;

