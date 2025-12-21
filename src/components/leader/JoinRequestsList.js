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
  
  const { showToast } = useToast(); // Hook để hiển thị thông báo toast
  
  // State cho modal chi tiết
  const [selectedRequest, setSelectedRequest] = useState(null); // Request được chọn để xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false); // Hiển thị/ẩn modal chi tiết
  const [detailLoading, setDetailLoading] = useState(false); // Loading khi fetch chi tiết
  const [detailError, setDetailError] = useState(''); // Lỗi khi fetch chi tiết
  const [detailData, setDetailData] = useState(null); // Dữ liệu chi tiết từ API
  
  // State cho danh sách requests
  const [loading, setLoading] = useState(false); // Loading khi fetch danh sách
  const [error, setError] = useState(''); // Lỗi khi fetch danh sách
  const [apiRequests, setApiRequests] = useState([]); // Danh sách requests từ API
  
  // State cho actions (duyệt/từ chối/xác nhận thanh toán)
  const [actionLoadingId, setActionLoadingId] = useState(null); // ID của request đang được xử lý (duyệt/từ chối)
  const [actionError, setActionError] = useState(''); // Lỗi khi thực hiện action
  const [paymentLoadingId, setPaymentLoadingId] = useState(null); // ID của request đang xác nhận thanh toán
  
  // Map lưu trạng thái thanh toán trước đó: { subscriptionId: isPaid (true/false) }
  // Mục đích: So sánh với trạng thái hiện tại để phát hiện thay đổi (false → true)
  const previousPaymentStatusRef = useRef(new Map());
  
  // Flag đánh dấu đã load dữ liệu lần đầu
  // true = lần đầu load → KHÔNG hiển thị toast (tránh spam)
  // false = đã load rồi → CÓ THỂ hiển thị toast khi có thay đổi
  const isInitialLoadRef = useRef(true);
  
  /**
   * 
   * MỤC ĐÍCH:
   * - Lấy userId của leader đang đăng nhập để filter ra khỏi danh sách requests
   * - Tránh leader thấy request của chính mình trong danh sách
   * 
   * CÁCH HOẠT ĐỘNG:
   * 1. Thử lấy từ localStorage user object (getUserFromStorage)
   * 2. Nếu không có, thử parse từ JWT token
   * 3. Thử các field phổ biến: sub, nameid, userId, UserId
   * 
   * SỬ DỤNG:
   * - Được gọi trong processRegistrationsData để filter leader ra khỏi danh sách
   */
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
  
  /**
   * MỤC ĐÍCH:
   * - Khi component mount hoặc clubId thay đổi, load lại trạng thái thanh toán đã lưu
   * - Khôi phục previousPaymentStatusRef (Map chứa isPaid của từng subscription)
   * - Set flag isInitialLoadRef để biết đây có phải lần đầu load không
   * 
   * TẠI SAO CẦN ĐOẠN CODE NÀY?
   * 1. Phát hiện thay đổi thanh toán: So sánh isPaid hiện tại với isPaid trước đó
   *    → Nếu từ false → true: Hiển thị toast " Sinh viên đã chuyển tiền thành công!"
   * 
   * 2. Tránh toast spam: Nếu là lần đầu load (isInitialLoadRef = true), KHÔNG hiển thị toast
   *    → Vì có thể tất cả đã thanh toán từ trước, không phải "mới" thanh toán
   * 
   * 3. Persist qua reload: Khi user reload trang hoặc chuyển CLB, trạng thái được khôi phục
   *    → Tiếp tục theo dõi thay đổi thanh toán realtime
   * 
   * CÁCH HOẠT ĐỘNG:
   * - Key trong localStorage: `paymentStatus_{clubId}`
   * - Value: JSON object { subscriptionId1: true/false, subscriptionId2: true/false, ... }
   * - Load vào previousPaymentStatusRef (Map) để so sánh với dữ liệu mới từ API
   * 
   * VÍ DỤ:
   * - Lần 1: Load CLB → localStorage rỗng → isInitialLoadRef = true → Không hiển thị toast
   * - Lần 2: Reload → Load từ localStorage → isInitialLoadRef = false → Có thay đổi mới hiển thị toast
   * - Student A: isPaid từ false → true → Hiển thị toast "💰 A đã chuyển tiền thành công!"
   */
  useEffect(() => {
    if (!clubId) return;
    
    try {
      const savedKey = `paymentStatus_${clubId}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        // Có dữ liệu đã lưu → Khôi phục vào Map
        const savedMap = JSON.parse(saved);
        previousPaymentStatusRef.current.clear();
        Object.entries(savedMap).forEach(([key, value]) => {
          previousPaymentStatusRef.current.set(key, value);
        });
        // Đã có dữ liệu lưu → Không phải lần đầu load → Có thể hiển thị toast khi có thay đổi
        isInitialLoadRef.current = false;
      } else {
        // Chưa có dữ liệu lưu → Đây là lần đầu load → Không hiển thị toast
        isInitialLoadRef.current = true;
        previousPaymentStatusRef.current.clear();
      }
    } catch (err) {
      console.error('Error loading payment status from localStorage:', err);
      // Lỗi parse → Coi như lần đầu load
      isInitialLoadRef.current = true;
      previousPaymentStatusRef.current.clear();
    }
  }, [clubId]);
  
  // State cho filter - Khôi phục từ localStorage khi component mount
  const [selectedStatus, setSelectedStatus] = useState(() => {
    const saved = localStorage.getItem('joinRequestsFilter');
    // Nếu filter đã lưu là "DaRoiCLB" (đã bị xóa), reset về "all"
    if (saved === 'DaRoiCLB') {
      localStorage.setItem('joinRequestsFilter', 'all');
      return 'all';
    }
    return saved || 'all'; // Mặc định là "all"
  });
  
  // Danh sách options cho dropdown filter
  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'ChoDuyet', label: 'Chờ duyệt' },
    { value: 'DaDuyet', label: 'Đã duyệt' },
    { value: 'TuChoi', label: 'Từ chối' }
  ];

  /**
   * Kiểm tra status có phải "đã rời CLB" không
   * @param {string} status - Status từ API
   * @returns {boolean} - true nếu là status "đã rời CLB"
   * 
   * MỤC ĐÍCH: Filter ẩn các yêu cầu đã rời CLB khỏi danh sách
   * CÁC TRƯỜNG HỢP: "daroi", "daroi clb", "daroiclb", "daroiclub" (case-insensitive)
   */
  const isLeftStatus = (status = '') => {
    const st = status.toLowerCase();
    return st === 'daroi' || st === 'daroi clb' || st === 'daroiclb' || st === 'daroiclub';
  };

  /**
   * Map status từ API format sang UI format
   * @param {string} status - Status từ API (ChoDuyet, DaDuyet, TuChoi, DaRoiCLB, etc.)
   * @returns {string} - Status cho UI (pending, approved, rejected, left, unknown)
   * 
   * MỤC ĐÍCH: Chuẩn hóa status để hiển thị badge và điều kiện logic
   */
  const mapStatus = (status = '') => {
    const st = status.toLowerCase();
    if (st === 'choduyet' || st === 'pending') return 'pending';
    if (st === 'daduyet' || st === 'approved') return 'approved';
    if (st === 'tuchoi' || st === 'rejected') return 'rejected';
    if (isLeftStatus(st)) return 'left';
    return 'unknown';
  };

  /**
   * 
   * MỤC ĐÍCH: Tránh code duplication giữa fetchRegistrations và polling
   * 
   * @param {Array} apiResult - Dữ liệu từ API (data.result)
   * @param {Object} options - Options object
   * @param {boolean} options.isPolling - true nếu đang polling, false nếu fetch lần đầu
   * @param {boolean} options.shouldSaveToLocalStorage - Có lưu vào localStorage không (chỉ polling)
   * @returns {Array} - Mapped requests array đã được filter và xử lý
   * 
   */
  const processRegistrationsData = (apiResult, options = {}) => {
    const { isPolling = false, shouldSaveToLocalStorage = false } = options;
    
    // Mục đích: Lấy userId và email của leader để filter ra khỏi danh sách
    const currentLeaderUserId = getCurrentLeaderUserId();
    const userData = getUserFromStorage();
    const currentLeaderEmail = userData?.email || userData?.studentEmail || '';

    // Mục đích: Ẩn hoàn toàn các yêu cầu có status = DaRoiCLB
    // Lý do: Leader không cần thấy các yêu cầu đã rời CLB
    let filtered = (apiResult || []).filter(item => !isLeftStatus(item.status));
    
    // Mục đích: Ẩn request của chính leader (nếu leader đã từng là member)
    // Lý do: Leader không cần thấy request của chính mình
    // Cách: So sánh userId hoặc email
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

    // Mục đích: Chuẩn hóa dữ liệu để hiển thị trong UI
    // - Map status: ChoDuyet → pending, DaDuyet → approved, etc.
    // - Chuẩn hóa field names: subscriptionId, studentCode → studentId, etc.
    // - Set default values cho các field có thể null/undefined
    const mapped = filtered.map(item => ({
      id: item.subscriptionId || item.id,
      subscriptionId: item.subscriptionId || item.id,
      userId: item.userId || null,
      studentName: item.studentName || '',
      studentEmail: item.studentEmail || '',
      studentId: item.studentCode || '',
      phone: item.phone || '',
      major: item.major || '',
      requestDate: item.createdAt || item.joinDate || new Date().toISOString(),
      status: mapStatus(item.status), // Map status sang UI format
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
    
    // Mục đích: Phát hiện khi có thanh toán mới (isPaid: false → true)
    // Cách: So sánh isPaid hiện tại với isPaid đã lưu trong previousPaymentStatusRef
    mapped.forEach((req) => {
      const subscriptionId = req.subscriptionId || req.id;
      const currentIsPaid = !!req.isPaid; // Convert sang boolean
      
      // Lấy trạng thái thanh toán trước đó từ Map
      const previousIsPaid = previousPaymentStatusRef.current.has(subscriptionId)
        ? !!previousPaymentStatusRef.current.get(subscriptionId)
        : null; // null nếu chưa có trong map (lần đầu thấy request này)
      
      // ĐIỀU KIỆN HIỂN THỊ TOAST:
      // 1. (!isInitialLoadRef.current || isPolling): Không phải lần đầu load HOẶC đang polling
      // 2. previousIsPaid !== null: Đã từng thấy request này (không phải request mới)
      // 3. currentIsPaid === true: Hiện tại đã thanh toán
      // 4. previousIsPaid === false: Trước đó chưa thanh toán
      // → Kết luận: Có thay đổi từ chưa thanh toán → đã thanh toán
      if ((!isInitialLoadRef.current || isPolling) && previousIsPaid !== null && currentIsPaid && previousIsPaid === false) {
        const studentName = req.studentName || 'Sinh viên';
        showToast(`💰 ${studentName} đã chuyển tiền thành công!`, 'success');
      }
      
      // Lưu trạng thái thanh toán hiện tại vào Map để so sánh lần sau
      previousPaymentStatusRef.current.set(subscriptionId, currentIsPaid);
    });
    
    // Mục đích: Set flag để biết đã load xong lần đầu
    // Chỉ set khi fetch lần đầu (không phải polling)
    if (!isPolling && isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
    
    // Mục đích: Persist trạng thái thanh toán để khôi phục khi reload
    // Chỉ lưu khi polling (shouldSaveToLocalStorage = true)
    if (shouldSaveToLocalStorage && clubId) {
      try {
        // Convert Map sang Object để lưu vào localStorage
        const statusMap = Object.fromEntries(previousPaymentStatusRef.current);
        localStorage.setItem(`paymentStatus_${clubId}`, JSON.stringify(statusMap));
      } catch (err) {
        console.error('Error saving payment status to localStorage:', err);
      }
    }
    
    return mapped;
  };

  /**
   * USE EFFECT 1: FETCH DANH SÁCH YÊU CẦU THAM GIA
   * 
   * KHI NÀO CHẠY:
   * - Khi component mount lần đầu
   * - Khi clubId thay đổi (chuyển sang CLB khác)
   * - Khi selectedStatus thay đổi (thay đổi filter)
   * 
   * MỤC ĐÍCH:
   * - Fetch danh sách requests từ API
   * - Xử lý và hiển thị dữ liệu trong bảng
   * 
   * FLOW:
   * 1. VALIDATE: Kiểm tra clubId có tồn tại không
   * 2. SET LOADING: setLoading(true) để hiển thị loading state
   * 3. BUILD URL: Tạo URL dựa trên selectedStatus (all hoặc status cụ thể)
   * 4. CALL API: GET /registrations/club/{clubId} hoặc với status filter
   * 5. PROCESS DATA: Gọi processRegistrationsData để filter, map, check payment
   * 6. UPDATE UI: setApiRequests với dữ liệu đã xử lý
   * 7. HANDLE ERROR: Nếu API fail, set error message
   * 8. CLEANUP: Abort controller khi component unmount hoặc dependencies thay đổi
   * 
   * DEPENDENCIES: [clubId, selectedStatus]
   * - Khi clubId thay đổi → Fetch lại danh sách cho CLB mới
   * - Khi selectedStatus thay đổi → Fetch lại với filter mới
   */
  useEffect(() => {
    // Early return nếu không có clubId
    if (!clubId) return;
    
    // Tạo AbortController để có thể hủy request khi component unmount
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchRegistrations = async () => {
      // SET LOADING STATE
      setLoading(true);
      setError('');
      
      try {
        // BUILD URL dựa trên selectedStatus
        const url = selectedStatus === 'all'
          ? `https://clubmanage.azurewebsites.net/api/registrations/club/${clubId}`
          : `https://clubmanage.azurewebsites.net/api/registrations/club/${clubId}/status/${selectedStatus}`;
        
        // CALL API
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal // Để có thể abort
        });
        
        // PARSE RESPONSE
        const data = await res.json().catch(() => ({}));
        
        // HANDLE SUCCESS
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          // Sử dụng function chung để xử lý dữ liệu (filter, map, check payment)
          const mapped = processRegistrationsData(data.result || [], {
            isPolling: false, // Không phải polling
            shouldSaveToLocalStorage: false // Không lưu vào localStorage (chỉ polling mới lưu)
          });
          
          // UPDATE UI
          setApiRequests(mapped);
        } else {
          // HANDLE ERROR
          setApiRequests([]);
          setError(data.message || 'Không thể tải danh sách đơn đăng ký.');
        }
      } catch (err) {
        // HANDLE EXCEPTION
        if (err.name !== 'AbortError') {
          console.error('Fetch registrations error:', err);
          setError('Không thể tải danh sách đơn đăng ký.');
        }
      } finally {
        // CLEANUP: Reset loading state
        setLoading(false);
      }
    };

    // Gọi function fetch
    fetchRegistrations();
    
    // CLEANUP: Abort request khi component unmount hoặc dependencies thay đổi
    return () => controller.abort();
  }, [clubId, selectedStatus]); // Chạy lại khi clubId hoặc selectedStatus thay đổi

  /**
   * USE EFFECT 2: POLLING REALTIME ĐỂ CẬP NHẬT TRẠNG THÁI THANH TOÁN
   * 
   * KHI NÀO CHẠY:
   * - Sau khi component mount và đã fetch xong lần đầu (loading === false)
   * - Khi clubId thay đổi (chuyển sang CLB khác)
   * - Khi selectedStatus thay đổi (thay đổi filter)
   * 
   * MỤC ĐÍCH:
   * - Polling mỗi 2 giây để kiểm tra thay đổi trạng thái thanh toán realtime
   * - Phát hiện khi student thanh toán (isPaid: false → true)
   * - Hiển thị toast thông báo khi có thanh toán mới
   * - Lưu trạng thái vào localStorage để persist khi reload
   * 
   * DEPENDENCIES: [clubId, loading, selectedStatus]
   * - clubId: Polling cho CLB hiện tại
   * - loading: Chỉ polling khi không đang fetch lần đầu
   * - selectedStatus: Polling theo filter hiện tại
   */
  useEffect(() => {
    // Early return nếu không có clubId hoặc đang loading
    if (!clubId || loading) return;

    const token = localStorage.getItem('authToken');
    const controller = new AbortController();

    // SETUP INTERVAL: Chạy mỗi 2 giây
    const pollInterval = setInterval(async () => {
      try {
        // BUILD URL (giống như fetchRegistrations)
        const url = selectedStatus === 'all'
          ? `https://clubmanage.azurewebsites.net/api/registrations/club/${clubId}`
          : `https://clubmanage.azurewebsites.net/api/registrations/club/${clubId}/status/${selectedStatus}`;
        
        // CALL API
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        
        // PARSE RESPONSE
        const data = await res.json().catch(() => ({}));
        
        // HANDLE SUCCESS
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          // Sử dụng function chung với isPolling = true
          const mapped = processRegistrationsData(data.result || [], {
            isPolling: true, // Đang polling → Có thể hiển thị toast
            shouldSaveToLocalStorage: true // Lưu vào localStorage để persist
          });
          
          // UPDATE UI
          setApiRequests(mapped);
        }
      } catch (err) {
        // HANDLE EXCEPTION - Không hiển thị lỗi để tránh spam
        if (err.name !== 'AbortError') {
          console.error('Polling payment status error:', err);
          // Không set error state để tránh spam error message
        }
      }
    }, 2000); // Poll mỗi 2 giây

    // CLEANUP: Clear interval và abort controller khi component unmount hoặc dependencies thay đổi
    return () => {
      clearInterval(pollInterval);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, loading, selectedStatus]); // Chạy lại khi clubId, loading hoặc selectedStatus thay đổi
  
  // Ưu tiên hiển thị apiRequests, fallback về requests từ props
  const displayRequests = apiRequests.length ? apiRequests : requests;

  /**
   * Map status từ API response sang format hiển thị
   * @param {string} statusRaw - Status từ API response
   * @returns {string} - Status đã map (approved, rejected, left, unknown)
   * 
   * MỤC ĐÍCH: Dùng trong updateStatus để map status từ API response
   * KHÁC VỚI mapStatus: Function này chỉ xử lý status từ API response, không xử lý pending
   */
  const statusToDisplay = (statusRaw) => {
    const st = (statusRaw || '').toLowerCase();
    if (st === 'daduyet' || st === 'approved') return 'approved';
    if (st === 'tuchoi' || st === 'rejected') return 'rejected';
    if (st === 'daroi' || st === 'daroiclb' || st === 'daroi clb') return 'left';
    return 'unknown';
  };

  /**
   * FUNCTION: DUYỆT/TỪ CHỐI YÊU CẦU THAM GIA
   * 
   * MỤC ĐÍCH: Cập nhật status của registration (duyệt hoặc từ chối)
   * 
   * @param {Object} request - Request object cần cập nhật
   * @param {string} statusValue - Status mới: "DaDuyet" (duyệt) hoặc "TuChoi" (từ chối)
   * 
   * FLOW XỬ LÝ:
   * 1. VALIDATE: Kiểm tra subscriptionId có tồn tại không
   * 2. SET LOADING: Set actionLoadingId để hiển thị loading state
   * 3. CALL API: Gọi PUT /registrations/approve với subscriptionId và status
   * 4. HANDLE RESPONSE:
   *    - Thành công: Cập nhật UI ngay lập tức (setApiRequests, setSelectedRequest)
   *    - Thất bại: Hiển thị lỗi (setActionError)
   * 5. CLEANUP: Reset loading state và abort controller
   * 
   */
  const updateStatus = async (request, statusValue) => {
    // BƯỚC 1: VALIDATE subscriptionId
    const subscriptionId = request.subscriptionId || request.id;
    if (!subscriptionId) return; // Không có ID → Không làm gì
    
    // BƯỚC 2: SET LOADING STATE
    setActionLoadingId(subscriptionId); // Hiển thị "Đang duyệt..." hoặc "Đang cập nhật..."
    setActionError(''); // Clear error trước đó
    
    // BƯỚC 3: CHUẨN BỊ API CALL
    const controller = new AbortController(); // Để có thể hủy request nếu cần
    const token = localStorage.getItem('authToken');
    
    try {
      // BƯỚC 4: CALL API
      const res = await fetch('https://clubmanage.azurewebsites.net/api/registrations/approve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subscriptionId,
          status: statusValue // "DaDuyet" hoặc "TuChoi"
        }),
        signal: controller.signal
      });
      
      // BƯỚC 5: PARSE RESPONSE
      const data = await res.json().catch(() => ({}));
      
      // BƯỚC 6: HANDLE ERROR
      if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
        setActionError(data.message || 'Không thể cập nhật trạng thái.');
        return; // Dừng lại, không cập nhật UI
      }
      
      // BƯỚC 7: UPDATE UI (Thành công)
      const newStatus = statusToDisplay(statusValue); // Map "DaDuyet" → "approved", "TuChoi" → "rejected"
      
      // Cập nhật trong danh sách requests
      setApiRequests(prev =>
        prev.map(r =>
          (r.subscriptionId || r.id) === subscriptionId ? { ...r, status: newStatus } : r
        )
      );
      
      // Cập nhật trong selectedRequest (nếu đang xem chi tiết)
      if (selectedRequest && (selectedRequest.subscriptionId || selectedRequest.id) === subscriptionId) {
        setSelectedRequest(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      // BƯỚC 8: HANDLE EXCEPTION
      if (err.name !== 'AbortError') {
        console.error('Approve/Reject error:', err);
        setActionError('Không thể cập nhật trạng thái.');
      }
    } finally {
      // BƯỚC 9: CLEANUP
      setActionLoadingId(null); // Reset loading state
    }
    return () => controller.abort();
  };
  
  /**
   * Handler khi leader click nút "Chấp nhận"
   * @param {Object} req - Request object cần duyệt
   * 
   * FLOW:
   * 1. Gọi callback onApprove từ props (nếu có) - để parent component biết
   * 2. Gọi updateStatus với status = 'DaDuyet' để gọi API
   * 3. API sẽ chuyển status từ "ChoDuyet" → "DaDuyet"
   * 4. UI tự động cập nhật sau khi API thành công
   */
  const handleApproveClick = (req) => {
    if (onApprove) onApprove(req.id);
    updateStatus(req, 'DaDuyet');
  };

  /**
   * Handler khi leader click nút "Từ chối"
   * @param {Object} req - Request object cần từ chối
   * 
   * FLOW:
   * 1. Gọi callback onReject từ props (nếu có) - để parent component biết
   * 2. Gọi updateStatus với status = 'TuChoi' để gọi API
   * 3. API sẽ chuyển status từ "ChoDuyet" → "TuChoi"
   * 4. UI tự động cập nhật sau khi API thành công
   */
  const handleRejectClick = (req) => {
    if (onReject) onReject(req.id);
    updateStatus(req, 'TuChoi');
  };

  /**
   * FUNCTION: XÁC NHẬN THANH TOÁN
   * 
   * MỤC ĐÍCH: Leader xác nhận đã thu phí từ thành viên
   * 
   * @param {Object} request - Request object cần xác nhận thanh toán
   * @param {string} method - Phương thức thanh toán: "Offline" (mặc định) hoặc "Online"
   * 
   * FLOW XỬ LÝ:
   * 1. VALIDATE: Kiểm tra subscriptionId có tồn tại không
   * 2. SET LOADING: Set paymentLoadingId để hiển thị loading state
   * 3. CALL API: Gọi PUT /registrations/confirm-payment với subscriptionId và paymentMethod
   * 4. HANDLE RESPONSE:
   *    - Thành công: Cập nhật UI (set isPaid = true, paymentMethod)
   *    - Thất bại: Hiển thị lỗi
   * 5. CLEANUP: Reset loading state
   * 
   */
  const handleConfirmPayment = async (request, method = 'Offline') => {
    // BƯỚC 1: VALIDATE subscriptionId
    const subscriptionId = request.subscriptionId || request.id;
    if (!subscriptionId) return; // Không có ID → Không làm gì
    
    // BƯỚC 2: SET LOADING STATE
    setPaymentLoadingId(subscriptionId); // Hiển thị "Đang xác nhận..."
    setActionError(''); // Clear error trước đó
    
    // BƯỚC 3: CHUẨN BỊ API CALL
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');
    
    try {
      // BƯỚC 4: CALL API
      const res = await fetch('https://clubmanage.azurewebsites.net/api/registrations/confirm-payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subscriptionId,
          paymentMethod: method // "Offline" hoặc "Online"
        }),
        signal: controller.signal
      });
      
      // BƯỚC 5: PARSE RESPONSE
      const data = await res.json().catch(() => ({}));
      
      // BƯỚC 6: HANDLE ERROR
      if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
        setActionError(data.message || 'Không thể xác nhận thanh toán.');
        return; // Dừng lại, không cập nhật UI
      }
      
      // BƯỚC 7: UPDATE UI (Thành công)
      // Cập nhật trong danh sách requests
      setApiRequests(prev =>
        prev.map(r =>
          (r.subscriptionId || r.id) === subscriptionId
            ? { ...r, isPaid: true, paymentMethod: method } // Set isPaid = true
            : r
        )
      );
      
      // Cập nhật trong selectedRequest (nếu đang xem chi tiết)
      if (selectedRequest && (selectedRequest.subscriptionId || selectedRequest.id) === subscriptionId) {
        setSelectedRequest(prev => ({ ...prev, isPaid: true, paymentMethod: method }));
      }
    } catch (err) {
      // BƯỚC 8: HANDLE EXCEPTION
      if (err.name !== 'AbortError') {
        console.error('Confirm payment error:', err);
        setActionError('Không thể xác nhận thanh toán.');
      }
    } finally {
      // BƯỚC 9: CLEANUP
      setPaymentLoadingId(null); // Reset loading state
    }
    return () => controller.abort();
  };

  // Không return sớm để filter luôn hiển thị

  /**
   * FUNCTION: XEM CHI TIẾT YÊU CẦU
   * 
   * MỤC ĐÍCH: Lấy và hiển thị thông tin chi tiết của registration trong modal
   * 
   * @param {Object} request - Request object cần xem chi tiết
   * 
   * FLOW XỬ LÝ:
   * 1. VALIDATE: Kiểm tra subscriptionId có tồn tại không
   * 2. OPEN MODAL: Set selectedRequest, showDetailModal = true, set loading state
   * 3. CALL API: Gọi GET /registers/{subscriptionId} để lấy chi tiết
   * 4. HANDLE RESPONSE:
   *    - Thành công: Set detailData với đầy đủ thông tin từ API
   *    - Thất bại: Set detailError, fallback về dữ liệu từ danh sách (selectedRequest)
   * 5. CLEANUP: Reset loading state
   * 
   */
  const handleViewDetails = async (request) => {
    // BƯỚC 1: VALIDATE subscriptionId
    const subscriptionId = request.subscriptionId || request.id;
    if (!subscriptionId) return; // Không có ID → Không làm gì

    // BƯỚC 2: OPEN MODAL VÀ SET LOADING STATE
    setSelectedRequest(request); // Lưu request để fallback nếu API fail
    setShowDetailModal(true); // Hiển thị modal ngay lập tức
    setDetailLoading(true); // Hiển thị loading spinner
    setDetailError(''); // Clear error trước đó
    setDetailData(null); // Clear data trước đó

    // BƯỚC 3: CHUẨN BỊ API CALL
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    try {
      // BƯỚC 4: CALL API
      const res = await fetch(`https://clubmanage.azurewebsites.net/api/registers/${subscriptionId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal: controller.signal
      });

      // BƯỚC 5: PARSE RESPONSE
      const data = await res.json().catch(() => ({}));
      
      // BƯỚC 6: HANDLE SUCCESS
      if (res.ok && (data.code === 1000 || data.code === 0)) {
        const result = data.result || data;
        // Set detailData với đầy đủ thông tin từ API
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
          joinReason: result.joinReason, // Lý do gia nhập (chỉ có trong detail API)
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
        // BƯỚC 7: HANDLE ERROR - Fallback về dữ liệu từ danh sách
        setDetailError(data.message || 'Không thể tải chi tiết đăng ký.');
        // Không set detailData → Modal sẽ dùng selectedRequest (fallback)
        setDetailData(null);
      }
    } catch (err) {
      // BƯỚC 8: HANDLE EXCEPTION - Fallback về dữ liệu từ danh sách
      if (err.name !== 'AbortError') {
        console.error('Fetch request details error:', err);
        setDetailError('Không thể tải chi tiết đăng ký.');
        // Không set detailData → Modal sẽ dùng selectedRequest (fallback)
        setDetailData(null);
      }
    } finally {
      // BƯỚC 9: CLEANUP
      setDetailLoading(false); // Ẩn loading spinner
    }

    return () => controller.abort();
  };
  
  /**
   * Tạo badge hiển thị trạng thái request
   * @param {string} status - Status đã được map (pending, approved, rejected, left, unknown)
   * @returns {JSX.Element} - Badge component với màu và text tương ứng
   * 
   * MỤC ĐÍCH: Hiển thị badge màu sắc cho từng trạng thái
   * 
   * MÀU SẮC:
   * - pending: Vàng (bg-amber-500) - "Chờ duyệt"
   * - approved: Xanh lá (bg-green-500) - "Đã chấp nhận"
   * - rejected: Đỏ (bg-red-500) - "Đã từ chối"
   * - left: Xám (bg-gray-500) - "Đã rời CLB"
   * - unknown: Xám nhạt (bg-gray-400) - "Không xác định"
   */
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
      {/* 
        FILTER SECTION - Luôn hiển thị, không phụ thuộc vào loading/error/empty state
        MỤC ĐÍCH: Cho phép leader filter requests theo trạng thái
        BEHAVIOR:
        - Khi thay đổi filter → selectedStatus thay đổi → useEffect fetchRegistrations chạy lại
        - Lưu filter vào localStorage để giữ lại khi reload
        - Hiển thị tổng số requests hiện tại
      */}
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
                setSelectedStatus(newStatus); // Trigger useEffect fetchRegistrations
                localStorage.setItem('joinRequestsFilter', newStatus); // Persist filter
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

      {/* 
        LOADING STATE - Hiển thị khi đang fetch dữ liệu lần đầu
        ĐIỀU KIỆN: loading === true
        MỤC ĐÍCH: Thông báo user đang tải dữ liệu
      */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-6">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Đang tải danh sách yêu cầu...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát.</p>
        </div>
      )}

      {/* 
        ERROR STATE - Hiển thị khi có lỗi fetch dữ liệu
        ĐIỀU KIỆN: error !== '' && loading === false
        MỤC ĐÍCH: Thông báo lỗi và cho user biết không thể tải dữ liệu
      */}
      {error && !loading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không thể tải danh sách</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      )}

      {/* 
        MAIN CONTENT - Hiển thị danh sách requests
        ĐIỀU KIỆN: !loading && !error
        NỘI DUNG:
        - Nếu không có requests: Hiển thị empty state
        - Nếu có requests: Hiển thị table với danh sách
      */}
      {!loading && !error && (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* 
          EMPTY STATE - Không có requests nào
          ĐIỀU KIỆN: displayRequests.length === 0
          MỤC ĐÍCH: Thông báo không có dữ liệu, gợi ý user thử filter khác
        */}
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
          /* 
            TABLE - Hiển thị danh sách requests dạng bảng
            CẤU TRÚC:
            - Header: Tên sinh viên, Email, Mã sinh viên, Ngày gửi, Trạng thái, Thao tác
            - Body: Map qua displayRequests, mỗi row là một request
            - Actions: Chi tiết, Chấp nhận/Từ chối (nếu pending), Xác nhận thanh toán (nếu approved && !isPaid)
          */
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
                      {/* 
                        BUTTON CHI TIẾT - Luôn hiển thị cho mọi request
                        ACTION: Mở modal hiển thị chi tiết request
                      */}
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all whitespace-nowrap"
                      >
                        📋 Chi tiết
                      </button>
                      
                      {/* 
                        BADGE THANH TOÁN THÀNH CÔNG - Chỉ hiển thị khi đã duyệt VÀ đã thanh toán
                        ĐIỀU KIỆN: request.status === 'approved' && request.isPaid === true
                        MỤC ĐÍCH: Thông báo request đã hoàn tất (đã duyệt + đã thanh toán)
                      */}
                      {request.status === 'approved' && request.isPaid && (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200 whitespace-nowrap">
                          ✅ Thanh toán thành công
                        </span>
                      )}
                      
                      {/* 
                        BUTTONS DUYỆT/TỪ CHỐI - Chỉ hiển thị khi request đang chờ duyệt
                        ĐIỀU KIỆN: request.status === 'pending'
                        ACTIONS:
                        - Chấp nhận: Gọi handleApproveClick → updateStatus('DaDuyet')
                        - Từ chối: Gọi handleRejectClick → updateStatus('TuChoi')
                        DISABLED: Khi đang xử lý (actionLoadingId === request.id)
                      */}
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
                      
                      {/* 
                        BUTTON XÁC NHẬN THANH TOÁN - Chỉ hiển thị khi đã duyệt NHƯNG chưa thanh toán
                        ĐIỀU KIỆN: request.status === 'approved' && request.isPaid === false
                        ACTION: Gọi handleConfirmPayment → API set isPaid = true
                        DISABLED: Khi đang xử lý (paymentLoadingId === request.id)
                      */}
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

      {/* 
        DETAIL MODAL - Modal hiển thị chi tiết request
        ĐIỀU KIỆN: showDetailModal === true && selectedRequest !== null
        MỤC ĐÍCH: Hiển thị đầy đủ thông tin request (lý do gia nhập, thông tin package, etc.)
        BEHAVIOR:
        - Click outside modal → Đóng modal
        - Click nút X → Đóng modal
        - Có thể duyệt/từ chối/xác nhận thanh toán trực tiếp từ modal
      */}
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

              {/* 
                ACTION BUTTONS TRONG MODAL - Hiển thị button dựa trên status và isPaid
                
                LOGIC HIỂN THỊ:
                1. Ưu tiên dùng detailData từ API (nếu có)
                2. Fallback về selectedRequest từ danh sách (nếu API fail)
              */}
              {((detailData && detailData.status === 'ChoDuyet') || (!detailData && selectedRequest.status === 'pending')) && (
                <div className="flex gap-4 justify-end mt-8 pt-5 border-t-2 border-gray-100">
                  {/* BUTTON TỪ CHỐI */}
                  <button
                    onClick={() => {
                      // Merge detailData vào selectedRequest nếu có
                      const req = detailData ? { ...selectedRequest, status: detailData.status } : selectedRequest;
                      handleRejectClick(req); // Gọi API từ chối
                      setShowDetailModal(false); // Đóng modal sau khi xử lý
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-red-500 text-white hover:bg-red-600 shadow-lg hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"
                    disabled={actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id)}
                  >
                    {actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id) ? 'Đang cập nhật...' : 'Từ chối'}
                  </button>
                  
                  {/* BUTTON CHẤP NHẬN */}
                  <button
                    onClick={() => {
                      // Merge detailData vào selectedRequest nếu có
                      const req = detailData ? { ...selectedRequest, status: detailData.status } : selectedRequest;
                      handleApproveClick(req); // Gọi API duyệt
                      setShowDetailModal(false); // Đóng modal sau khi xử lý
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"
                    disabled={actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id)}
                  >
                    {actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id) ? 'Đang duyệt...' : 'Chấp nhận'}
                  </button>
                </div>
              )}
              
              {/* BUTTON XÁC NHẬN THANH TOÁN - Chỉ hiển thị khi đã duyệt nhưng chưa thanh toán */}
              {((detailData && detailData.status === 'DaDuyet' && !detailData.isPaid) || (!detailData && selectedRequest.status === 'approved' && !selectedRequest.isPaid)) && (
                <div className="flex gap-4 justify-end mt-6 pt-4 border-t-2 border-gray-100">
                  <button
                    onClick={() => {
                      // Merge detailData vào selectedRequest nếu có
                      const req = detailData ? { ...selectedRequest, status: detailData.status, isPaid: detailData.isPaid } : selectedRequest;
                      handleConfirmPayment(req); // Gọi API xác nhận thanh toán
                      setShowDetailModal(false); // Đóng modal sau khi xử lý
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

