import React, { useState } from 'react';
import { useToast } from '../components/Toast';

const Register = ({ onRegisterSuccess, onSwitchToLogin, onNavigateToHome }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // UI vẫn giữ, API sẽ bỏ qua
    studentId: '',
    phone: '',
    major: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (formData.role === 'student') {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Mã sinh viên không được để trống';
      }
      if (!formData.major.trim()) {
        newErrors.major = 'Chuyên ngành không được để trống';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors(prev => ({ ...prev, submit: '' }));
    
    try {
      // Swagger: POST /users with studentCode, fullName, email, password, phoneNumber, major
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentCode: formData.studentId.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phoneNumber: formData.phone.trim(),
          major: formData.major.trim()
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data.message || data.error || 'Đăng ký thất bại. Vui lòng thử lại!';
        setErrors({ submit: message });
        return;
      }

      // Không lưu token và user data để đảm bảo về trang home chưa đăng nhập
      // User sẽ cần đăng nhập lại sau khi đăng ký thành công
      
      showToast('Đăng ký thành công! Bạn sẽ được chuyển đến trang chủ.', 'success');
      
      // Chuyển về trang home sau khi đăng ký thành công
      setTimeout(() => {
        if (onNavigateToHome) {
          onNavigateToHome();
        }
      }, 1000); // Delay 1 giây để user thấy thông báo thành công
    } catch (error) {
      console.error('Register error:', error);
      setErrors({ submit: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-600 via-blue-400 to-green-500 p-5 font-sans relative overflow-hidden">
      <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(243,113,36,0.1)_0%,transparent_70%)] animate-spin-slow"></div>
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[460px] p-11 animate-slide-in relative z-10 border border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Home Button */}
        {onNavigateToHome && (
          <button
            onClick={onNavigateToHome}
            className="absolute top-4 left-4 text-gray-600 hover:text-fpt-blue transition-colors p-2 rounded-lg hover:bg-gray-100"
            title="Về trang chủ"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        )}
        
        <div className="text-center mb-5">
          {/* 3D Graduation Cap Icon */}
          <div className="mb-4 flex justify-center">
            <button
              onClick={onNavigateToHome}
              className="hover:scale-110 transition-transform"
            >
              <div className="text-6xl" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}>
                🎓
              </div>
            </button>
          </div>
          <h1 className="text-3xl text-fpt-blue mb-2.5 font-bold tracking-tight">
            {onNavigateToHome ? (
              <button
                onClick={onNavigateToHome}
                className="hover:text-fpt-orange transition-colors"
              >
                ClubHub
              </button>
            ) : (
              'ClubHub'
            )}
          </h1>
          <p className="text-gray-600 text-[15px] font-medium">Đăng ký tài khoản mới</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Full Name Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-sm font-semibold text-gray-800">Họ và tên *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên của bạn"
              className={`px-4 py-3.5 border-2 rounded-xl text-[15px] transition-all font-sans ${
                errors.fullName 
                  ? 'border-red-500' 
                  : 'border-gray-300 focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 focus:bg-blue-50/50'
              }`}
            />
            {errors.fullName && (
              <span className="text-red-500 text-xs mt-[-4px] flex items-center gap-1">
                <span>⚠️</span>
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-800">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
              className={`px-4 py-3.5 border-2 rounded-xl text-[15px] transition-all font-sans ${
                errors.email 
                  ? 'border-red-500' 
                  : 'border-gray-300 focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 focus:bg-blue-50/50'
              }`}
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-[-4px] flex items-center gap-1">
                <span>⚠️</span>
                {errors.email}
              </span>
            )}
          </div>

          {/* Student ID */}
          <div className="flex flex-col gap-2">
            <label htmlFor="studentId" className="text-sm font-semibold text-gray-800">Mã sinh viên *</label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="Nhập mã sinh viên"
              className={`px-4 py-3.5 border-2 rounded-xl text-[15px] transition-all font-sans ${
                errors.studentId 
                  ? 'border-red-500' 
                  : 'border-gray-300 focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 focus:bg-blue-50/50'
              }`}
            />
            {errors.studentId && (
              <span className="text-red-500 text-xs mt-[-4px] flex items-center gap-1">
                <span>⚠️</span>
                {errors.studentId}
              </span>
            )}
          </div>

          {/* Major */}
          <div className="flex flex-col gap-2">
            <label htmlFor="major" className="text-sm font-semibold text-gray-800">Chuyên ngành *</label>
            <input
              type="text"
              id="major"
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="Nhập chuyên ngành"
              className={`px-4 py-3.5 border-2 rounded-xl text-[15px] transition-all font-sans ${
                errors.major 
                  ? 'border-red-500' 
                  : 'border-gray-300 focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 focus:bg-blue-50/50'
              }`}
            />
            {errors.major && (
              <span className="text-red-500 text-xs mt-[-4px] flex items-center gap-1">
                <span>⚠️</span>
                {errors.major}
              </span>
            )}
          </div>

          {/* Phone Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-semibold text-gray-800">Số điện thoại *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className={`px-4 py-3.5 border-2 rounded-xl text-[15px] transition-all font-sans ${
                errors.phone 
                  ? 'border-red-500' 
                  : 'border-gray-300 focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 focus:bg-blue-50/50'
              }`}
            />
            {errors.phone && (
              <span className="text-red-500 text-xs mt-[-4px] flex items-center gap-1">
                <span>⚠️</span>
                {errors.phone}
              </span>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-800">Mật khẩu *</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl text-[15px] transition-all font-sans ${
                  errors.password 
                    ? 'border-red-500' 
                    : 'border-gray-300 focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 focus:bg-blue-50/50'
                }`}
              />
              <button
                type="button"
                className="absolute right-3 bg-transparent border-none cursor-pointer text-xl p-2 transition-transform hover:scale-110 text-purple-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs mt-[-4px] flex items-center gap-1">
                <span>⚠️</span>
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-800">Xác nhận mật khẩu *</label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl text-[15px] transition-all font-sans ${
                  errors.confirmPassword 
                    ? 'border-red-500' 
                    : 'border-gray-300 focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 focus:bg-blue-50/50'
                }`}
              />
              <button
                type="button"
                className="absolute right-3 bg-transparent border-none cursor-pointer text-xl p-2 transition-transform hover:scale-110 text-purple-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs mt-[-4px] flex items-center gap-1">
                <span>⚠️</span>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3.5 rounded-xl text-sm animate-shake bg-red-50 text-red-700 border-2 border-red-400">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="py-4 bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white border-none rounded-xl text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 mt-2.5 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-[18px] h-[18px] border-[3px] border-white/30 border-t-white rounded-full animate-spin"></span>
                Đang đăng ký...
              </>
            ) : 'Đăng ký'}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-7 pt-6 border-t border-gray-300 text-sm text-gray-600">
          <p>
            Đã có tài khoản?{' '}
              <button
                type="button"
                className="text-fpt-blue no-underline font-bold transition-all hover:text-fpt-orange hover:underline"
                onClick={() => {
                  if (onSwitchToLogin) {
                    onSwitchToLogin();
                  }
                }}
              >
                Đăng nhập ngay
              </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
