/**
 * Sidebar Component
 * 
 * Component sidebar điều hướng cho các role khác nhau (admin, student, club_leader)
 * Hỗ trợ responsive với mobile menu
 */

import React from 'react';

/**
 * Sidebar component với navigation menu
 * @param {Object} props
 * @param {string} props.userRole - Role của user: 'admin', 'student', hoặc 'club_leader'
 * @param {string} props.currentPage - Trang hiện tại đang active
 * @param {Function} props.onPageChange - Callback khi user click vào menu item
 * @param {Function} props.onLogout - Callback khi user click logout
 * @param {boolean} props.isOpen - Sidebar có đang mở không (cho mobile)
 * @param {Function} props.onClose - Callback để đóng sidebar (cho mobile)
 */
const Sidebar = ({ userRole, currentPage, onPageChange, onLogout, isOpen, onClose }) => {
  // Menu items cho từng role
  const menuItems = {
    admin: [
      { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
      { id: 'clubs', label: 'Câu lạc bộ', icon: '🏛️' },
      { id: 'members', label: 'Thành viên', icon: '👥' },
      { id: 'club-requests', label: 'Duyệt yêu cầu CLB', icon: '📝' },
      { id: 'profile', label: 'Hồ sơ', icon: '👤' }
    ],
    student: [
      { id: 'clubs', label: 'Danh sách CLB', icon: '🏛️' },
      { id: 'my-requests', label: 'Đơn đã gửi', icon: '📄' },
      { id: 'joined-clubs', label: 'CLB đã tham gia', icon: '🤝' },
      { id: 'my-payments', label: 'Lịch sử giao dịch', icon: '💳' },
      { id: 'profile', label: 'Hồ sơ', icon: '👤' }
    ],
    club_leader: [
      { id: 'manage', label: 'Quản lý Club', icon: '⚙️' },
      { id: 'requests', label: 'Duyệt yêu cầu', icon: '📋' },
      { id: 'members', label: 'Quản lý thành viên', icon: '👥' },
      { id: 'fee', label: 'Phí & Thời hạn', icon: '💰' },
      { id: 'payments', label: 'Lịch sử giao dịch', icon: '💳' },
      { id: 'profile', label: 'Hồ sơ', icon: '👤' }
    ]
  };

  const items = menuItems[userRole] || [];

  // Xử lý khi click vào menu item
  const handleItemClick = (pageId) => {
    onPageChange(pageId);
    // Đóng sidebar trên mobile sau khi click
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay cho mobile - hiển thị khi sidebar mở */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}
      
      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-fpt-blue to-fpt-blue-light text-white shadow-xl flex-shrink-0 fixed left-0 top-0 h-screen overflow-y-auto z-50 transition-all duration-300 ${
        isOpen 
          ? 'translate-x-0 opacity-100 pointer-events-auto' 
          : '-translate-x-full opacity-0 pointer-events-none'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold m-0 flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <span className="whitespace-nowrap">ClubHub</span>
              </h1>
              <p className="text-xs text-white/80 mt-1 whitespace-nowrap">Hệ thống quản lý CLB</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {items.map(item => (
            <button
              key={item.id}
              className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                currentPage === item.id
                  ? 'bg-fpt-orange text-white shadow-lg' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => handleItemClick(item.id)}
              aria-label={item.label}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}

          {/* Logout Button */}
          <div className="pt-4 border-t border-white/20 mt-4">
            <button
              className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 text-white/90 hover:bg-red-600/80 transition-all"
              onClick={onLogout}
              aria-label="Đăng xuất"
            >
              <span className="text-xl">🚪</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;



