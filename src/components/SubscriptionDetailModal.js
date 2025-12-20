/**
 * SubscriptionDetailModal Component
 * 
 * Modal component hiển thị chi tiết đăng ký CLB:
 * - Thông tin đăng ký: mã đăng ký, ngày đăng ký
 * - Thông tin CLB: tên, mã, logo
 * - Thông tin sinh viên: họ tên, MSSV, email, vai trò
 * - Thông tin gói thành viên: mã gói, tên, thời hạn, giá
 * - Trạng thái và thông tin khác: trạng thái, đã thanh toán, phương thức thanh toán, người duyệt, các ngày liên quan
 * - Fetch dữ liệu từ API khi subscriptionId thay đổi
 * 
 * @param {Object} props
 * @param {number|string} props.subscriptionId - ID của subscription cần xem chi tiết
 * @param {Function} props.onClose - Callback khi đóng modal
 */
import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

/**
 * Map trạng thái từ API sang text và màu sắc hiển thị
 */
const statusMap = {
  ChoDuyet: { text: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700' },
  DaDuyet: { text: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
  TuChoi: { text: 'Từ chối', color: 'bg-red-100 text-red-700' },
  HoatDong: { text: 'Hoạt động', color: 'bg-blue-100 text-blue-700' },
  HetHan: { text: 'Hết hạn', color: 'bg-gray-100 text-gray-700' }
};

const SubscriptionDetailModal = ({ subscriptionId, onClose }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState('');

  /**
   * Fetch chi tiết subscription từ API khi subscriptionId thay đổi
   * Sử dụng isMounted flag để tránh setState sau khi component unmount
   */
  useEffect(() => {
    if (!subscriptionId) return;

    let isMounted = true;

    const fetchSubscriptionDetail = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        if (isMounted) {
          setError('Vui lòng đăng nhập để xem chi tiết.');
          setLoading(false);
        }
        return;
      }

      try {
        // ========== API CALL: GET /registers/{subscriptionId} - Get Subscription Detail ==========
        // Mục đích: Lấy chi tiết subscription để hiển thị trong modal
        // Response: Registration object với đầy đủ thông tin (package, payment, dates, etc.)
        const response = await fetch(`${API_BASE_URL}/registers/${subscriptionId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => null);

        if (response.status === 401) {
          if (isMounted) {
            setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            setLoading(false);
          }
          return;
        }

        if (!response.ok || !data || data.code !== 1000) {
          const message = data?.message || 'Không thể tải chi tiết đăng ký.';
          if (isMounted) {
            setError(message);
            setLoading(false);
          }
          return;
        }

        // Map response để đảm bảo có đầy đủ các field
        const result = data.result || {};
        if (isMounted) {
          setSubscription({
            subscriptionId: result.subscriptionId,
            userId: result.userId,
            studentCode: result.studentCode,
            studentName: result.studentName,
            studentEmail: result.studentEmail,
            clubId: result.clubId,
            clubName: result.clubName,
            clubLogo: result.clubLogo,
            packageId: result.packageId,
            packageName: result.packageName,
            term: result.term,
            price: result.price,
            status: result.status,
            isPaid: result.isPaid || false,
            paymentMethod: result.paymentMethod,
            clubRole: result.clubRole || 'ThanhVien',
            approverName: result.approverName,
            createdAt: result.createdAt,
            paymentDate: result.paymentDate,
            startDate: result.startDate,
            endDate: result.endDate,
            joinDate: result.joinDate
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Fetch subscription detail error:', err);
        if (isMounted) {
          setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
          setLoading(false);
        }
      }
    };

    fetchSubscriptionDetail();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionId]);

  /**
   * Format date string sang định dạng tiếng Việt với giờ
   * @param {string} dateString - Date string cần format
   * @returns {string} - Formatted date hoặc '—' nếu không hợp lệ
   */
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Render status badge với màu sắc tương ứng
   * @param {string} status - Trạng thái từ API
   * @returns {JSX.Element} Status badge component
   */
  const renderStatus = (status) => {
    const info = statusMap[status] || { text: status || 'Không xác định', color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${info.color}`}>
        {info.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5">
        <div className="bg-white rounded-xl w-full max-w-[700px] shadow-2xl">
          <div className="p-8 text-center">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full mb-4"></div>
            <p className="m-0 text-base text-gray-600">Đang tải chi tiết đăng ký...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5" onClick={onClose}>
        <div className="bg-white rounded-xl w-full max-w-[700px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl">
            <h2 className="m-0 text-2xl font-semibold">Chi tiết đăng ký</h2>
            <button 
              className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
              onClick={onClose}
            >
              &times;
            </button>
          </div>
          <div className="p-8 text-center text-red-600">
            <p className="m-0 text-base">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl my-5" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
          <h2 className="m-0 text-2xl font-semibold">Chi tiết đăng ký CLB</h2>
          <button 
            className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="p-8">
          {/* Thông tin đăng ký */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin đăng ký</h3>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-fpt-blue">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Mã đăng ký:</p>
                  <p className="m-0 font-semibold text-gray-800">#{subscription.subscriptionId}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Ngày đăng ký:</p>
                  <p className="m-0 font-semibold text-gray-800">{formatDate(subscription.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin CLB */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin Câu lạc bộ</h3>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-fpt-blue">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Tên CLB:</p>
                  <p className="m-0 font-semibold text-gray-800">{subscription.clubName || '—'}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Mã CLB:</p>
                  <p className="m-0 font-semibold text-gray-800">{subscription.clubId || '—'}</p>
                </div>
              </div>
              {subscription.clubLogo && (
                <div className="mt-4">
                  <p className="m-0 mb-2 text-sm text-gray-600">Logo CLB:</p>
                  <img src={subscription.clubLogo} alt={subscription.clubName} className="max-w-[150px] rounded-lg shadow-md" />
                </div>
              )}
            </div>
          </div>

          {/* Thông tin sinh viên */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin Sinh viên</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Họ và tên:</p>
                  <p className="m-0 font-semibold text-gray-800">{subscription.studentName}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Mã sinh viên:</p>
                  <p className="m-0 font-semibold text-gray-800">{subscription.studentCode}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Email:</p>
                  <p className="m-0 font-semibold text-gray-800">{subscription.studentEmail}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Vai trò trong CLB:</p>
                  <p className="m-0 font-semibold text-gray-800">{subscription.clubRole || 'Thành viên'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin gói thành viên */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gói thành viên</h3>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Mã gói:</p>
                  <p className="m-0 font-semibold text-gray-800">#{subscription.packageId || '—'}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Tên gói:</p>
                  <p className="m-0 font-semibold text-gray-800">{subscription.packageName || '—'}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Thời hạn:</p>
                  <p className="m-0 font-semibold text-gray-800">{subscription.term || '—'}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Giá:</p>
                  <p className="m-0 font-semibold text-fpt-blue">{subscription.price ? subscription.price.toLocaleString('vi-VN') : '0'} VNĐ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trạng thái và thông tin khác */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái và Thông tin khác</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Trạng thái:</p>
                  <div className="mt-1">{renderStatus(subscription.status)}</div>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Đã thanh toán:</p>
                  <p className="m-0 font-semibold text-gray-800">
                    {subscription.isPaid ? (
                      <span className="text-green-600">✓ Đã thanh toán</span>
                    ) : (
                      <span className="text-amber-600">✗ Chưa thanh toán</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Phương thức thanh toán:</p>
                  <p className="m-0 font-semibold text-gray-800">{subscription.paymentMethod || '—'}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Người duyệt:</p>
                  <p className="m-0 font-semibold text-gray-800">{subscription.approverName || '—'}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Ngày đăng ký:</p>
                  <p className="m-0 font-semibold text-gray-800">{formatDate(subscription.createdAt)}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Ngày thanh toán:</p>
                  <p className="m-0 font-semibold text-gray-800">{formatDate(subscription.paymentDate)}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Ngày bắt đầu:</p>
                  <p className="m-0 font-semibold text-gray-800">{formatDate(subscription.startDate)}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Ngày kết thúc:</p>
                  <p className="m-0 font-semibold text-gray-800">{formatDate(subscription.endDate)}</p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-sm text-gray-600">Ngày tham gia:</p>
                  <p className="m-0 font-semibold text-gray-800">{formatDate(subscription.joinDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t-2 border-gray-200">
            <button 
              onClick={onClose}
              className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetailModal;

