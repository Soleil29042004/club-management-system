import React, { useState } from 'react';

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
    'leader@gmail.com': { password: '123456', role: 'club_leader', name: 'Trần Thị B' }, // Club Tiếng Anh
    'leader1@gmail.com': { password: '123456', role: 'club_leader', name: 'Nguyễn Văn A' }, // Club Lập trình
    'leader2@gmail.com': { password: '123456', role: 'club_leader', name: 'Lê Văn C' }, // Club Thể thao
    'leader3@gmail.com': { password: '123456', role: 'club_leader', name: 'Phạm Thị D' }, // Club Nhiếp ảnh
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
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-fpt-blue via-fpt-blue-light to-green-500 p-5 font-sans relative overflow-hidden">
      <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(243,113,36,0.1)_0%,transparent_70%)] animate-spin-slow"></div>
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[460px] p-11 animate-slide-in relative z-10 border border-white/20">
        <div className="text-center mb-5">
          <div className="text-6xl mb-4 animate-bounce">🎓</div>
          <h1 className="text-3xl text-fpt-blue mb-2.5 font-bold tracking-tight">FPT University</h1>
          <p className="text-gray-600 text-[15px] font-medium">Hệ thống quản lý Câu lạc bộ Sinh viên</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-800">Email</label>
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

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-800">Mật khẩu</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl text-[15px] transition-all font-sans ${
                  errors.password 
                    ? 'border-red-500' 
                    : 'border-gray-300 focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 focus:bg-blue-50/50'
                }`}
              />
              <button
                type="button"
                className="absolute right-3 bg-transparent border-none cursor-pointer text-xl p-2 transition-transform hover:scale-110"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center text-sm mt-[-8px]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" name="remember" className="w-[18px] h-[18px] cursor-pointer" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="text-fpt-blue no-underline font-semibold transition-all hover:text-fpt-orange hover:underline" onClick={(e) => e.preventDefault()}>
              Quên mật khẩu?
            </a>
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
                Đang đăng nhập...
              </>
            ) : 'Đăng nhập'}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-7 pt-6 border-t border-gray-300 text-sm text-gray-600">
          <p>
            Chưa có tài khoản?{' '}
            <a href="#" className="text-fpt-blue no-underline font-bold transition-all hover:text-fpt-orange hover:underline" onClick={(e) => {
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
