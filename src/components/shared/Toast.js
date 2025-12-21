/**
 * Toast Component - Notification System
 * 
 * Component hiển thị thông báo toast cho user:
 * - Success, error, warning, info notifications
 * - Auto-dismiss sau 3 giây
 * - Hỗ trợ multiple toasts cùng lúc
 * - Context API để sử dụng từ bất kỳ component nào
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ToastContext = createContext();

/**
 * Hook để sử dụng toast từ bất kỳ component nào
 * @returns {Object} - Object chứa showToast function
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * ToastProvider - Context Provider cho toast system
 * @param {Object} props
 * @param {ReactNode} props.children - Child components
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Hiển thị toast notification
   * @param {string} message - Nội dung thông báo
   * @param {string} type - Loại toast: 'success', 'error', 'warning', 'info'
   */
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Tự động xóa sau 3 giây
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  /**
   * Xóa toast khỏi danh sách
   * @param {string|number} id - ID của toast cần xóa
   */
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * ToastContainer - Container hiển thị tất cả toasts
 * @param {Object} props
 * @param {Array} props.toasts - Danh sách toasts
 * @param {Function} props.removeToast - Callback để xóa toast
 */
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-3">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

/**
 * ToastItem - Component hiển thị một toast notification
 * @param {Object} props
 * @param {Object} props.toast - Toast object { id, message, type }
 * @param {Function} props.onClose - Callback khi toast đóng
 */
const ToastItem = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  /**
   * Xử lý đóng toast với animation
   */
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Delay để animation hoàn thành
  }, [onClose]);

  /**
   * Tự động đóng toast sau 3 giây
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [handleClose]);

  /**
   * Lấy icon tương ứng với type của toast
   * @returns {string} - Icon emoji
   */
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '✓';
    }
  };

  /**
   * Lấy CSS classes tương ứng với type của toast
   * @returns {string} - Tailwind CSS classes
   */
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-orange-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  return (
    <div className={`${getToastStyles()} px-5 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-[400px] transition-all ${
      isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
    }`}>
      <div className="text-xl font-bold flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button 
        className="text-xl font-bold hover:opacity-70 transition-opacity flex-shrink-0" 
        onClick={handleClose}
      >
        ×
      </button>
    </div>
  );
};



