/**
 * ClubLeaderDashboard Component
 * 
 * Component quản lý CLB cho leader:
 * - Fetch và hiển thị thông tin CLB, thống kê, thành viên
 * - Cập nhật thông tin CLB (logo, mô tả, địa điểm)
 * - Quản lý thành viên (cập nhật role, xóa thành viên)
 * - Real-time polling để cập nhật trạng thái thanh toán
 * 
 * @param {Object} props
 * @param {Array} props.clubs - Danh sách clubs
 * @param {Function} props.setClubs - Callback để update clubs state
 * @param {Array} props.members - Danh sách members
 * @param {Function} props.setMembers - Callback để update members state
 * @param {string} props.currentPage - Trang hiện tại ('manage', 'requests', 'members', 'fee')
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useToast } from '../shared/Toast';
import LeaderStats from './LeaderStats';
import ClubInfo from './ClubInfo';
import JoinRequestsList from './JoinRequestsList';
import MembersList from './MembersList';
import ClubFeeManagement from './ClubFeeManagement';
import { clubCategoryLabels } from '../../data/constants';

const ClubLeaderDashboard = ({ clubs, setClubs, members, setMembers, currentPage }) => {
  const { showToast } = useToast();
  const [joinRequests, setJoinRequests] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState('');
  const [myClub, setMyClub] = useState(null);
  const [clubLoading, setClubLoading] = useState(false);
  const [clubError, setClubError] = useState('');
  const [clubStats, setClubStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [roleLoadingId, setRoleLoadingId] = useState(null);
  const lastFetchedClubId = useRef(null);
  const [showEditForm, setShowEditForm] = useState(false);
  // Lưu trạng thái thanh toán trước đó để phát hiện thay đổi
  const previousPaymentStatusRef = useRef(new Map());
  const isInitialLoadRef = useRef(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    foundedDate: '',
    president: '',
    memberCount: 0,
    status: 'Hoạt động',
    email: '',
    location: '',
    activityTime: '',
    logo: ''
  });

  const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

  /**
   * FUNCTION: MAP API CLUB
   * 
   * MỤC ĐÍCH: Map dữ liệu CLB từ API format sang UI format
   * 
   * LOGIC:
   * - Chuẩn hóa field names: clubName → name, establishedDate → foundedDate, etc.
   * - Set default values cho các field có thể null/undefined
   * - Map isActive → status ('Hoạt động' / 'Tạm dừng')
   * 
   * @param {Object} apiClub - Club object từ API
   * @returns {Object} - Club object đã được map sang UI format
   */
  const mapApiClub = (apiClub) => ({
    id: apiClub?.clubId,
    clubId: apiClub?.clubId,
    name: apiClub?.clubName || '',
    description: apiClub?.description || '',
    category: apiClub?.category || '',
    foundedDate: apiClub?.establishedDate || '',
    president: apiClub?.founderName || apiClub?.presidentName || '',
    memberCount: apiClub?.memberCount || apiClub?.members?.length || 0,
    status: apiClub?.isActive ? 'Hoạt động' : 'Tạm dừng',
    email: apiClub?.email || '',
    location: apiClub?.location || '',
    logo: apiClub?.logo || null,
    activityTime: apiClub?.activityTime || '',
    founderId: apiClub?.founderId,
    founderStudentCode: apiClub?.founderStudentCode,
    raw: apiClub
  });

  /**
   * FUNCTION: NORMALIZE ROLE
   * 
   * MỤC ĐÍCH: Chuẩn hóa role từ API format (ChuTich, PhoChuTich) sang UI format (Chủ tịch, Phó chủ tịch)
   * 
   * LOGIC:
   * - Map các format khác nhau của role (có dấu, không dấu, viết liền, có khoảng trắng)
   * - Trả về role bằng tiếng Việt để hiển thị trong UI
   * 
   * @param {string} role - Role từ API (ChuTich, PhoChuTich, ThuKy, ThuQuy, ThanhVien)
   * @returns {string} - Role đã được normalize (Chủ tịch, Phó chủ tịch, Thư ký, Thủ quỹ, Thành viên)
   */
  const normalizeRole = (role) => {
    if (!role) return 'Thành viên';
    const r = (role || '').toLowerCase();
    if (r === 'chutich' || r === 'chủ tịch' || r === 'chu tich') return 'Chủ tịch';
    if (r === 'phochutich' || r === 'phó chủ tịch' || r === 'pho chu tich') return 'Phó chủ tịch';
    if (r === 'thuky' || r === 'thư ký' || r === 'thu ky') return 'Thư ký';
    if (r === 'thuquy' || r === 'thủ quỹ' || r === 'thu quy') return 'Thủ quỹ';
    if (r === 'thanhvien' || r === 'thành viên' || r === 'thanh vien') return 'Thành viên';
    return role || 'Thành viên';
  };

  /**
   * FUNCTION: MAP API MEMBER
   * 
   * MỤC ĐÍCH: Map dữ liệu member từ API format sang UI format
   * 
   * LOGIC:
   * - Chuẩn hóa field names: studentName → fullName, studentCode → studentId, etc.
   * - Normalize role bằng normalizeRole function
   * - Set default values cho các field có thể null/undefined
   * 
   * @param {Object} m - Member object từ API
   * @param {number|string} clubId - ID của club
   * @returns {Object} - Member object đã được map sang UI format
   */
  const mapApiMember = (m, clubId) => ({
    id: m?.userId || m?.id,
    userId: m?.userId || m?.id,
    fullName: m?.fullName || m?.studentName || '',
    name: m?.fullName || m?.studentName || '',
    email: m?.email || m?.studentEmail || '',
    studentId: m?.studentCode || '',
    phone: m?.phoneNumber || m?.phone || '',
    major: m?.major || '',
    role: normalizeRole(m?.clubRole || m?.role),
    roleCode: m?.clubRole || m?.role,
    status: m?.status || 'Hoạt động',
    joinDate: m?.joinedAt || m?.joinDate,
    expiryDate: m?.endDate || m?.expiryDate,
    packageName: m?.packageName || '',
    term: m?.term || '',
    isPaid: m?.isPaid,
    paymentMethod: m?.paymentMethod,
    clubId
  });

  /**
   * USE EFFECT 0: FETCH USER INFO (MY-INFO)
   * 
   * KHI NÀO CHẠY: Khi component mount lần đầu
   * 
   * MỤC ĐÍCH: Lấy thông tin user mới nhất từ API để refresh token và cập nhật role
   * 
   * FLOW:
   * 1. Gọi API GET /users/my-info
   * 2. Kiểm tra token mới từ response (nếu có)
   * 3. Cập nhật token trong localStorage
   * 4. Cập nhật user data trong localStorage với thông tin mới nhất
   * 
   * DEPENDENCIES: [] (chỉ chạy một lần)
   */
  useEffect(() => {
    const fetchMyInfo = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        // ========== API CALL: GET /users/my-info - Get User Info ==========
        // Mục đích: Lấy thông tin user mới nhất để refresh token và cập nhật role
        // Response: User object với token mới (nếu có)
        const response = await fetch(`${API_BASE_URL}/users/my-info`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && (data.code === 1000 || data.code === 0)) {
          const info = data.result || data.data || data;
          
          // Kiểm tra xem API có trả về token mới không
          const newToken = data.token || data.accessToken || data.access_token || null;
          if (newToken) {
            // Lưu token mới vào localStorage
            localStorage.setItem('authToken', newToken);
          }
          
          // Cập nhật user data trong localStorage với thông tin mới nhất
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              const updatedUser = {
                ...userData,
                ...(info.userId ? { userId: info.userId } : {}),
                ...(info.email ? { email: info.email } : {}),
                ...(info.fullName ? { name: info.fullName, fullName: info.fullName } : {}),
                ...(info.role ? { role: info.role } : {}),
                ...(info.scope ? { scope: info.scope } : {}),
                ...(info.clubId ? { clubId: info.clubId } : {}),
                ...(info.clubIds ? { clubIds: info.clubIds } : {}),
                ...(newToken ? { token: newToken } : {})
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (e) {
              console.error('Error updating user data:', e);
            }
          }
        }
      } catch (error) {
        console.error('Fetch my-info error:', error);
        // Không hiển thị lỗi vì đây chỉ là refresh token, không ảnh hưởng đến chức năng chính
      }
    };

    fetchMyInfo();
  }, []);

  /**
   * USE EFFECT 0.5: LOAD JOIN REQUESTS FROM LOCALSTORAGE (FALLBACK)
   * 
   * KHI NÀO CHẠY: Khi component mount lần đầu
   * 
   * MỤC ĐÍCH: Load join requests từ localStorage làm fallback khi chưa có API
   * 
   * DEPENDENCIES: [] (chỉ chạy một lần)
   */
  useEffect(() => {
    const savedRequests = localStorage.getItem('joinRequests');
    if (savedRequests) {
      try {
        setJoinRequests(JSON.parse(savedRequests));
      } catch (e) {
        console.error('Error parsing joinRequests:', e);
      }
    }
  }, []);

  /**
   * USE EFFECT 1: FETCH THÔNG TIN CLB
   * 
   * KHI NÀO CHẠY: Khi component mount lần đầu
   * 
   * MỤC ĐÍCH: Lấy thông tin CLB mà leader quản lý để hiển thị và edit
   * 
   * FLOW:
   * 1. Xác định clubId từ userData (clubId, clubIds, hoặc từ clubs list)
   * 2. Gọi API GET /clubs/{clubId}
   * 3. Map dữ liệu từ API format sang UI format
   * 4. Lưu vào myClub và formData
   * 5. Retry không có token nếu API fail với 401/403
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : {};
    const token = localStorage.getItem('authToken') || userData.token;

    const fallbackClub = clubs?.[0];
    const clubByFounder = (clubs || []).find(
      c =>
        c?.founderId &&
        userData?.userId &&
        String(c.founderId).toLowerCase() === String(userData.userId).toLowerCase()
    );
    const targetClubId =
      userData.clubId ||
      (Array.isArray(userData.clubIds) ? userData.clubIds[0] : null) ||
      userData.clubID ||
      userData.club?.clubId ||
      clubByFounder?.clubId ||
      clubByFounder?.id ||
      myClub?.clubId ||
      myClub?.id ||
      fallbackClub?.clubId ||
      fallbackClub?.id;

    if (!targetClubId) {
      setClubError('Không tìm thấy câu lạc bộ được gán cho bạn.');
      lastFetchedClubId.current = null;
      return;
    }

    // Tránh gọi lặp cho cùng 1 clubId
    if (lastFetchedClubId.current === targetClubId) {
      return;
    }
    lastFetchedClubId.current = targetClubId;

    let triedWithoutAuth = false;

    const fetchClubDetail = async (useAuth = true) => {
      setClubLoading(true);
      setClubError('');
      try {
        // ========== API CALL: GET /clubs/{id} - Get Club Detail ==========
        // Mục đích: Lấy thông tin chi tiết CLB mà leader quản lý
        // Response: Club object với đầy đủ thông tin để hiển thị và edit
        const res = await fetch(`${API_BASE_URL}/clubs/${targetClubId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(useAuth && token ? { Authorization: `Bearer ${token}` } : {})
          },
          mode: 'cors'
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !(data.code === 1000 || data.code === 0)) {
          if (useAuth && token && (res.status === 401 || res.status === 403) && !triedWithoutAuth) {
            triedWithoutAuth = true;
            console.warn('[ClubLeaderDashboard] Retry without Authorization header');
            await fetchClubDetail(false);
            return;
          }

          const message =
            data.message ||
            (res.status === 401 || res.status === 403
              ? 'Phiên đăng nhập đã hết hạn hoặc không đủ quyền.'
              : 'Không thể tải thông tin câu lạc bộ.');
          setClubError(message);
          showToast(message, 'error');
          setMyClub(null);
          return;
        }

        const mapped = mapApiClub(data.result || {});
        setMyClub(mapped);
        setFormData(mapped);

        if (mapped?.id) {
          setClubs(prev => {
            const exists = prev?.find(c => c.id === mapped.id || c.clubId === mapped.id);
            if (exists) {
              return prev.map(c => (c.id === mapped.id || c.clubId === mapped.id ? mapped : c));
            }
            return [...(prev || []), mapped];
          });
        }
      } catch (err) {
        console.error('Fetch club detail error:', err);
        if (token && !triedWithoutAuth) {
          triedWithoutAuth = true;
          console.warn('[ClubLeaderDashboard] Retry without Authorization header after error');
          await fetchClubDetail(false);
          return;
        }
        setClubError('Không thể kết nối máy chủ.');
        showToast('Không thể kết nối máy chủ.', 'error');
        setMyClub(null);
      } finally {
        setClubLoading(false);
      }
    };

    fetchClubDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // chỉ fetch đúng 1 lần khi mount

  /**
   * USE EFFECT 1.5: SAVE JOIN REQUESTS TO LOCALSTORAGE
   * 
   * KHI NÀO CHẠY: Khi joinRequests state thay đổi
   * 
   * MỤC ĐÍCH: Lưu join requests vào localStorage để persist khi reload
   * 
   * DEPENDENCIES: [joinRequests]
   */
  useEffect(() => {
    localStorage.setItem('joinRequests', JSON.stringify(joinRequests));
  }, [joinRequests]);

  /**
   * USE EFFECT 2: FETCH DANH SÁCH THÀNH VIÊN
   * 
   * KHI NÀO CHẠY: Khi myClub.id hoặc myClub.clubId thay đổi
   * 
   * MỤC ĐÍCH: Lấy danh sách thành viên của CLB để leader quản lý
   * 
   * FLOW:
   * 1. Gọi API GET /clubs/{clubId}/members
   * 2. Map dữ liệu từ API format sang UI format (normalize role)
   * 3. Cập nhật members state và memberCount của CLB
   */
  useEffect(() => {
    const targetClubId = myClub?.id || myClub?.clubId;
    if (!targetClubId) return;

    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchMembers = async () => {
      setMembersLoading(true);
      setMembersError('');
      try {
        // ========== API CALL: GET /clubs/{id}/members - Get Club Members ==========
        // Mục đích: Lấy danh sách thành viên của CLB để leader quản lý
        // Response: Array of member objects với role, status, joinDate, etc.
        const res = await fetch(`${API_BASE_URL}/clubs/${targetClubId}/members`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          const rawMembers = Array.isArray(data.result)
            ? data.result
            : Array.isArray(data.result?.members)
              ? data.result.members
              : [];
          const mapped = rawMembers.map(m => mapApiMember(m, targetClubId));
          setMembers(mapped);
          setMyClub(prev => (prev ? { ...prev, memberCount: mapped.length } : prev));
          setClubs(prev =>
            prev.map(c =>
              c.id === targetClubId || c.clubId === targetClubId ? { ...c, memberCount: mapped.length } : c
            )
          );
        } else {
          setMembers([]);
          setMembersError(data.message || 'Không thể tải danh sách thành viên.');
          showToast(data.message || 'Không thể tải danh sách thành viên.', 'error');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch members error:', err);
          setMembersError('Không thể tải danh sách thành viên.');
          showToast('Không thể tải danh sách thành viên.', 'error');
        }
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
    return () => controller.abort();
  }, [myClub?.id, myClub?.clubId, API_BASE_URL, setClubs, setMembers, showToast]);

  /**
   * USE EFFECT 3: FETCH THỐNG KÊ CLB
   * 
   * KHI NÀO CHẠY: Khi myClub.id hoặc myClub.clubId thay đổi
   * 
   * MỤC ĐÍCH: Lấy thống kê CLB (số thành viên, doanh thu, danh sách chưa đóng phí)
   * 
   * FLOW:
   * 1. Gọi API GET /clubs/{clubId}/stats
   * 2. Lưu vào clubStats state
   * 3. Cập nhật memberCount của CLB từ stats
   */
  useEffect(() => {
    const targetClubId = myClub?.id || myClub?.clubId;
    if (!targetClubId) return;

    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError('');
      try {
        // ========== API CALL: GET /clubs/{id}/stats - Get Club Statistics ==========
        // Mục đích: Lấy thống kê CLB để hiển thị dashboard
        // Response: Object chứa totalMembers, totalRevenue, unpaidCount, unpaidMembers, etc.
        const res = await fetch(`${API_BASE_URL}/clubs/${targetClubId}/stats`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          const result = data.result || {};
          setClubStats(result);
          if (result.totalMembers !== undefined) {
            setMyClub(prev => (prev ? { ...prev, memberCount: result.totalMembers } : prev));
          }
        } else {
          const message = data?.message || 'Không thể tải thống kê CLB.';
          setStatsError(message);
          showToast(message, 'error');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch club stats error:', err);
          setStatsError('Không thể tải thống kê CLB.');
          showToast('Không thể tải thống kê CLB.', 'error');
        }
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
    return () => controller.abort();
  }, [API_BASE_URL, myClub?.id, myClub?.clubId, showToast]);

  /**
   * USE EFFECT 4: POLLING REALTIME ĐỂ CẬP NHẬT TRẠNG THÁI THANH TOÁN
   * 
   * KHI NÀO CHẠY: Khi myClub.id hoặc myClub.clubId thay đổi
   * 
   * MỤC ĐÍCH: Polling mỗi 2 giây để phát hiện khi student thanh toán (isPaid: false → true)
   * 
   * FLOW:
   * 1. Gọi API GET /registrations/club/{clubId} mỗi 2 giây
   * 2. So sánh isPaid hiện tại với isPaid trước đó
   * 3. Hiển thị toast khi phát hiện thanh toán mới
   * 4. Lưu trạng thái vào localStorage để persist khi reload
   */
  useEffect(() => {
    const targetClubId = myClub?.id || myClub?.clubId;
    if (!targetClubId) return;

    const token = localStorage.getItem('authToken');
    const controller = new AbortController();

    const pollInterval = setInterval(async () => {
      try {
        const url = `https://clubmanage.azurewebsites.net/api/registrations/club/${targetClubId}`;
        
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          const mapped = (data.result || []).map(item => ({
            subscriptionId: item.subscriptionId || item.id,
            studentName: item.studentName || '',
            isPaid: item.isPaid || false
          }));
          
          // So sánh với trạng thái thanh toán trước đó
          mapped.forEach((req) => {
            const subscriptionId = req.subscriptionId;
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
            const targetClubId = myClub?.id || myClub?.clubId;
            if (targetClubId) {
              const statusMap = Object.fromEntries(previousPaymentStatusRef.current);
              localStorage.setItem(`paymentStatus_${targetClubId}`, JSON.stringify(statusMap));
            }
          } catch (err) {
            console.error('Error saving payment status to localStorage:', err);
          }
          
          // Đánh dấu đã hoàn thành lần load đầu tiên
          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
          }
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
  }, [myClub?.id, myClub?.clubId]); // Chạy khi clubId thay đổi

  /**
   * USE EFFECT 5: LOAD TRẠNG THÁI THANH TOÁN TỪ LOCALSTORAGE
   * 
   * KHI NÀO CHẠY: Khi myClub.id hoặc myClub.clubId thay đổi
   * 
   * MỤC ĐÍCH: Khôi phục trạng thái thanh toán đã lưu để tiếp tục theo dõi thay đổi
   * 
   * FLOW:
   * 1. Load Map từ localStorage (key: paymentStatus_{clubId})
   * 2. Khôi phục vào previousPaymentStatusRef
   * 3. Set isInitialLoadRef để biết đã load hay chưa
   */
  useEffect(() => {
    const targetClubId = myClub?.id || myClub?.clubId;
    if (!targetClubId) return;
    
    // Load trạng thái đã lưu từ localStorage
    try {
      const savedKey = `paymentStatus_${targetClubId}`;
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
  }, [myClub?.id, myClub?.clubId]);

  /**
   * FUNCTION: GET ALL REQUESTS
   * 
   * MỤC ĐÍCH: Lấy tất cả requests của CLB này và sắp xếp theo thứ tự ưu tiên
   * 
   * LOGIC:
   * - Filter requests theo clubId
   * - Sắp xếp: pending → approved → rejected (theo statusOrder)
   * - Nếu cùng status, sắp xếp theo ngày gửi (mới nhất trước)
   * 
   * @param {Array} requestsList - Danh sách requests (mặc định: joinRequests)
   * @returns {Array} - Danh sách requests đã được filter và sort
   */
  const getAllRequests = useCallback((requestsList = joinRequests) => {
    if (!myClub) return [];
    const requests = requestsList.filter(
      request => request.clubId === myClub.id
    );
    
    // Sắp xếp theo thứ tự: pending -> approved -> rejected
    const statusOrder = { pending: 1, approved: 2, rejected: 3 };
    return requests.sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // Nếu cùng status, sắp xếp theo ngày gửi (mới nhất trước)
      return new Date(b.requestDate) - new Date(a.requestDate);
    });
  }, [joinRequests, myClub]);

  /**
   * FUNCTION: GET PENDING REQUESTS COUNT
   * 
   * MỤC ĐÍCH: Đếm số requests đang chờ duyệt cho stats
   * 
   * @returns {number} - Số lượng requests có status = 'pending' của CLB hiện tại
   */
  const getPendingRequestsCount = useCallback(() => {
    if (!myClub) return 0;
    return joinRequests.filter(
      request => request.clubId === myClub.id && request.status === 'pending'
    ).length;
  }, [joinRequests, myClub]);

  /**
   * FUNCTION: HANDLE APPROVE (FALLBACK)
   * 
   * MỤC ĐÍCH: Handler khi duyệt request (fallback cho localStorage khi chưa có API)
   * 
   * FLOW:
   * 1. Cập nhật status của request từ 'pending' → 'approved'
   * 2. Lưu vào localStorage
   * 3. Tăng memberCount của CLB
   * 4. Hiển thị toast thành công
   * 
   * @param {number|string} requestId - ID của request cần duyệt
   */
  const handleApprove = (requestId) => {
    setJoinRequests(prevRequests => {
      const updated = prevRequests.map(request => {
        if (request.id === requestId) {
          return { ...request, status: 'approved' };
        }
        return request;
      });
      // Lưu vào localStorage ngay lập tức
      localStorage.setItem('joinRequests', JSON.stringify(updated));
      return updated;
    });
    
    if (myClub) {
      setClubs(prevClubs => prevClubs.map(club =>
        club.id === myClub.id
          ? { ...club, memberCount: club.memberCount + 1 }
          : club
      ));
    }
    
    showToast('Đã chấp nhận yêu cầu tham gia!', 'success');
  };

  /**
   * FUNCTION: HANDLE REJECT (FALLBACK)
   * 
   * MỤC ĐÍCH: Handler khi từ chối request (fallback cho localStorage khi chưa có API)
   * 
   * FLOW:
   * 1. Cập nhật status của request từ 'pending' → 'rejected'
   * 2. Lưu vào localStorage
   * 3. Hiển thị toast thông báo
   * 
   * @param {number|string} requestId - ID của request cần từ chối
   */
  const handleReject = (requestId) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      setJoinRequests(prevRequests => {
        const updated = prevRequests.map(request => {
          if (request.id === requestId) {
            return { ...request, status: 'rejected' };
          }
          return request;
        });
        localStorage.setItem('joinRequests', JSON.stringify(updated));
        return updated;
      });
      showToast('Đã từ chối yêu cầu tham gia!', 'success');
    }
  };

  /**
   * FUNCTION: HANDLE EDIT
   * 
   * MỤC ĐÍCH: Mở form chỉnh sửa thông tin CLB
   */
  const handleEdit = () => {
    setShowEditForm(true);
  };

  /**
   * FUNCTION: HANDLE FORM CHANGE
   * 
   * MỤC ĐÍCH: Xử lý khi input trong form thay đổi
   * 
   * @param {Event} e - Input change event
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'memberCount' ? parseInt(value) || 0 : value
    }));
  };

  /**
   * FUNCTION: HANDLE FORM SUBMIT
   * 
   * MỤC ĐÍCH: Xử lý khi submit form chỉnh sửa thông tin CLB
   * 
   * FLOW:
   * 1. Validate form data (description, location bắt buộc)
   * 2. Gọi API PUT /clubs/{clubId} để cập nhật
   * 3. Cập nhật UI ngay lập tức sau khi API thành công
   * 
   * @param {Event} e - Form submit event
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.location.trim()) {
      showToast('Vui lòng nhập mô tả và địa điểm.', 'error');
      return;
    }

    const token = localStorage.getItem('authToken');
    const payload = {
      logo: formData.logo || null,
      description: formData.description || '',
      location: formData.location || ''
    };

    /**
     * FUNCTION: CẬP NHẬT THÔNG TIN CLB
     * 
     * MỤC ĐÍCH: Leader cập nhật thông tin CLB (logo, description, location)
     * 
     * FLOW:
     * 1. Gọi API PUT /clubs/{clubId}
     * 2. Map response và cập nhật myClub, formData, clubs state
     * 3. Đóng form edit và hiển thị toast thành công
     */
    const doUpdate = async () => {
      try {
        // ========== API CALL: PUT /clubs/{id} - Update Club Info ==========
        // Mục đích: Leader cập nhật thông tin CLB (logo, description, location)
        // Request body: { logo, description, location }
        // Response: Updated club object
        const res = await fetch(`${API_BASE_URL}/clubs/${myClub.id || myClub.clubId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !(data.code === 1000 || data.code === 0)) {
          const message = data.message || 'Cập nhật câu lạc bộ thất bại.';
          showToast(message, 'error');
          return;
        }

        const mapped = mapApiClub({ ...(data.result || {}), ...payload });
        setMyClub(mapped);
        setFormData(mapped);
        setClubs(prev =>
          prev.map(club =>
            club.id === mapped.id || club.clubId === mapped.id ? mapped : club
          )
        );
        setShowEditForm(false);
        showToast('Cập nhật thông tin club thành công!', 'success');
      } catch (err) {
        console.error('Update club error:', err);
        showToast('Không thể cập nhật câu lạc bộ.', 'error');
      }
    };

    doUpdate();
  };

  /**
   * FUNCTION: HANDLE FORM CANCEL
   * 
   * MỤC ĐÍCH: Hủy chỉnh sửa và khôi phục formData về giá trị ban đầu
   */
  const handleFormCancel = () => {
    setFormData(myClub);
    setShowEditForm(false);
  };

  /**
   * FUNCTION: GET CLUB MEMBERS
   * 
   * MỤC ĐÍCH: Lấy danh sách thành viên của CLB hiện tại
   * 
   * @returns {Array} - Danh sách members có clubId trùng với myClub.id
   */
  const getClubMembers = useCallback(() => {
    if (!myClub) return [];
    return members.filter(member => member.clubId === myClub.id || member.clubId === myClub.clubId);
  }, [members, myClub]);

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi club? (Đánh dấu DaRoiCLB)')) {
      return;
    }

    const member = members.find(m => m.id === memberId);
    if (!member) {
      showToast('Không tìm thấy thành viên.', 'error');
      return;
    }

    const clubId = myClub?.clubId || myClub?.id;
    const userId = member.userId || member.id;

    if (!clubId || !userId) {
      showToast('Thiếu thông tin club hoặc user.', 'error');
      return;
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Vui lòng đăng nhập lại.', 'error');
      return;
    }

    /**
     * FUNCTION: XÓA THÀNH VIÊN KHỎI CLB
     * 
     * MỤC ĐÍCH: Leader xóa thành viên khỏi CLB (đánh dấu DaRoiCLB)
     * 
     * FLOW:
     * 1. Confirm với user
     * 2. Gọi API DELETE /registrations/club/{clubId}/user/{userId}
     * 3. Cập nhật UI (xóa khỏi members list, giảm memberCount)
     */
    setDeleteLoadingId(memberId);
    try {
      // ========== API CALL: DELETE /registrations/club/{clubId}/user/{userId} - Remove Member ==========
      // Mục đích: Leader xóa thành viên khỏi CLB (đánh dấu DaRoiCLB)
      // Response: Success message
      const res = await fetch(`${API_BASE_URL}/registrations/club/${clubId}/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
        throw new Error(data.message || 'Không thể xóa thành viên khỏi club.');
      }

      setMembers(members.filter(m => m.id !== memberId));
      
      if (myClub) {
        setClubs(clubs.map(club =>
          club.id === myClub.id
            ? { ...club, memberCount: Math.max(0, club.memberCount - 1) }
            : club
        ));
        setMyClub({ ...myClub, memberCount: Math.max(0, myClub.memberCount - 1) });
      }
      
      showToast('Đã xóa thành viên khỏi club (đánh dấu DaRoiCLB)!', 'success');
    } catch (err) {
      console.error('Delete member error:', err);
      showToast(err.message || 'Không thể xóa thành viên khỏi club.', 'error');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  /**
   * FUNCTION: MAP ROLE TO API FORMAT
   * 
   * MỤC ĐÍCH: Map role từ UI format (tiếng Việt) sang API format (ChuTich, PhoChuTich, etc.)
   * 
   * LOGIC:
   * - Map các format khác nhau của role (có dấu, không dấu, viết liền, có khoảng trắng)
   * - Trả về role code theo format API (ChuTich, PhoChuTich, ThuKy, ThuQuy, ThanhVien)
   * 
   * @param {string} role - Role từ UI (Chủ tịch, Phó chủ tịch, Thư ký, Thủ quỹ, Thành viên)
   * @returns {string} - Role code theo API format (ChuTich, PhoChuTich, ThuKy, ThuQuy, ThanhVien)
   */
  const mapRoleToApiFormat = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'chủ tịch' || r === 'chu tich' || r === 'chutich') return 'ChuTich';
    if (r === 'phó chủ tịch' || r === 'pho chu tich' || r === 'phochutich') return 'PhoChuTich';
    if (r === 'thư ký' || r === 'thu ky' || r === 'thuky') return 'ThuKy';
    if (r === 'thành viên' || r === 'thanh vien' || r === 'thanhvien') return 'ThanhVien';
    return 'ThanhVien'; // Default
  };

  /**
   * FUNCTION: HANDLE UPDATE MEMBER ROLE
   * 
   * MỤC ĐÍCH: Leader thay đổi vai trò của thành viên
   * 
   * FLOW:
   * 1. VALIDATE: Kiểm tra member, clubId, userId, token
   * 2. MAP ROLE: Map role từ UI format (tiếng Việt) sang API format
   * 3. CALL API: PUT /registrations/club/{clubId}/user/{userId}/role
   * 4. UPDATE UI: Cập nhật role trong members state (đã normalize về tiếng Việt)
   * 5. SHOW TOAST: Thông báo kết quả
   * 
   * @param {number|string} memberId - ID của member cần cập nhật role
   * @param {string} newRole - Role mới từ UI (Chủ tịch, Phó chủ tịch, etc.)
   */
  const handleUpdateMemberRole = async (memberId, newRole) => {
    const member = members.find(m => m.id === memberId);
    if (!member) {
      showToast('Không tìm thấy thành viên.', 'error');
      return;
    }

    const clubId = myClub?.clubId || myClub?.id;
    const userId = member.userId || member.id;

    if (!clubId || !userId) {
      showToast('Thiếu thông tin club hoặc user.', 'error');
      return;
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Vui lòng đăng nhập lại.', 'error');
      return;
    }

    // Map role từ UI (tiếng Việt) sang API format
    const apiRole = mapRoleToApiFormat(newRole);

    /**
     * FUNCTION: CẬP NHẬT VAI TRÒ THÀNH VIÊN
     * 
     * MỤC ĐÍCH: Leader thay đổi vai trò của thành viên (ChuTich, PhoChuTich, ThuKy, ThuQuy, ThanhVien)
     * 
     * FLOW:
     * 1. Map role từ UI format (tiếng Việt) sang API format
     * 2. Gọi API PUT /registrations/club/{clubId}/user/{userId}/role
     * 3. Cập nhật UI với role mới (đã normalize về tiếng Việt)
     */
    setRoleLoadingId(memberId);
    try {
      // ========== API CALL: PUT /registrations/club/{clubId}/user/{userId}/role - Update Member Role ==========
      // Mục đích: Leader thay đổi vai trò của thành viên
      // Request body: { newRole } (role code từ UI)
      // Response: Updated member object
      const res = await fetch(`${API_BASE_URL}/registrations/club/${clubId}/user/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newRole: apiRole
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
        throw new Error(data.message || 'Không thể cập nhật vai trò thành viên.');
      }

      const responseRole = data.result?.clubRole || apiRole;
      const normalizedRole = normalizeRole(responseRole);

      setMembers(members.map(m => {
        if (m.id === memberId) {
          return { ...m, role: normalizedRole, roleCode: responseRole };
        }
        return m;
      }));
      
      showToast('Đã cập nhật vai trò thành viên!', 'success');
    } catch (err) {
      console.error('Update member role error:', err);
      showToast(err.message || 'Không thể cập nhật vai trò thành viên.', 'error');
    } finally {
      setRoleLoadingId(null);
    }
  };

  /**
   * Handler khi cập nhật phí tham gia (từ ClubFeeManagement component)
   */
  const handleUpdateFee = (feeData) => {
    if (!myClub) return;
    
    const updatedClub = { 
      ...myClub, 
      participationFee: feeData.participationFee,
      membershipDuration: feeData.membershipDuration
    };
    setMyClub(updatedClub);
    setClubs(clubs.map(club =>
      club.id === myClub.id
        ? updatedClub
        : club
    ));
    showToast('Đã cập nhật phí tham gia và thời hạn thành công!', 'success');
  };

  const allRequests = useMemo(() => getAllRequests(joinRequests), [getAllRequests, joinRequests]);
  const pendingRequestsCount = useMemo(() => {
    if (clubStats?.pendingRegistrations !== undefined) {
      return clubStats.pendingRegistrations;
    }
    return getPendingRequestsCount();
  }, [clubStats?.pendingRegistrations, getPendingRequestsCount]);
  const clubMembers = useMemo(() => getClubMembers(), [getClubMembers]);

  if (clubLoading) {
    return (
      <div className="max-w-[1400px] mx-auto p-5">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang tải thông tin câu lạc bộ...</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  if (!myClub) {
    return (
      <div className="max-w-[1400px] mx-auto p-5">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {clubError || 'Bạn chưa được gán quản lý câu lạc bộ nào'}
          </h2>
          <p className="text-gray-600">Vui lòng liên hệ admin để được gán quản lý câu lạc bộ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-5">
      <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg mb-8 border border-fpt-blue/10">
        <div className="flex items-center gap-4 mb-2">
          {myClub.logo ? (
            <img
              src={myClub.logo}
              alt={myClub.name || 'Club logo'}
              className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-blue-100 text-fpt-blue flex items-center justify-center text-2xl font-bold shadow-md border-2 border-white">
              {(myClub.name || 'CLB').charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-fpt-blue m-0">👑 Trang Quản lý Club Leader</h1>
            <p className="text-gray-600 text-lg m-0 mt-1">
              Quản lý câu lạc bộ: <strong className="text-fpt-blue">{myClub.name}</strong>
              {myClub.category && (
                <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {clubCategoryLabels[myClub.category] || myClub.category}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Manage Club Tab */}
      {currentPage === 'manage' && (
        <>
          <LeaderStats
            memberCount={clubStats?.totalMembers ?? myClub.memberCount}
            pendingRequestsCount={pendingRequestsCount}
            category={myClub.category}
            location={myClub.location}
            totalRevenue={clubStats?.totalRevenue}
            unpaidCount={clubStats?.unpaidCount}
          />

          <ClubInfo
            club={myClub}
            onEdit={handleEdit}
            showEditForm={showEditForm}
            formData={formData}
            onFormChange={handleFormChange}
            onFormSubmit={handleFormSubmit}
            onFormCancel={handleFormCancel}
          />

          <div className="mt-6 mb-8 space-y-3">
            {statsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                {statsError}
              </div>
            )}
            {statsLoading ? (
              <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-3 text-gray-600">
                <div className="w-6 h-6 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full animate-spin" />
                <span>Đang tải thống kê CLB...</span>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 m-0">Danh sách chưa đóng phí</h3>
                    <p className="text-gray-500 m-0 text-sm">
                      Thành viên đã được duyệt nhưng chưa hoàn tất thanh toán
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                    {clubStats?.unpaidCount ?? 0} người
                  </span>
                </div>
                {!clubStats?.unpaidMembers || clubStats.unpaidMembers.length === 0 ? (
                  <div className="text-gray-600 text-sm">Không có thành viên chưa đóng phí.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Mã đăng ký</th>
                          <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">MSSV</th>
                          <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Họ tên</th>
                          <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Gói</th>
                          <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Giá</th>
                          <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Ngày tham gia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {clubStats.unpaidMembers.map((u) => (
                          <tr key={u.subscriptionId || `${u.studentCode}-${u.fullName}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{u.subscriptionId || '—'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{u.studentCode || '—'}</td>
                            <td className="px-4 py-3">{u.fullName || '—'}</td>
                            <td className="px-4 py-3">{u.packageName || '—'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {u.packagePrice !== undefined && u.packagePrice !== null
                                ? `${u.packagePrice.toLocaleString('vi-VN')} VNĐ`
                                : '—'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {u.joinDate ? new Date(u.joinDate).toLocaleDateString('vi-VN') : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

        </>
      )}

      {/* Join Requests Tab */}
      {currentPage === 'requests' && (
        <JoinRequestsList
          requests={allRequests}
          clubId={myClub?.id || myClub?.clubId}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Members Management Tab */}
      {currentPage === 'members' && (
        <MembersList
          members={clubMembers}
          club={myClub}
          onUpdateRole={handleUpdateMemberRole}
          onDeleteMember={handleDeleteMember}
          deleteLoadingId={deleteLoadingId}
          roleLoadingId={roleLoadingId}
        />
      )}

      {/* Fee Management Tab */}
      {currentPage === 'fee' && (
        <ClubFeeManagement
          club={myClub}
          onUpdate={handleUpdateFee}
        />
      )}
    </div>
  );
};

export default ClubLeaderDashboard;

