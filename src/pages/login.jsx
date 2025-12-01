import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
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
      const user = mockUsers[formData.email];
      
      if (user && user.password === formData.password && user.role === formData.role) {
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          name: user.name,
          role: user.role
        }));
        
        alert(`Đăng nhập thành công!\nChào mừng ${user.name}`);
        
        // Redirect based on role
        switch (formData.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'club_leader':
            navigate('/club-leader/dashboard');
            break;
          case 'student':
          default:
            navigate('/student/dashboard');
            break;
        }
      } else {
        setErrors({
          submit: 'Email, mật khẩu hoặc vai trò không đúng!'
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
          <h1>Hệ thống quản lý CLB</h1>
          <p>Đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* Demo accounts info */}
        <div className="demo-info">
          <p><strong>Tài khoản demo:</strong></p>
          <ul>
            <li>Student: student@gmail.com / 123456</li>
            <li>Club Leader: leader@gmail.com / 123456</li>
            <li>Admin: admin@gmail.com / 123456</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role">Vai trò</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={errors.role ? 'error' : ''}
            >
              <option value="student">Sinh viên</option>
              <option value="club_leader">Club Leader</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

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
            <a href="#" className="register-link" onClick={(e) => e.preventDefault()}>
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
