import React, { useState, useEffect } from 'react';
import SubscriptionDetailModal from './SubscriptionDetailModal';

const Profile = ({ userRole, clubs, members }) => {
  const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    major: '',
    avatar: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'password'
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);

  useEffect(() => {
    const fallbackLocal = () => {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: '',
        studentId: '',
        major: '',
        avatar: userData.avatar || ''
      });
      setLoadingProfile(false);
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        fallbackLocal();
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/my-info`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = data.message || data.error || 'Không thể tải thông tin cá nhân.';
          throw new Error(message);
        }

        // Một số response có thể gói trong result/data, lấy lần lượt
        const info = data.result || data.data || data;
        const normalized = {
          name: info.fullName ?? info.name ?? '',
          email: info.email ?? '',
          phone: info.phoneNumber ?? info.phone ?? '',
          studentId: info.studentCode ?? info.studentId ?? '',
          major: info.major ?? '',
          role: info.roleName ?? info.role ?? info.userRole ?? '',
          avatar: info.avatarUrl ?? info.avatar ?? ''
        };

        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const mergedUser = {
          ...userData,
          name: normalized.name || userData.name,
          email: normalized.email || userData.email,
          role: normalized.role || userData.role,
          avatar: normalized.avatar || userData.avatar
        };

        setUser(mergedUser);
        setFormData({
          name: normalized.name || mergedUser.name || '',
          email: normalized.email || mergedUser.email || '',
          phone: normalized.phone || 'Chưa cập nhật',
          studentId: normalized.studentId || 'Chưa cập nhật',
          major: normalized.major || 'Chưa cập nhật',
          avatar: normalized.avatar || mergedUser.avatar || ''
        });

        // Sync latest info to localStorage session
        localStorage.setItem('user', JSON.stringify(mergedUser));
      } catch (error) {
        console.error('Fetch profile error:', error);
        setFetchError(error.message || 'Không thể tải thông tin cá nhân.');
        fallbackLocal();
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const getMyClub = () => {
    if (userRole !== 'club_leader' || !user) return null;
    return clubs.find(c => c.president === user.name);
  };

  const getMyMemberships = () => {
    if (userRole !== 'student' || !user) return [];
    const joinRequests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
    const myApprovedRequests = joinRequests.filter(
      r => r.studentEmail === user.email && r.status === 'approved'
    );
    return myApprovedRequests.map(request => {
      const club = clubs.find(c => c.id === request.clubId);
      return club ? { ...request, club } : null;
    }).filter(Boolean);
  };

  const handleFormChange = (e) => {
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
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

  const validateInfoForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên không được để trống';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (userRole === 'student') {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Mã sinh viên không được để trống';
      }
      if (!formData.major.trim()) {
        newErrors.major = 'Chuyên ngành không được để trống';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới không được để trống';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveInfo = async () => {
    if (!validateInfoForm()) {
      return;
    }

    setFetchError('');
    setSuccessMessage('');

    const token = localStorage.getItem('authToken');
    if (!token) {
      setFetchError('Bạn cần đăng nhập lại để cập nhật thông tin.');
      return;
    }

    try {
      const payload = {
        fullName: formData.name.trim(),
        phoneNumber: formData.phone.trim(),
        major: formData.major.trim(),
        avatarUrl: formData.avatar.trim()
      };

      const response = await fetch(`${API_BASE_URL}/users/my-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data.message || data.error || 'Cập nhật thông tin không thành công.';
        throw new Error(message);
      }

      const info = data.result || data.data || data;
      const normalized = {
        name: info.fullName ?? info.name ?? formData.name,
        email: info.email ?? formData.email,
        phone: info.phoneNumber ?? info.phone ?? formData.phone,
        studentId: info.studentCode ?? info.studentId ?? formData.studentId,
        major: info.major ?? formData.major,
        role: info.roleName ?? info.role ?? info.userRole ?? user.role,
        avatar: info.avatarUrl ?? info.avatar ?? formData.avatar
      };

      // Update registeredUsers cache so the rest of the app sees the latest info
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = registeredUsers.map(u =>
        u.email === user.email
          ? { ...u, ...normalized }
          : u
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      // Update user session
      const updatedUser = {
        ...user,
        name: normalized.name,
        email: normalized.email,
        role: normalized.role,
        avatar: normalized.avatar
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setFormData({
        name: normalized.name || '',
        email: normalized.email || '',
        phone: normalized.phone || '',
        studentId: normalized.studentId || '',
        major: normalized.major || '',
        avatar: normalized.avatar || ''
      });

      setIsEditing(false);
      setSuccessMessage('Cập nhật thông tin thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Update profile error:', error);
      setFetchError(error.message || 'Cập nhật thông tin không thành công.');
    }
  };

  const handleChangePassword = () => {
    if (!validatePasswordForm()) {
      return;
    }

    // Check current password
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const currentUser = registeredUsers.find(u => u.email === user.email);
    
    if (!currentUser || currentUser.password !== passwordData.currentPassword) {
      setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
      return;
    }

    // Update password
    const updatedUsers = registeredUsers.map(u => 
      u.email === user.email 
        ? { ...u, password: passwordData.newPassword }
        : u
    );
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setSuccessMessage('Đổi mật khẩu thành công!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const myClub = getMyClub();
  const myMemberships = getMyMemberships();
  const avatarUrl = (formData.avatar || '').trim() || (user?.avatar || '').trim();

  if (loadingProfile || !user) {
    return (
      <div className="p-5 max-w-[1000px] mx-auto">
        <div className="text-center py-16 px-5 text-gray-600 text-lg">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-[1000px] mx-auto">
      {fetchError && (
        <div className="bg-red-500 text-white px-5 py-4 rounded-lg mb-5 text-center font-medium animate-slide-in">
          {fetchError}
        </div>
      )}
      <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light rounded-2xl p-10 flex flex-col md:flex-row items-center gap-8 mb-8 text-white shadow-lg">
        <div className="w-[100px] h-[100px] rounded-full bg-white/20 flex items-center justify-center text-5xl font-bold border-4 border-white/30 flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = ''; }}
            />
          ) : (
            <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="m-0 mb-2.5 text-3xl font-bold">{user.name}</h1>
          <p className="m-0 mb-4 text-base opacity-90">{user.email}</p>
          <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm">
            {userRole === 'admin' ? '👑 Admin' : 
             userRole === 'club_leader' ? '👑 Club Leader' : 
             '🎓 Sinh viên'}
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-500 text-white px-5 py-4 rounded-lg mb-5 text-center font-medium animate-slide-in">
          {successMessage}
        </div>
      )}

      <div className="flex gap-2.5 mb-8 bg-white p-2.5 rounded-xl shadow-md flex-wrap">
        <button
          className={`px-5 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-all ${
            activeTab === 'info' 
              ? 'bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg' 
              : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('info')}
        >
          📝 Thông tin cá nhân
        </button>
        <button
          className={`px-5 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-all ${
            activeTab === 'password' 
              ? 'bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg' 
              : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('password')}
        >
          🔒 Đổi mật khẩu
        </button>
        {userRole === 'student' && myMemberships.length > 0 && (
          <button
            className={`px-5 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-all ${
              activeTab === 'memberships' 
                ? 'bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg' 
                : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('memberships')}
          >
            🏛️ Câu lạc bộ của tôi
          </button>
        )}
        {userRole === 'club_leader' && myClub && (
          <button
            className={`px-5 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-all ${
              activeTab === 'club' 
                ? 'bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg' 
                : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('club')}
          >
            🏛️ Câu lạc bộ quản lý
          </button>
        )}
      </div>

      {/* Personal Info Tab */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-xl p-8 shadow-md">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
              <h2 className="m-0 text-2xl text-gray-800 font-semibold">Thông tin cá nhân</h2>
              {!isEditing && (
                <button 
                  className="px-5 py-2.5 bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg" 
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Chỉnh sửa
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 bg-gray-50 rounded-lg border-l-4 border-fpt-blue">
                  <span className="text-sm text-gray-500 font-medium">Họ và tên:</span>
                  <span className="text-base text-gray-800 font-semibold">{formData.name}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 bg-gray-50 rounded-lg border-l-4 border-fpt-blue">
                  <span className="text-sm text-gray-500 font-medium">Email:</span>
                  <span className="text-base text-gray-800 font-semibold">{formData.email}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 bg-gray-50 rounded-lg border-l-4 border-fpt-blue">
                  <span className="text-sm text-gray-500 font-medium">Số điện thoại:</span>
                  <span className="text-base text-gray-800 font-semibold">{formData.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 bg-gray-50 rounded-lg border-l-4 border-fpt-blue">
                  <span className="text-sm text-gray-500 font-medium">Ảnh đại diện:</span>
                  <span className="text-base text-gray-800 font-semibold">
                    {avatarUrl ? (
                      <a
                        href={avatarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-fpt-blue hover:underline"
                      >
                        Xem ảnh
                      </a>
                    ) : (
                      'Chưa cập nhật'
                    )}
                  </span>
                </div>
                {userRole === 'student' && (
                  <>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 bg-gray-50 rounded-lg border-l-4 border-fpt-blue">
                      <span className="text-sm text-gray-500 font-medium">Mã sinh viên:</span>
                      <span className="text-base text-gray-800 font-semibold">{formData.studentId || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 bg-gray-50 rounded-lg border-l-4 border-fpt-blue">
                      <span className="text-sm text-gray-500 font-medium">Chuyên ngành:</span>
                      <span className="text-base text-gray-800 font-semibold">{formData.major || 'Chưa cập nhật'}</span>
                    </div>
                  </>
                )}
                {userRole === 'club_leader' && myClub && (
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 p-4 bg-gray-50 rounded-lg border-l-4 border-fpt-blue">
                    <span className="text-sm text-gray-500 font-medium">Câu lạc bộ quản lý:</span>
                    <span className="text-base text-gray-800 font-semibold">{myClub.name}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-800">Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={`px-3 py-3 border-2 rounded-lg text-sm font-sans transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.name && <span className="text-red-500 text-xs flex items-center gap-1">⚠️ {errors.name}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-800">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={`px-3 py-3 border-2 rounded-lg text-sm font-sans transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && <span className="text-red-500 text-xs flex items-center gap-1">⚠️ {errors.email}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-800">Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className={`px-3 py-3 border-2 rounded-lg text-sm font-sans transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                      errors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.phone && <span className="text-red-500 text-xs flex items-center gap-1">⚠️ {errors.phone}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-800">Avatar URL</label>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleFormChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="px-3 py-3 border-2 rounded-lg text-sm font-sans transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 border-gray-200"
                  />
                  <span className="text-xs text-gray-500">Dán link ảnh (JPG, PNG, ...)</span>
                </div>

                {userRole === 'student' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-800">Mã sinh viên *</label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleFormChange}
                        className={`px-3 py-3 border-2 rounded-lg text-sm font-sans transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                          errors.studentId ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {errors.studentId && <span className="text-red-500 text-xs flex items-center gap-1">⚠️ {errors.studentId}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-800">Chuyên ngành *</label>
                      <input
                        type="text"
                        name="major"
                        value={formData.major}
                        onChange={handleFormChange}
                        className={`px-3 py-3 border-2 rounded-lg text-sm font-sans transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                          errors.major ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {errors.major && <span className="text-red-500 text-xs flex items-center gap-1">⚠️ {errors.major}</span>}
                    </div>
                  </>
                )}

                <div className="flex gap-2.5 justify-end mt-2.5 pt-5 border-t-2 border-gray-100">
                  <button 
                    className="px-6 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-all bg-gray-200 text-gray-800 hover:bg-gray-300" 
                    onClick={() => setIsEditing(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    className="px-6 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white hover:-translate-y-0.5 hover:shadow-lg" 
                    onClick={handleSaveInfo}
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl p-8 shadow-md">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
              <h2 className="m-0 text-2xl text-gray-800 font-semibold">Đổi mật khẩu</h2>
            </div>

            <div className="max-w-[500px]">
              <div className="flex flex-col gap-2 mb-5">
                <label className="text-sm font-medium text-gray-800">Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`px-3 py-3 border-2 rounded-lg text-sm font-sans transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.currentPassword && <span className="text-red-500 text-xs flex items-center gap-1">⚠️ {errors.currentPassword}</span>}
              </div>

              <div className="flex flex-col gap-2 mb-5">
                <label className="text-sm font-medium text-gray-800">Mật khẩu mới *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`px-3 py-3 border-2 rounded-lg text-sm font-sans transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Tối thiểu 6 ký tự"
                />
                {errors.newPassword && <span className="text-red-500 text-xs flex items-center gap-1">⚠️ {errors.newPassword}</span>}
              </div>

              <div className="flex flex-col gap-2 mb-5">
                <label className="text-sm font-medium text-gray-800">Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`px-3 py-3 border-2 rounded-lg text-sm font-sans transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.confirmPassword && <span className="text-red-500 text-xs flex items-center gap-1">⚠️ {errors.confirmPassword}</span>}
              </div>

              <div className="flex gap-2.5 justify-end mt-2.5 pt-5 border-t-2 border-gray-100">
                <button 
                  className="px-6 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white hover:-translate-y-0.5 hover:shadow-lg" 
                  onClick={handleChangePassword}
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Memberships Tab (Student) */}
      {activeTab === 'memberships' && userRole === 'student' && (
        <div className="bg-white rounded-xl p-8 shadow-md">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
              <h2 className="m-0 text-2xl text-gray-800 font-semibold">Câu lạc bộ của tôi ({myMemberships.length})</h2>
            </div>

            {myMemberships.length === 0 ? (
              <div className="text-center py-10 px-5 text-gray-500">
                <p>Bạn chưa tham gia câu lạc bộ nào.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {myMemberships.map((item) => {
                  const formatDate = (dateString) => {
                    if (!dateString) return '-';
                    const date = new Date(dateString);
                    return date.toLocaleDateString('vi-VN');
                  };

                  const calculateExpiryDate = (requestDate, membershipDuration) => {
                    if (!requestDate) return null;
                    const startDate = new Date(requestDate);
                    const expiryDate = new Date(startDate);
                    expiryDate.setMonth(expiryDate.getMonth() + (membershipDuration || 6));
                    return expiryDate.toISOString().split('T')[0];
                  };

                  const expiryDate = calculateExpiryDate(item.requestDate, item.club.membershipDuration || 6);

                  return (
                  <div key={item.id} className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden transition-all hover:border-fpt-blue hover:shadow-lg hover:-translate-y-0.5">
                    <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-5 flex justify-between items-center">
                      <h3 className="m-0 text-xl font-semibold">{item.club.name}</h3>
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/30">Đã tham gia</span>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <span className="text-sm text-gray-600"><strong className="text-gray-800 mr-1">Danh mục:</strong> {item.club.category}</span>
                        <span className="text-sm text-gray-600"><strong className="text-gray-800 mr-1">Chủ tịch:</strong> {item.club.president}</span>
                        <span className="text-sm text-gray-600"><strong className="text-gray-800 mr-1">Ngày bắt đầu:</strong> {formatDate(item.requestDate)}</span>
                        <span className="text-sm text-gray-600"><strong className="text-gray-800 mr-1">Ngày hết hạn:</strong> {formatDate(expiryDate)}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <span className="text-sm text-gray-600"><strong className="text-gray-800 mr-1">Số thành viên:</strong> {item.club.memberCount}</span>
                        <span className="text-sm text-gray-600"><strong className="text-gray-800 mr-1">Địa điểm:</strong> {item.club.location || '-'}</span>
                        <span className="text-sm text-gray-600"><strong className="text-gray-800 mr-1">Phí tham gia:</strong> {item.club.participationFee ? `${item.club.participationFee.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}</span>
                        <span className="text-sm text-gray-600"><strong className="text-gray-800 mr-1">Thời hạn:</strong> {item.club.membershipDuration || 6} tháng</span>
                      </div>
                      {item.subscriptionId && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setSelectedSubscriptionId(item.subscriptionId)}
                            className="px-4 py-2 bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
                          >
                            📋 Xem chi tiết đăng ký
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Club Tab (Leader) */}
      {activeTab === 'club' && userRole === 'club_leader' && myClub && (
        <div className="bg-white rounded-xl p-8 shadow-md">
          <div className="w-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
              <h2 className="m-0 text-2xl text-gray-800 font-semibold">Câu lạc bộ quản lý</h2>
            </div>

            <div className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-5 flex justify-between items-center">
                <h3 className="m-0 text-2xl font-semibold">{myClub.name}</h3>
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/30">{myClub.status}</span>
              </div>
              <div className="p-5">
                <p className="text-gray-600 leading-relaxed mb-5 text-base">{myClub.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5 p-4 bg-white rounded-lg">
                    <span className="text-xs text-gray-500 font-medium uppercase">Danh mục:</span>
                    <span className="text-base text-gray-800 font-semibold">{myClub.category}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 bg-white rounded-lg">
                    <span className="text-xs text-gray-500 font-medium uppercase">Ngày thành lập:</span>
                    <span className="text-base text-gray-800 font-semibold">{myClub.foundedDate}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 bg-white rounded-lg">
                    <span className="text-xs text-gray-500 font-medium uppercase">Số thành viên:</span>
                    <span className="text-base text-gray-800 font-semibold">{myClub.memberCount}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 bg-white rounded-lg">
                    <span className="text-xs text-gray-500 font-medium uppercase">Địa điểm:</span>
                    <span className="text-base text-gray-800 font-semibold">{myClub.location}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4 bg-white rounded-lg">
                    <span className="text-xs text-gray-500 font-medium uppercase">Email:</span>
                    <span className="text-base text-gray-800 font-semibold">{myClub.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Detail Modal */}
      {selectedSubscriptionId && (
        <SubscriptionDetailModal
          subscriptionId={selectedSubscriptionId}
          onClose={() => setSelectedSubscriptionId(null)}
        />
      )}
    </div>
  );
};

export default Profile;

