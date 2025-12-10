import React, { useState } from 'react';
import { useToast } from '../components/Toast';

const Login = ({ onLoginSuccess, onSwitchToRegister, onNavigateToHome }) => {
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [foundPassword, setFoundPassword] = useState('');

  // Mock data for testing (still used for forgot password UI)
  const mockUsers = {
    'student@gmail.com': { password: '123456', role: 'student', name: 'Nguyễn Văn A' },
    'leader@gmail.com': { password: '123456', role: 'club_leader', name: 'Trần Thị B' }, // Club Tiếng Anh
    'leader1@gmail.com': { password: '123456', role: 'club_leader', name: 'Nguyễn Văn A' }, // Club Lập trình
    'leader2@gmail.com': { password: '123456', role: 'club_leader', name: 'Lê Văn C' }, // Club Thể thao
    'leader3@gmail.com': { password: '123456', role: 'club_leader', name: 'Phạm Thị D' }, // Club Nhiếp ảnh
    'admin@gmail.com': { password: '123456', role: 'admin', name: 'Admin' }
  };

  const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

  const extractToken = (data) => {
    return (
      data?.token ||
      data?.accessToken ||
      data?.access_token ||
      data?.jwt ||
      data?.jwtToken ||
      data?.data?.token ||
      data?.data?.accessToken ||
      data?.result?.token || // response format: { code, message, result: { token, authenticated } }
      data?.result?.accessToken ||
      data?.result?.access_token
    );
  };

  // Parse JWT token để lấy role từ scope
  const parseJWTToken = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      // Decode payload (phần thứ 2)
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      return decoded;
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  };

  // Map scope từ JWT thành role cho app
  const mapScopeToRole = (scope) => {
    if (!scope) return 'student';
    
    const scopeLower = scope.toLowerCase();
    
    // QuanTriVien -> admin
    if (scopeLower === 'quantrivien' || scopeLower === 'admin') {
      return 'admin';
    }
    
    // SinhVien -> student
    if (scopeLower === 'sinhvien' || scopeLower === 'student') {
      return 'student';
    }
    
    // Các scope khác -> club_leader
    return 'club_leader';
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
    setErrors(prev => ({ ...prev, submit: '' }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data.message || data.error || 'Email hoặc mật khẩu không đúng!';
        setErrors({ submit: message });
        return;
      }

      const token = extractToken(data);
      if (!token) {
        setErrors({ submit: 'Không nhận được token từ máy chủ. Vui lòng thử lại.' });
        return;
      }

      // Parse JWT token để lấy thông tin user
      const tokenPayload = parseJWTToken(token);
      let role = 'student';
      let name = formData.email.split('@')[0];
      
      let clubIdFromToken = null;
      let clubIdsFromToken = [];
      if (tokenPayload) {
        // Lấy role từ scope trong JWT token
        const scope = tokenPayload.scope || tokenPayload.role || tokenPayload.Roles;
        role = mapScopeToRole(scope);
        clubIdsFromToken = Array.isArray(tokenPayload.clubIds || tokenPayload.clubIDs || tokenPayload.ClubIds || tokenPayload.ClubIDs)
          ? (tokenPayload.clubIds || tokenPayload.clubIDs || tokenPayload.ClubIds || tokenPayload.ClubIDs)
          : [];
        clubIdFromToken =
          tokenPayload.clubId ||
          tokenPayload.clubID ||
          tokenPayload.ClubId ||
          tokenPayload.ClubID ||
          tokenPayload.club?.clubId ||
          clubIdsFromToken?.[0] ||
          null;
        
        // Lấy name từ token hoặc response
        name = tokenPayload.sub?.split('@')[0] || 
               data.fullName || 
               data.name || 
               data.user?.fullName || 
               data.user?.name || 
               formData.email.split('@')[0];
      } else {
        // Fallback: thử lấy từ response body
        role = data.role || data.userRole || data.user?.role || 'student';
        name = data.fullName || data.name || data.user?.fullName || data.user?.name || formData.email.split('@')[0];
      }

      const userId = tokenPayload?.sub || tokenPayload?.nameid || tokenPayload?.userId || tokenPayload?.UserId;

      const userData = {
        email: formData.email.trim(),
        name,
        role,
        token,
        ...(userId ? { userId } : {}),
        ...(clubIdFromToken ? { clubId: clubIdFromToken } : {}),
        ...(clubIdsFromToken && clubIdsFromToken.length ? { clubIds: clubIdsFromToken } : {})
      };

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      const roleNames = {
        'admin': 'Quản trị viên',
        'student': 'Sinh viên',
        'club_leader': 'Leader câu lạc bộ'
      };
      const roleDisplayName = roleNames[role] || role;
      
      showToast(`Đăng nhập thành công! Chào mừng ${name} - ${roleDisplayName}`, 'success');
      
      if (onLoginSuccess) {
        onLoginSuccess(role);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-fpt-blue via-fpt-blue-light to-green-500 p-5 font-sans relative overflow-hidden">
      <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(243,113,36,0.1)_0%,transparent_70%)] animate-spin-slow"></div>
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[460px] p-11 animate-slide-in relative z-10 border border-white/20">
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
          <button
            onClick={onNavigateToHome}
            className="inline-block mb-4 hover:scale-110 transition-transform"
          >
            <div className="text-6xl mb-4 animate-bounce">🎓</div>
          </button>
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
            <button
              type="button"
              className="text-fpt-blue no-underline font-semibold transition-all hover:text-fpt-orange hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setShowForgotPassword(true);
              }}
            >
              Quên mật khẩu?
            </button>
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
              <button
                type="button"
                className="text-fpt-blue no-underline font-bold transition-all hover:text-fpt-orange hover:underline"
                onClick={() => {
                  if (onSwitchToRegister) {
                    onSwitchToRegister();
                  }
                }}
              >
                Đăng ký ngay
              </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5" onClick={() => {
          setShowForgotPassword(false);
          setForgotPasswordEmail('');
          setForgotPasswordError('');
          setForgotPasswordSuccess(false);
          setFoundPassword('');
        }}>
          <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold m-0">🔐 Quên mật khẩu</h2>
              <button 
                className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                  setForgotPasswordError('');
                  setForgotPasswordSuccess(false);
                  setFoundPassword('');
                }}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {!forgotPasswordSuccess ? (
                <>
                  <p className="text-gray-600 mb-6">Nhập email của bạn để lấy lại mật khẩu:</p>
                  
                  <div className="flex flex-col gap-2 mb-6">
                    <label htmlFor="forgotEmail" className="text-sm font-semibold text-gray-800">Email</label>
                    <input
                      type="email"
                      id="forgotEmail"
                      value={forgotPasswordEmail}
                      onChange={(e) => {
                        setForgotPasswordEmail(e.target.value);
                        setForgotPasswordError('');
                      }}
                      placeholder="Nhập email của bạn"
                      className={`px-4 py-3.5 border-2 rounded-xl text-[15px] transition-all font-sans ${
                        forgotPasswordError 
                          ? 'border-red-500' 
                          : 'border-gray-300 focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10'
                      }`}
                    />
                    {forgotPasswordError && (
                      <span className="text-red-500 text-xs flex items-center gap-1">
                        <span>⚠️</span>
                        {forgotPasswordError}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                        setForgotPasswordError('');
                        setForgotPasswordSuccess(false);
                        setFoundPassword('');
                      }}
                      className="px-6 py-3 border-none rounded-xl text-base font-semibold cursor-pointer transition-all bg-gray-200 text-gray-600 hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!forgotPasswordEmail.trim()) {
                          setForgotPasswordError('Vui lòng nhập email');
                          return;
                        }
                        
                        if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
                          setForgotPasswordError('Email không hợp lệ');
                          return;
                        }

                        // Check mock users first
                        let user = mockUsers[forgotPasswordEmail];
                        
                        // If not found in mock users, check registered users
                        if (!user) {
                          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                          const registeredUser = registeredUsers.find(u => u.email === forgotPasswordEmail);
                          if (registeredUser) {
                            user = {
                              password: registeredUser.password,
                              name: registeredUser.name
                            };
                          }
                        }
                        
                        if (user) {
                          setFoundPassword(user.password);
                          setForgotPasswordSuccess(true);
                          setForgotPasswordError('');
                        } else {
                          setForgotPasswordError('Email này chưa được đăng ký trong hệ thống!');
                        }
                      }}
                      className="px-6 py-3 border-none rounded-xl text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
                    >
                      Tìm mật khẩu
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Tìm thấy mật khẩu!</h3>
                    <p className="text-gray-600">Mật khẩu của bạn là:</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Mật khẩu:</p>
                      <p className="text-2xl font-bold text-fpt-blue font-mono">{foundPassword}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                    <p className="text-sm text-blue-800 m-0">
                      <strong>Lưu ý:</strong> Vui lòng ghi nhớ mật khẩu này. Trong hệ thống thực tế, mật khẩu sẽ được gửi qua email.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                        setForgotPasswordError('');
                        setForgotPasswordSuccess(false);
                        setFoundPassword('');
                      }}
                      className="px-6 py-3 border-none rounded-xl text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
