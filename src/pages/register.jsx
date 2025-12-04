import React, { useState } from 'react';
import { useToast } from '../components/Toast';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    phone: '',
    major: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Check if email already exists
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const emailExists = existingUsers.some(user => user.email === formData.email);
      
      if (emailExists) {
        setErrors({
          submit: 'Email này đã được đăng ký!'
        });
        setLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        role: formData.role,
        studentId: formData.studentId,
        phone: formData.phone,
        major: formData.major,
        registeredAt: new Date().toISOString()
      };

      // Save to localStorage
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      // Also save to user session for auto login
      localStorage.setItem('user', JSON.stringify({
        email: formData.email,
        name: formData.fullName,
        role: formData.role
      }));

      setLoading(false);
      
      // Show success message and redirect
      showToast('Đăng ký thành công! Bạn sẽ được chuyển đến trang chủ.', 'success');
      
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(formData.role);
        }
      }, 500);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-fpt-blue via-fpt-blue-light to-green-500 p-5 font-sans relative overflow-hidden">
      <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(243,113,36,0.1)_0%,transparent_70%)] animate-spin-slow"></div>
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[460px] p-11 animate-slide-in relative z-10 border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-5">
          <div className="text-6xl mb-4 animate-bounce">🎓</div>
          <h1 className="text-3xl text-fpt-blue mb-2.5 font-bold tracking-tight">FPT University</h1>
          <p className="text-gray-600 text-[15px] font-medium">Đăng ký tài khoản mới</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Full Name Input */}
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên của bạn"
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role">Vai trò *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={errors.role ? 'error' : ''}
            >
              <option value="student">Sinh viên</option>
              <option value="club_leader">Club Leader</option>
            </select>
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

          {/* Student ID (only for students) */}
          {formData.role === 'student' && (
            <div className="form-group">
              <label htmlFor="studentId">Mã sinh viên *</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Nhập mã sinh viên"
                className={errors.studentId ? 'error' : ''}
              />
              {errors.studentId && <span className="error-message">{errors.studentId}</span>}
            </div>
          )}

          {/* Major (only for students) */}
          {formData.role === 'student' && (
            <div className="form-group">
              <label htmlFor="major">Chuyên ngành *</label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="Nhập chuyên ngành"
                className={errors.major ? 'error' : ''}
              />
              {errors.major && <span className="error-message">{errors.major}</span>}
            </div>
          )}

          {/* Phone Input */}
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

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">Mật khẩu *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Confirm Password Input */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className={errors.confirmPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="alert alert-error">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang đăng ký...
              </>
            ) : 'Đăng ký'}
          </button>
        </form>

        {/* Login Link */}
        <div className="login-footer">
          <p>
            Đã có tài khoản?{' '}
            <a href="#" className="register-link" onClick={(e) => {
              e.preventDefault();
              if (onSwitchToLogin) {
                onSwitchToLogin();
              }
            }}>
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

