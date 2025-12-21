/**
 * StudentMyClubRequests Component
 * 
 * Component hiển thị danh sách đăng ký tham gia CLB của student:
 * - Hiển thị tất cả đăng ký đã gửi (trừ các đơn đã rời CLB)
 * - Hiển thị trạng thái: Chờ duyệt, Đã duyệt, Từ chối
 * - Thanh toán cho đơn đã duyệt nhưng chưa thanh toán
 * - Hủy đơn đang chờ duyệt
 * - Real-time polling để phát hiện khi đơn được duyệt (hiển thị toast)
 * - Lưu trạng thái vào localStorage để tránh spam toast khi reload
 * 
 * @returns {JSX.Element} Component hiển thị danh sách đăng ký
 */
import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '../shared/Toast';
const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

/**
 * Map trạng thái từ API sang text và màu sắc hiển thị
 */
const statusMap = {
  ChoDuyet: { text: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700' },
  DaDuyet: { text: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
  TuChoi: { text: 'Từ chối', color: 'bg-red-100 text-red-700' },
  DaRoiCLB: { text: 'Đã rời CLB', color: 'bg-gray-200 text-gray-700' }
};

const StudentMyClubRequests = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  // Lưu trạng thái trước đó để phát hiện thay đổi
  const previousStatusesRef = useRef(new Map());
  // Flag để đánh dấu đã load dữ liệu lần đầu (không hiển thị toast trong lần đầu)
  const isInitialLoadRef = useRef(true);

  /**
   * Load trạng thái đã lưu từ localStorage khi component mount
   * Để tránh hiển thị toast khi reload trang
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('myRegistrationStatus');
      if (saved) {
        const savedMap = JSON.parse(saved);
        previousStatusesRef.current.clear();
        Object.entries(savedMap).forEach(([key, value]) => {
          previousStatusesRef.current.set(key, value);
        });
        // Nếu đã có dữ liệu lưu, không phải lần đầu load
        isInitialLoadRef.current = false;
      }
    } catch (err) {
      console.error('Error loading registration status from localStorage:', err);
    }
  }, []);

  /**
   * Fetch danh sách đăng ký từ API khi component mount
   * Kiểm tra thay đổi trạng thái và hiển thị toast khi đơn được duyệt
   */
  useEffect(() => {
    let isMounted = true; // Flag để tránh setState sau khi component unmount
    
    const fetchMyRegistrations = async () => {
      // Lấy token từ cả authToken và token
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        if (isMounted) {
          setError('Vui lòng đăng nhập để xem đăng ký của bạn.');
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/registers/my-registrations`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => null);
        
        // Xử lý lỗi 401 Unauthorized
        if (response.status === 401) {
          if (isMounted) {
            setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            setLoading(false);
            // Chỉ hiển thị toast một lần
            showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
          }
          return;
        }
        
        // Kiểm tra response code
        if (!response.ok || !data || data.code !== 1000) {
          const message = data?.message || data?.error || 'Không thể tải danh sách đăng ký.';
          if (isMounted) {
            setError(message);
            setLoading(false);
          }
          return;
        }

        // Lấy danh sách đăng ký và ẩn các đơn đã rời CLB
        const raw = (data.result || []).filter(reg => {
          const st = (reg.status || '').toLowerCase();
          return st !== 'daroi' && st !== 'daroi clb' && st !== 'daroiclb';
        });
        // Sắp xếp mới nhất trước
        raw.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        if (isMounted) {
          // Kiểm tra thay đổi trạng thái để hiển thị toast
          raw.forEach((reg) => {
            const subscriptionId = reg.subscriptionId;
            const currentStatus = (reg.status || '').toLowerCase();
            const previousStatus = previousStatusesRef.current.has(subscriptionId)
              ? (previousStatusesRef.current.get(subscriptionId) || '').toLowerCase()
              : null; // null nếu chưa có trong map (lần đầu)
            
            const isApproved = currentStatus === 'daduyet' || currentStatus === 'approved';
            // Chỉ hiển thị toast nếu:
            // 1. Không phải lần đầu load (isInitialLoadRef.current === false)
            // 2. Có thay đổi từ trạng thái khác sang đã duyệt
            if (!isInitialLoadRef.current && isApproved && previousStatus !== null && previousStatus !== currentStatus) {
              const clubName = reg.clubName || 'CLB';
              showToast(`🎉 Đơn đăng ký tham gia ${clubName} đã được duyệt!`, 'success');
            }
            
            // Lưu trạng thái hiện tại
            previousStatusesRef.current.set(subscriptionId, currentStatus);
          });
          
          // Đánh dấu đã hoàn thành lần load đầu tiên
          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
          }
          
          setRegistrations(raw);
          setLoading(false);
        }
      } catch (err) {
        console.error('Fetch my registrations error:', err);
        if (isMounted) {
          const message = err.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
          setError(message);
          setLoading(false);
          // Chỉ hiển thị toast nếu không phải lỗi 401 (đã xử lý ở trên)
          if (!message.includes('hết hạn')) {
            showToast(message, 'error');
          }
        }
      }
    };

    fetchMyRegistrations();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi component mount, không phụ thuộc vào showToast

  /**
   * Polling để kiểm tra thay đổi trạng thái realtime (mỗi 2 giây)
   * Phát hiện khi đơn chuyển từ trạng thái khác sang "Đã duyệt" và hiển thị toast
   */
  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token || loading) return;

    const pollInterval = setInterval(async () => {
      try {
        // ========== API CALL: GET /registers/my-registrations - Polling ==========
        // Mục đích: Polling để kiểm tra thay đổi trạng thái đăng ký realtime (mỗi 3 giây)
        // Response: Array of registration objects
        const response = await fetch(`${API_BASE_URL}/registers/my-registrations`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => null);
        
        if (response.ok && data && data.code === 1000) {
          // Ẩn các đơn đã rời CLB
          const raw = (data.result || []).filter(reg => {
            const st = (reg.status || '').toLowerCase();
            return st !== 'daroi' && st !== 'daroi clb' && st !== 'daroiclb';
          });
          
          // So sánh với trạng thái trước đó
          raw.forEach((reg) => {
            const subscriptionId = reg.subscriptionId;
            const currentStatus = (reg.status || '').toLowerCase();
            const previousStatus = previousStatusesRef.current.has(subscriptionId)
              ? (previousStatusesRef.current.get(subscriptionId) || '').toLowerCase()
              : null; // null nếu chưa có trong map
            
            const isApproved = currentStatus === 'daduyet' || currentStatus === 'approved';
            // Chỉ hiển thị toast khi có thay đổi từ trạng thái khác sang đã duyệt
            // (không hiển thị nếu previousStatus là null vì đó là lần đầu thấy request này)
            if (previousStatus !== null && isApproved && previousStatus !== currentStatus) {
              const clubName = reg.clubName || 'CLB';
              showToast(`🎉 Đơn đăng ký tham gia ${clubName} đã được duyệt!`, 'success');
            }
            
            // Cập nhật trạng thái hiện tại
            previousStatusesRef.current.set(subscriptionId, currentStatus);
          });
          
          // Lưu trạng thái vào localStorage để giữ lại khi reload
          try {
            const statusMap = Object.fromEntries(previousStatusesRef.current);
            localStorage.setItem('myRegistrationStatus', JSON.stringify(statusMap));
          } catch (err) {
            console.error('Error saving registration status to localStorage:', err);
          }
          
          // Cập nhật danh sách đăng ký
          raw.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setRegistrations(raw);
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Không hiển thị lỗi khi polling để tránh spam
      }
    }, 2000); // Poll mỗi 2 giây để real-time hơn

    return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // Chỉ chạy khi loading thay đổi

  /**
   * Render status badge với màu sắc tương ứng
   * @param {string} status - Trạng thái từ API (ChoDuyet, DaDuyet, TuChoi, etc.)
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

  /**
   * Tạo link thanh toán PayOS cho đăng ký CLB
   * Mở link trong tab mới hoặc hiển thị QR code
   * @param {Object} reg - Registration object cần thanh toán
   */
  const handlePayment = async (reg) => {
    const subscriptionId = reg.subscriptionId;
    if (!subscriptionId) {
      showToast('Không tìm thấy mã đăng ký để thanh toán.', 'error');
      return;
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Vui lòng đăng nhập để thanh toán.', 'error');
      return;
    }

    setPayingId(subscriptionId);
    try {
      // ========== API CALL: POST /payments/create-link - Create Payment Link ==========
      // Mục đích: Tạo link thanh toán cho đơn đăng ký đã được duyệt
      // Request body: { subscriptionId }
      // Response: Payment link URL để redirect user đến trang thanh toán
      const res = await fetch(`${API_BASE_URL}/payments/create-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subscriptionId })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
        throw new Error(data?.message || 'Không thể tạo link thanh toán.');
      }

      const paymentLink = data.result?.paymentLink;
      const qrCode = data.result?.qrCode;

      if (paymentLink) {
        window.open(paymentLink, '_blank', 'noopener');
        showToast('Đã mở link thanh toán trong tab mới.', 'success');
      } else if (qrCode) {
        showToast('Không có link, hãy dùng QR để thanh toán.', 'info');
      } else {
        showToast('Tạo link thành công, nhưng không nhận được link/QR.', 'info');
      }
    } catch (err) {
      console.error('Create payment link error:', err);
      showToast(err.message || 'Không thể tạo link thanh toán.', 'error');
    } finally {
      setPayingId(null);
    }
  };

  /**
   * Hủy đơn đăng ký đang chờ duyệt
   * Chỉ cho phép hủy khi status là ChoDuyet hoặc pending
   * @param {Object} reg - Registration object cần hủy
   */
  const handleCancel = async (reg) => {
    const subscriptionId = reg.subscriptionId;
    if (!subscriptionId) {
      showToast('Không tìm thấy mã đăng ký để hủy.', 'error');
      return;
    }

    if (reg.status !== 'ChoDuyet' && reg.status !== 'pending') {
      showToast('Chỉ có thể hủy đơn khi đang chờ duyệt.', 'error');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn hủy đơn đăng ký này?')) return;

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Vui lòng đăng nhập để hủy đơn.', 'error');
      return;
    }

    setCancellingId(subscriptionId);
    try {
      // ========== API CALL: DELETE /registers/{subscriptionId} - Cancel Registration ==========
      // Mục đích: Sinh viên hủy đơn đăng ký đang ở trạng thái ChoDuyet
      // Response: Success message
      const res = await fetch(`${API_BASE_URL}/registers/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
        throw new Error(data?.message || 'Không thể hủy đơn. Vui lòng thử lại.');
      }

      // Remove khỏi danh sách sau khi hủy thành công
      setRegistrations((prev) => prev.filter((item) => item.subscriptionId !== subscriptionId));
      showToast(data.message || 'Đã hủy đơn đăng ký.', 'success');
    } catch (err) {
      console.error('Cancel registration error:', err);
      showToast(err.message || 'Không thể hủy đơn. Vui lòng thử lại.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full mb-4"></div>
        <p className="m-0 text-base">Đang tải danh sách đơn đã gửi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-red-600">
        <p className="m-0 text-base">{error}</p>
      </div>
    );
  }

  if (!registrations.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-600">
        <div className="text-5xl mb-4">📭</div>
        <p className="m-0 text-lg">Bạn chưa có đăng ký tham gia câu lạc bộ.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-fpt-blue/10">
        <h2 className="text-2xl font-bold text-fpt-blue m-0">Đăng ký tham gia CLB</h2>
        <p className="text-gray-600 mt-2 mb-0">Theo dõi trạng thái các đăng ký membership của bạn</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">CLB</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Gói</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Giá</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ngày đăng ký</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ngày tham gia</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Hiệu lực</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registrations.map((reg) => (
                <tr key={reg.subscriptionId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{reg.clubName || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{reg.packageName || '-'}</div>
                    <div className="text-xs text-gray-500">{reg.term || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {reg.price ? `${reg.price.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}
                    <div className="text-xs text-gray-500">
                      {reg.isPaid ? `Đã thanh toán (${reg.paymentMethod || 'N/A'})` : 'Chưa thanh toán'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {renderStatus(reg.status)}
                    <div className="text-xs text-gray-500 mt-1">{reg.clubRole ? `Vai trò: ${reg.clubRole}` : ''}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {reg.createdAt ? new Date(reg.createdAt).toLocaleString('vi-VN') : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {reg.joinDate ? new Date(reg.joinDate).toLocaleString('vi-VN') : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {reg.startDate && reg.endDate
                      ? `${new Date(reg.startDate).toLocaleDateString('vi-VN')} → ${new Date(reg.endDate).toLocaleDateString('vi-VN')}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {(reg.status === 'DaDuyet' || reg.status === 'approved') && reg.isPaid && (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200">
                          ✅ Thanh toán thành công
                        </span>
                      )}
                      {(reg.status === 'DaDuyet' || reg.status === 'approved') && !reg.isPaid && (
                        <button
                          onClick={() => handlePayment(reg)}
                          disabled={payingId === reg.subscriptionId}
                          className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {payingId === reg.subscriptionId ? 'Đang thanh toán...' : '💳 Thanh toán'}
                        </button>
                      )}
                      {(reg.status === 'ChoDuyet' || reg.status === 'pending') && (
                        <button
                          onClick={() => handleCancel(reg)}
                          disabled={cancellingId === reg.subscriptionId}
                          className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {cancellingId === reg.subscriptionId ? 'Đang hủy...' : '🛑 Hủy đơn'}
                        </button>
                      )}
                      {(reg.status !== 'DaDuyet' && reg.status !== 'approved') &&
                        reg.status !== 'ChoDuyet' &&
                        reg.status !== 'pending' && (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentMyClubRequests;

