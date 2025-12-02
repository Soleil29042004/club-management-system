import React, { useState } from 'react';
import '../styles/login.css';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Mock data for testing
  const mockUsers = {
    'student@gmail.com': { password: '123456', role: 'student', name: 'Nguyễn Văn A' },
    'leader@gmail.com': { password: '123456', role: 'club_leader', name: 'Trần Thị B' },
    'admin@gmail.com': { password: '123456', role: 'admin', name: 'Admin' }
  };

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
      // Check mock users first
      let user = mockUsers[formData.email];
      
      // If not found in mock users, check registered users
      if (!user) {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const registeredUser = registeredUsers.find(u => u.email === formData.email);
        if (registeredUser) {
          user = {
            password: registeredUser.password,
            role: registeredUser.role,
            name: registeredUser.name
          };
        }
      }
      
      if (user && user.password === formData.password) {
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          name: user.name,
          role: user.role
        }));
        
        // Automatically navigate based on user role
        if (user.role === 'admin' || user.role === 'student' || user.role === 'club_leader') {
          if (onLoginSuccess) {
            onLoginSuccess(user.role);
          }
        } else {
          setErrors({
            submit: 'Vai trò này chưa được hỗ trợ!'
          });
        }
      } else {
        setErrors({
          submit: 'Email hoặc mật khẩu không đúng!'
        });
      }
      
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🎓</div>
          <h1>FPT University</h1>
          <p>Hệ thống quản lý Câu lạc bộ Sinh viên</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
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

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
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

          {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" name="remember" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>
              Quên mật khẩu?
            </a>
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
                Đang đăng nhập...
              </>
            ) : 'Đăng nhập'}
          </button>
        </form>

        {/* Register Link */}
        <div className="login-footer">
          <p>
            Chưa có tài khoản?{' '}
            <a href="#" className="register-link" onClick={(e) => {
              e.preventDefault();
              if (onSwitchToRegister) {
                onSwitchToRegister();
              }
            }}>
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
