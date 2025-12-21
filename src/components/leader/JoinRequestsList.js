/**
 * JoinRequestsList Component
 * 
 * Component hiển thị danh sách yêu cầu tham gia club cho club leader:
 * - Fetch và hiển thị requests từ API
 * - Filter theo trạng thái (pending, approved, rejected)
 * - Duyệt/từ chối yêu cầu
 * - Xem chi tiết request và subscription
 * - Real-time polling để cập nhật trạng thái thanh toán
 * - Hiển thị thông tin thanh toán và xác nhận thanh toán
 * 
 * @param {Object} props
 * @param {Array} props.requests - Danh sách requests từ props (fallback)
 * @param {string|number} props.clubId - ID của club
 * @param {Function} props.onApprove - Callback khi duyệt request
 * @param {Function} props.onReject - Callback khi từ chối request
 */

import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '../shared/Toast';
import { parseJWTToken, getUserFromStorage } from '../../features/shared/utils/auth';

const JoinRequestsList = ({ requests = [], clubId, onApprove, onReject }) => {
  const { showToast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiRequests, setApiRequests] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  // Lưu trạng thái thanh toán trước đó để phát hiện thay đổi
  const previousPaymentStatusRef = useRef(new Map());
  // Flag để đánh dấu đã load dữ liệu lần đầu (không hiển thị toast trong lần đầu)
  const isInitialLoadRef = useRef(true);
  
  // Lấy userId của leader hiện tại để filter ra khỏi danh sách
  const getCurrentLeaderUserId = () => {
    try {
      // Thử lấy từ localStorage user object
      const userData = getUserFromStorage();
      if (userData?.userId) {
        return String(userData.userId);
      }
      
      // Thử parse từ JWT token
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = parseJWTToken(token);
        if (payload) {
          // Thử các field phổ biến trong JWT payload
          const userId = payload.sub || payload.nameid || payload.userId || payload.UserId;
          if (userId) {
            return String(userId);
          }
        }
      }
    } catch (err) {
      console.error('Error getting current leader userId:', err);
    }
    return null;
  };
  
  // Load trạng thái đã lưu từ localStorage khi clubId thay đổi
  useEffect(() => {
    if (!clubId) return;
    
    try {
      const savedKey = `paymentStatus_${clubId}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        const savedMap = JSON.parse(saved);
        previousPaymentStatusRef.current.clear();
        Object.entries(savedMap).forEach(([key, value]) => {
          previousPaymentStatusRef.current.set(key, value);
        });
        // Nếu đã có dữ liệu lưu, không phải lần đầu load
        isInitialLoadRef.current = false;
      } else {
        // Nếu chưa có dữ liệu lưu, đây là lần đầu load
        isInitialLoadRef.current = true;
        previousPaymentStatusRef.current.clear();
      }
    } catch (err) {
      console.error('Error loading payment status from localStorage:', err);
      isInitialLoadRef.current = true;
      previousPaymentStatusRef.current.clear();
    }
  }, [clubId]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailData, setDetailData] = useState(null);
  // Lưu filter state vào localStorage để giữ lại khi chuyển trang
  const [selectedStatus, setSelectedStatus] = useState(() => {
    const saved = localStorage.getItem('joinRequestsFilter');
    // Nếu filter đã lưu là "DaRoiCLB" (đã bị xóa), reset về "all"
    if (saved === 'DaRoiCLB') {
      localStorage.setItem('joinRequestsFilter', 'all');
      return 'all';
    }
    return saved || 'all';
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'ChoDuyet', label: 'Chờ duyệt' },
    { value: 'DaDuyet', label: 'Đã duyệt' },
    { value: 'TuChoi', label: 'Từ chối' }
  ];

  const isLeftStatus = (status = '') => {
    const st = status.toLowerCase();
    return st === 'daroi' || st === 'daroi clb' || st === 'daroiclb' || st === 'daroiclub';
  };

  const mapStatus = (status = '') => {
    const st = status.toLowerCase();
    if (st === 'choduyet' || st === 'pending') return 'pending';
    if (st === 'daduyet' || st === 'approved') return 'approved';
    if (st === 'tuchoi' || st === 'rejected') return 'rejected';
    if (isLeftStatus(st)) return 'left';
    return 'unknown';
  };

  useEffect(() => {
    if (!clubId) return;
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchRegistrations = async () => {
      setLoading(true);
      setError('');
      try {
        // Nếu chọn "Tất cả", gọi API không có status filter
        // ========== API CALL: GET /registrations/club/{clubId} - Get Join Requests ==========
        // Mục đích: Leader lấy danh sách yêu cầu tham gia CLB (có thể filter theo status)
        // Query: Optional ?status={status} để filter (ChoDuyet, DaDuyet, TuChoi, etc.)
        // Response: Array of registration objects
        const url = selectedStatus === 'all'
          ? `https://clubmanage.azurewebsites.net/api/registrations/club/${clubId}`
          : `https://clubmanage.azurewebsites.net/api/registrations/club/${clubId}/status/${selectedStatus}`;
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          // Lấy userId của leader hiện tại để filter ra khỏi danh sách
          const currentLeaderUserId = getCurrentLeaderUserId();
          const userData = getUserFromStorage();
          const currentLeaderEmail = userData?.email || userData?.studentEmail || '';
          
          // Ẩn hoàn toàn các yêu cầu đã rời CLB
          let filtered = (data.result || []).filter(item => !isLeftStatus(item.status));
          
          // Filter ra chính leader khỏi danh sách (nếu leader đã từng là member và có request)
          if (currentLeaderUserId || currentLeaderEmail) {
            filtered = filtered.filter(item => {
              // So sánh userId nếu có
              if (currentLeaderUserId && item.userId) {
                if (String(item.userId).toLowerCase() === currentLeaderUserId.toLowerCase()) {
                  return false; // Ẩn request của chính leader
                }
              }
              // So sánh email nếu có
              if (currentLeaderEmail && item.studentEmail) {
                if (String(item.studentEmail).toLowerCase() === currentLeaderEmail.toLowerCase()) {
                  return false; // Ẩn request của chính leader
                }
              }
              return true;
            });
          }

          const mapped = filtered.map(item => ({
            id: item.subscriptionId || item.id,
            subscriptionId: item.subscriptionId || item.id,
            userId: item.userId || null, // Thêm userId vào mapping
            studentName: item.studentName || '',
            studentEmail: item.studentEmail || '',
            studentId: item.studentCode || '',
            phone: item.phone || '',
            major: item.major || '',
            requestDate: item.createdAt || item.joinDate || new Date().toISOString(),
            status: mapStatus(item.status),
            reason: item.joinReason || item.reason || '',
            message: item.message || '',
            packageName: item.packageName,
            price: item.price,
            term: item.term,
            isPaid: item.isPaid,
            paymentMethod: item.paymentMethod,
            clubRole: item.clubRole,
            approverName: item.approverName,
            paymentDate: item.paymentDate,
            startDate: item.startDate,
            endDate: item.endDate,
            joinDate: item.joinDate
          }));
          
          // Kiểm tra thay đổi trạng thái thanh toán để hiển thị toast
          mapped.forEach((req) => {
            const subscriptionId = req.subscriptionId || req.id;
            const currentIsPaid = !!req.isPaid;
            const previousIsPaid = previousPaymentStatusRef.current.has(subscriptionId) 
              ? !!previousPaymentStatusRef.current.get(subscriptionId)
              : null; // null nếu chưa có trong map (lần đầu)
            
            // Chỉ hiển thị toast nếu:
            // 1. Không phải lần đầu load (isInitialLoadRef.current === false)
            // 2. Có thay đổi từ chưa thanh toán sang đã thanh toán
            if (!isInitialLoadRef.current && currentIsPaid && previousIsPaid === false) {
              const studentName = req.studentName || 'Sinh viên';
              showToast(`💰 ${studentName} đã chuyển tiền thành công!`, 'success');
            }
            
            // Lưu trạng thái thanh toán hiện tại
            previousPaymentStatusRef.current.set(subscriptionId, currentIsPaid);
          });
          
          // Đánh dấu đã hoàn thành lần load đầu tiên
          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
          }
          
          setApiRequests(mapped);
        } else {
          setApiRequests([]);
          setError(data.message || 'Không thể tải danh sách đơn đăng ký.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch registrations error:', err);
          setError('Không thể tải danh sách đơn đăng ký.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
    return () => controller.abort();
  }, [clubId, selectedStatus]);

  // Polling để kiểm tra thay đổi trạng thái thanh toán realtime (mỗi 2 giây)
  useEffect(() => {
    if (!clubId || loading) return;

    const token = localStorage.getItem('authToken');
    const controller = new AbortController();

    const pollInterval = setInterval(async () => {
      try {
        // ========== API CALL: GET /registrations/club/{clubId} - Polling Join Requests ==========
        // Mục đích: Polling để kiểm tra yêu cầu mới hoặc thay đổi trạng thái (mỗi 5 giây)
        // Query: Optional ?status={status} để filter
        // Response: Array of registration objects
        // Poll theo filter hiện tại để không ghi đè kết quả đã lọc
        const url = selectedStatus === 'all'
          ? `https://clubmanage.azurewebsites.net/api/registrations/club/${clubId}`
          : `https://clubmanage.azurewebsites.net/api/registrations/club/${clubId}/status/${selectedStatus}`;
        
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          // Lấy userId của leader hiện tại để filter ra khỏi danh sách
          const currentLeaderUserId = getCurrentLeaderUserId();
          const userData = getUserFromStorage();
          const currentLeaderEmail = userData?.email || userData?.studentEmail || '';
          
          // Ẩn hoàn toàn các yêu cầu đã rời CLB
          let filtered = (data.result || []).filter(item => !isLeftStatus(item.status));
          
          // Filter ra chính leader khỏi danh sách (nếu leader đã từng là member và có request)
          if (currentLeaderUserId || currentLeaderEmail) {
            filtered = filtered.filter(item => {
              // So sánh userId nếu có
              if (currentLeaderUserId && item.userId) {
                if (String(item.userId).toLowerCase() === currentLeaderUserId.toLowerCase()) {
                  return false; // Ẩn request của chính leader
                }
              }
              // So sánh email nếu có
              if (currentLeaderEmail && item.studentEmail) {
                if (String(item.studentEmail).toLowerCase() === currentLeaderEmail.toLowerCase()) {
                  return false; // Ẩn request của chính leader
                }
              }
              return true;
            });
          }

          const mapped = filtered.map(item => ({
            id: item.subscriptionId || item.id,
            subscriptionId: item.subscriptionId || item.id,
            userId: item.userId || null, // Thêm userId vào mapping
            studentName: item.studentName || '',
            studentEmail: item.studentEmail || '',
            studentId: item.studentCode || '',
            phone: item.phone || '',
            major: item.major || '',
            requestDate: item.createdAt || item.joinDate || new Date().toISOString(),
            status: mapStatus(item.status),
            reason: item.joinReason || item.reason || '',
            message: item.message || '',
            packageName: item.packageName,
            price: item.price,
            term: item.term,
            isPaid: item.isPaid,
            paymentMethod: item.paymentMethod,
            clubRole: item.clubRole,
            approverName: item.approverName,
            paymentDate: item.paymentDate,
            startDate: item.startDate,
            endDate: item.endDate,
            joinDate: item.joinDate
          }));
          
          // So sánh với trạng thái thanh toán trước đó
          mapped.forEach((req) => {
            const subscriptionId = req.subscriptionId || req.id;
            const currentIsPaid = !!req.isPaid;
            const previousIsPaid = previousPaymentStatusRef.current.has(subscriptionId)
              ? !!previousPaymentStatusRef.current.get(subscriptionId)
              : null; // null nếu chưa có trong map
            
            // Chỉ hiển thị toast khi có thay đổi từ chưa thanh toán sang đã thanh toán
            // (không hiển thị nếu previousIsPaid là null vì đó là lần đầu thấy request này)
            if (previousIsPaid !== null && currentIsPaid && previousIsPaid === false) {
              const studentName = req.studentName || 'Sinh viên';
              showToast(`💰 ${studentName} đã chuyển tiền thành công!`, 'success');
            }
            
            // Cập nhật trạng thái thanh toán hiện tại
            previousPaymentStatusRef.current.set(subscriptionId, currentIsPaid);
          });
          
          // Lưu trạng thái vào localStorage để giữ lại khi reload
          try {
            const statusMap = Object.fromEntries(previousPaymentStatusRef.current);
            localStorage.setItem(`paymentStatus_${clubId}`, JSON.stringify(statusMap));
          } catch (err) {
            console.error('Error saving payment status to localStorage:', err);
          }
          
          // Cập nhật danh sách requests theo filter hiện tại
          setApiRequests(mapped);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Polling payment status error:', err);
          // Không hiển thị lỗi khi polling để tránh spam
        }
      }
    }, 2000); // Poll mỗi 2 giây để real-time hơn

    return () => {
      clearInterval(pollInterval);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, loading, selectedStatus]); // Chạy khi clubId, loading hoặc selectedStatus thay đổi

  const displayRequests = apiRequests.length ? apiRequests : requests;

  const statusToDisplay = (statusRaw) => {
    const st = (statusRaw || '').toLowerCase();
    if (st === 'daduyet' || st === 'approved') return 'approved';
    if (st === 'tuchoi' || st === 'rejected') return 'rejected';
    if (st === 'daroi' || st === 'daroiclb' || st === 'daroi clb') return 'left';
    return 'unknown';
  };

  const updateStatus = async (request, statusValue) => {
    const subscriptionId = request.subscriptionId || request.id;
    if (!subscriptionId) return;
    setActionLoadingId(subscriptionId);
    setActionError('');
    // ========== API CALL: PUT /registrations/approve - Approve Join Request ==========
    // Mục đích: Leader duyệt yêu cầu tham gia CLB (chuyển status từ ChoDuyet → DaDuyet)
    // Request body: { subscriptionId, status }
    // Response: Updated registration object với status = 'DaDuyet'
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('https://clubmanage.azurewebsites.net/api/registrations/approve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subscriptionId,
          status: statusValue
        }),
        signal: controller.signal
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
        setActionError(data.message || 'Không thể cập nhật trạng thái.');
        return;
      }
      const newStatus = statusToDisplay(statusValue);
      setApiRequests(prev =>
        prev.map(r =>
          (r.subscriptionId || r.id) === subscriptionId ? { ...r, status: newStatus } : r
        )
      );
      if (selectedRequest && (selectedRequest.subscriptionId || selectedRequest.id) === subscriptionId) {
        setSelectedRequest(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Approve/Reject error:', err);
        setActionError('Không thể cập nhật trạng thái.');
      }
    } finally {
      setActionLoadingId(null);
    }
    return () => controller.abort();
  };

  const handleApproveClick = (req) => {
    if (onApprove) onApprove(req.id);
    updateStatus(req, 'DaDuyet');
  };

  const handleRejectClick = (req) => {
    if (onReject) onReject(req.id);
    updateStatus(req, 'TuChoi');
  };

  const handleConfirmPayment = async (request, method = 'Offline') => {
    const subscriptionId = request.subscriptionId || request.id;
    if (!subscriptionId) return;
    setPaymentLoadingId(subscriptionId);
    setActionError('');
    // ========== API CALL: PUT /registrations/confirm-payment - Confirm Payment ==========
    // Mục đích: Leader xác nhận đã thu phí từ thành viên (set isPaid = true)
    // Request body: { subscriptionId, paymentMethod }
    // Response: Updated registration object với isPaid = true
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('https://clubmanage.azurewebsites.net/api/registrations/confirm-payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subscriptionId,
          paymentMethod: method
        }),
        signal: controller.signal
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
        setActionError(data.message || 'Không thể xác nhận thanh toán.');
        return;
      }
      setApiRequests(prev =>
        prev.map(r =>
          (r.subscriptionId || r.id) === subscriptionId
            ? { ...r, isPaid: true, paymentMethod: method }
            : r
        )
      );
      if (selectedRequest && (selectedRequest.subscriptionId || selectedRequest.id) === subscriptionId) {
        setSelectedRequest(prev => ({ ...prev, isPaid: true, paymentMethod: method }));
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Confirm payment error:', err);
        setActionError('Không thể xác nhận thanh toán.');
      }
    } finally {
      setPaymentLoadingId(null);
    }
    return () => controller.abort();
  };

  // Không return sớm để filter luôn hiển thị

  const handleViewDetails = async (request) => {
    const subscriptionId = request.subscriptionId || request.id;
    if (!subscriptionId) return;

    setSelectedRequest(request);
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailError('');
    setDetailData(null);

    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    try {
      // ========== API CALL: GET /registers/{subscriptionId} - Get Registration Detail ==========
      // Mục đích: Lấy chi tiết đăng ký để hiển thị trong modal (studentName, joinReason, etc.)
      // Response: Registration object với đầy đủ thông tin
      // Lưu ý: Có thể bị 403 nếu không có quyền, có retry logic
      const res = await fetch(`https://clubmanage.azurewebsites.net/api/registers/${subscriptionId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal: controller.signal
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.code === 1000 || data.code === 0)) {
        const result = data.result || data;
        setDetailData({
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
          joinReason: result.joinReason,
          isPaid: result.isPaid,
          paymentMethod: result.paymentMethod,
          clubRole: result.clubRole,
          approverName: result.approverName,
          createdAt: result.createdAt,
          paymentDate: result.paymentDate,
          startDate: result.startDate,
          endDate: result.endDate,
          joinDate: result.joinDate
        });
      } else {
        setDetailError(data.message || 'Không thể tải chi tiết đăng ký.');
        // Fallback: sử dụng dữ liệu từ danh sách
        setDetailData(null);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Fetch request details error:', err);
        setDetailError('Không thể tải chi tiết đăng ký.');
        // Fallback: sử dụng dữ liệu từ danh sách
        setDetailData(null);
      }
    } finally {
      setDetailLoading(false);
    }

    return () => controller.abort();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-amber-500', text: 'Chờ duyệt' },
      approved: { bg: 'bg-green-500', text: 'Đã chấp nhận' },
      rejected: { bg: 'bg-red-500', text: 'Đã từ chối' },
      left: { bg: 'bg-gray-500', text: 'Đã rời CLB' },
      unknown: { bg: 'bg-gray-400', text: 'Không xác định' }
    };

    const config = statusConfig[status] || statusConfig.unknown;
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase text-white whitespace-nowrap inline-block ${config.bg}`}>
        {config.text}
      </span>
    );
  };

  return (
    <>
      {/* Filter luôn hiển thị, không phụ thuộc vào loading/error/empty state */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Lọc theo trạng thái:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                const newStatus = e.target.value;
                setSelectedStatus(newStatus);
                localStorage.setItem('joinRequestsFilter', newStatus);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-fpt-blue focus:outline-none focus:ring-2 focus:ring-fpt-blue focus:border-transparent transition-all cursor-pointer min-w-[180px]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Tổng số: <span className="font-semibold text-fpt-blue">{apiRequests.length}</span> đơn
          </div>
        </div>
      </div>

      {/* Hiển thị loading state */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-6">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Đang tải danh sách yêu cầu...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát.</p>
        </div>
      )}

      {/* Hiển thị error state */}
      {error && !loading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không thể tải danh sách</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      )}

      {/* Hiển thị nội dung chính */}
      {!loading && !error && (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {displayRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {selectedStatus === 'all' 
                ? 'Không có yêu cầu nào' 
                : `Không có yêu cầu nào với trạng thái "${statusOptions.find(opt => opt.value === selectedStatus)?.label || selectedStatus}"`}
            </h2>
            <p className="text-gray-600">
              {selectedStatus === 'all' 
                ? 'Chưa có đơn đăng ký nào cho câu lạc bộ này.' 
                : 'Hãy thử chọn trạng thái khác để xem các đơn đăng ký.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Tên sinh viên</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Mã sinh viên</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Ngày gửi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayRequests.map((request) => (
                <tr key={`${request.id}-${request.status}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-800">{request.studentName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{request.studentEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-800">{request.studentId || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-start gap-2 flex-wrap">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all whitespace-nowrap"
                      >
                        📋 Chi tiết
                      </button>
                      {request.status === 'approved' && request.isPaid && (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200 whitespace-nowrap">
                          ✅ Thanh toán thành công
                        </span>
                      )}
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveClick(request)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all whitespace-nowrap disabled:opacity-60"
                            disabled={actionLoadingId === (request.subscriptionId || request.id)}
                          >
                            {actionLoadingId === (request.subscriptionId || request.id) ? 'Đang duyệt...' : '✅ Chấp nhận'}
                          </button>
                          <button
                            onClick={() => handleRejectClick(request)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all whitespace-nowrap disabled:opacity-60"
                            disabled={actionLoadingId === (request.subscriptionId || request.id)}
                          >
                            {actionLoadingId === (request.subscriptionId || request.id) ? 'Đang cập nhật...' : '❌ Từ chối'}
                          </button>
                        </>
                      )}
                      {request.status === 'approved' && !request.isPaid && (
                        <button
                          onClick={() => handleConfirmPayment(request)}
                          className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-all whitespace-nowrap disabled:opacity-60"
                          disabled={paymentLoadingId === (request.subscriptionId || request.id)}
                        >
                          {paymentLoadingId === (request.subscriptionId || request.id) ? 'Đang xác nhận...' : '✓ Xác nhận đã thu phí'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Detail Modal */}
              {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5" onClick={() => {
          setShowDetailModal(false);
          setDetailData(null);
          setDetailError('');
        }}>
          <div className="bg-white rounded-xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
              <h2 className="text-2xl font-bold m-0">Chi tiết yêu cầu tham gia</h2>
              <button 
                className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailData(null);
                  setDetailError('');
                }}
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {detailLoading ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-gray-600">Đang tải chi tiết đăng ký...</p>
                </div>
              ) : null}

              {detailData && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-800 m-0">{detailData.studentName}</h3>
                      {getStatusBadge(detailData.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Email: {detailData.studentEmail}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-gray-700 block mb-2">Mã sinh viên:</label>
                        <p className="text-gray-800 m-0">{detailData.studentCode || '-'}</p>
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 block mb-2">Ngày gửi yêu cầu:</label>
                        <p className="text-gray-800 m-0">{detailData.createdAt ? new Date(detailData.createdAt).toLocaleDateString('vi-VN') : '-'}</p>
                      </div>
                    </div>

                    {detailData.joinReason && (
                      <div>
                        <label className="font-semibold text-gray-700 block mb-2">Lý do gia nhập & kỹ năng:</label>
                        <p className="text-gray-800 leading-relaxed m-0 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{detailData.joinReason}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Fallback: hiển thị dữ liệu từ danh sách nếu không có detailData */}
              {!detailData && !detailLoading && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-800 m-0">{selectedRequest.studentName}</h3>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Email: {selectedRequest.studentEmail}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-gray-700 block mb-2">Mã sinh viên:</label>
                        <p className="text-gray-800 m-0">{selectedRequest.studentId || '-'}</p>
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 block mb-2">Ngày gửi yêu cầu:</label>
                        <p className="text-gray-800 m-0">{new Date(selectedRequest.requestDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>

                    {selectedRequest.reason && (
                      <div>
                        <label className="font-semibold text-gray-700 block mb-2">Lý do gia nhập & kỹ năng:</label>
                        <p className="text-gray-800 leading-relaxed m-0 bg-gray-50 p-4 rounded-lg">{selectedRequest.reason}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Action buttons - sử dụng detailData nếu có, nếu không dùng selectedRequest */}
              {((detailData && detailData.status === 'ChoDuyet') || (!detailData && selectedRequest.status === 'pending')) && (
                <div className="flex gap-4 justify-end mt-8 pt-5 border-t-2 border-gray-100">
                  <button
                    onClick={() => {
                      const req = detailData ? { ...selectedRequest, status: detailData.status } : selectedRequest;
                      handleRejectClick(req);
                      setShowDetailModal(false);
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-red-500 text-white hover:bg-red-600 shadow-lg hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"
                    disabled={actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id)}
                  >
                    {actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id) ? 'Đang cập nhật...' : 'Từ chối'}
                  </button>
                  <button
                    onClick={() => {
                      const req = detailData ? { ...selectedRequest, status: detailData.status } : selectedRequest;
                      handleApproveClick(req);
                      setShowDetailModal(false);
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"
                    disabled={actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id)}
                  >
                    {actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id) ? 'Đang duyệt...' : 'Chấp nhận'}
                  </button>
                </div>
              )}
              {((detailData && detailData.status === 'DaDuyet' && !detailData.isPaid) || (!detailData && selectedRequest.status === 'approved' && !selectedRequest.isPaid)) && (
                <div className="flex gap-4 justify-end mt-6 pt-4 border-t-2 border-gray-100">
                  <button
                    onClick={() => {
                      const req = detailData ? { ...selectedRequest, status: detailData.status, isPaid: detailData.isPaid } : selectedRequest;
                      handleConfirmPayment(req);
                      setShowDetailModal(false);
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"
                    disabled={paymentLoadingId === (selectedRequest.subscriptionId || selectedRequest.id)}
                  >
                    {paymentLoadingId === (selectedRequest.subscriptionId || selectedRequest.id) ? 'Đang xác nhận...' : 'Xác nhận đã thu phí'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {actionError && (
        <div className="mt-4 text-center text-red-600 text-sm">{actionError}</div>
      )}
    </>
  );
};

export default JoinRequestsList;

