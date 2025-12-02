import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = ({ userRole, clubs, members }) => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    major: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'password'
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);

    // Load detailed user info from registeredUsers
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const detailedUser = registeredUsers.find(u => u.email === userData.email);
    
    if (detailedUser) {
      setUserDetails(detailedUser);
      setFormData({
        name: detailedUser.name || userData.name || '',
        email: detailedUser.email || userData.email || '',
        phone: detailedUser.phone || '',
        studentId: detailedUser.studentId || '',
        major: detailedUser.major || ''
      });
    } else {
      // If not in registeredUsers, use basic user data
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: '',
        studentId: '',
        major: ''
      });
    }
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

  const handleSaveInfo = () => {
    if (!validateInfoForm()) {
      return;
    }

    // Update registeredUsers
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = registeredUsers.map(u => 
      u.email === user.email 
        ? { ...u, ...formData }
        : u
    );
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    // Update user session
    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    setIsEditing(false);
    setSuccessMessage('Cập nhật thông tin thành công!');
    setTimeout(() => setSuccessMessage(''), 3000);
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

  if (!user) {
    return (
      <div className="profile-container">
        <div className="loading-message">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="profile-header-info">
          <h1>{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <span className={`profile-role-badge role-${userRole}`}>
            {userRole === 'admin' ? '👑 Admin' : 
             userRole === 'club_leader' ? '👑 Club Leader' : 
             '🎓 Sinh viên'}
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📝 Thông tin cá nhân
        </button>
        <button
          className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          🔒 Đổi mật khẩu
        </button>
        {userRole === 'student' && myMemberships.length > 0 && (
          <button
            className={`profile-tab ${activeTab === 'memberships' ? 'active' : ''}`}
            onClick={() => setActiveTab('memberships')}
          >
            🏛️ Câu lạc bộ của tôi
          </button>
        )}
        {userRole === 'club_leader' && myClub && (
          <button
            className={`profile-tab ${activeTab === 'club' ? 'active' : ''}`}
            onClick={() => setActiveTab('club')}
          >
            🏛️ Câu lạc bộ quản lý
          </button>
        )}
      </div>

      {/* Personal Info Tab */}
      {activeTab === 'info' && (
        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h2>Thông tin cá nhân</h2>
              {!isEditing && (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  ✏️ Chỉnh sửa
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="info-display">
                <div className="info-row">
                  <span className="info-label">Họ và tên:</span>
                  <span className="info-value">{formData.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{formData.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Số điện thoại:</span>
                  <span className="info-value">{formData.phone || 'Chưa cập nhật'}</span>
                </div>
                {userRole === 'student' && (
                  <>
                    <div className="info-row">
                      <span className="info-label">Mã sinh viên:</span>
                      <span className="info-value">{formData.studentId || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Chuyên ngành:</span>
                      <span className="info-value">{formData.major || 'Chưa cập nhật'}</span>
                    </div>
                  </>
                )}
                {userRole === 'club_leader' && myClub && (
                  <div className="info-row">
                    <span className="info-label">Câu lạc bộ quản lý:</span>
                    <span className="info-value">{myClub.name}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="info-form">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                {userRole === 'student' && (
                  <>
                    <div className="form-group">
                      <label>Mã sinh viên *</label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleFormChange}
                        className={errors.studentId ? 'error' : ''}
                      />
                      {errors.studentId && <span className="error-message">{errors.studentId}</span>}
                    </div>

                    <div className="form-group">
                      <label>Chuyên ngành *</label>
                      <input
                        type="text"
                        name="major"
                        value={formData.major}
                        onChange={handleFormChange}
                        className={errors.major ? 'error' : ''}
                      />
                      {errors.major && <span className="error-message">{errors.major}</span>}
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                    Hủy
                  </button>
                  <button className="btn-save" onClick={handleSaveInfo}>
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
        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h2>Đổi mật khẩu</h2>
            </div>

            <div className="password-form">
              <div className="form-group">
                <label>Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={errors.currentPassword ? 'error' : ''}
                />
                {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
              </div>

              <div className="form-group">
                <label>Mật khẩu mới *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={errors.newPassword ? 'error' : ''}
                  placeholder="Tối thiểu 6 ký tự"
                />
                {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <div className="form-actions">
                <button className="btn-save" onClick={handleChangePassword}>
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Memberships Tab (Student) */}
      {activeTab === 'memberships' && userRole === 'student' && (
        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h2>Câu lạc bộ của tôi ({myMemberships.length})</h2>
            </div>

            {myMemberships.length === 0 ? (
              <div className="empty-state">
                <p>Bạn chưa tham gia câu lạc bộ nào.</p>
              </div>
            ) : (
              <div className="memberships-list">
                {myMemberships.map((item) => (
                  <div key={item.id} className="membership-card">
                    <div className="membership-header">
                      <h3>{item.club.name}</h3>
                      <span className="membership-status approved">Đã tham gia</span>
                    </div>
                    <div className="membership-body">
                      <div className="membership-info">
                        <span><strong>Danh mục:</strong> {item.club.category}</span>
                        <span><strong>Chủ tịch:</strong> {item.club.president}</span>
                        <span><strong>Ngày tham gia:</strong> {item.requestDate}</span>
                        <span><strong>Số thành viên:</strong> {item.club.memberCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Club Tab (Leader) */}
      {activeTab === 'club' && userRole === 'club_leader' && myClub && (
        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h2>Câu lạc bộ quản lý</h2>
            </div>

            <div className="club-card">
              <div className="club-card-header">
                <h3>{myClub.name}</h3>
                <span className="club-status">{myClub.status}</span>
              </div>
              <div className="club-card-body">
                <p className="club-description">{myClub.description}</p>
                <div className="club-details">
                  <div className="detail-item">
                    <span className="detail-label">Danh mục:</span>
                    <span className="detail-value">{myClub.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày thành lập:</span>
                    <span className="detail-value">{myClub.foundedDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Số thành viên:</span>
                    <span className="detail-value">{myClub.memberCount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Địa điểm:</span>
                    <span className="detail-value">{myClub.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{myClub.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

