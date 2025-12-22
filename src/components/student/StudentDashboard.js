/**
 * StudentDashboard Component
 * 
 * Component dashboard chính cho student role:
 * - Hiển thị danh sách clubs để student có thể tham gia
 * - Quản lý join requests (đơn đăng ký tham gia CLB)
 * - Đăng ký mở CLB mới
 * - Real-time polling để cập nhật trạng thái đơn đăng ký
 * 
 * @param {Object} props
 * @param {Array} props.clubs - Danh sách clubs
 * @param {string} props.currentPage - Trang hiện tại ('clubs', 'my-requests', etc.)
 * @param {Function} props.setClubs - Callback để update clubs state
 */

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../shared/Toast';
import StudentClubList from './StudentClubList';
import JoinRequestModal from './JoinRequestModal';
import ClubDetailsModal from './ClubDetailsModal';
import RegisterClubModal from './RegisterClubModal';

const StudentDashboard = ({ clubs, currentPage, setClubs }) => {
  const { showToast } = useToast();
  const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';
  const [joinRequests, setJoinRequests] = useState([]);
  // Lưu trạng thái trước đó để phát hiện thay đổi
  const previousStatusesRef = useRef(new Map());
  const isInitialLoadRef = useRef(true);
  const [payments, setPayments] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRegisterClubModal, setShowRegisterClubModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubRequests, setClubRequests] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  // Lưu trạng thái club requests trước đó để phát hiện thay đổi
  const previousClubRequestStatusesRef = useRef(new Map());
  // Flag để đánh dấu đã load dữ liệu lần đầu (không hiển thị toast trong lần đầu)
  const isInitialClubRequestLoadRef = useRef(true);

  /**
   * Helper: normalize registration object từ API sang UI format
   */
  const normalizeRegistration = (reg) => ({
    id: reg.subscriptionId || Date.now(),
    subscriptionId: reg.subscriptionId,
    clubId: typeof reg.clubId === 'string' ? parseInt(reg.clubId, 10) : reg.clubId,
    clubName: reg.clubName,
    clubLogo: reg.clubLogo,
    studentEmail: reg.studentEmail,
    studentName: reg.studentName,
    studentCode: reg.studentCode,
    userId: reg.userId,
    phone: '', // API không trả về phone
    studentId: reg.studentCode,
    major: '', // API không trả về major
    reason: '', // API không trả về reason
    status: reg.status || 'ChoDuyet',
    requestDate: reg.createdAt ? reg.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    createdAt: reg.createdAt,
    message: `Yêu cầu tham gia ${reg.clubName}`,
    packageId: reg.packageId,
    packageName: reg.packageName,
    price: reg.price,
    term: reg.term,
    isPaid: reg.isPaid || false,
    paymentMethod: reg.paymentMethod,
    clubRole: reg.clubRole || 'ThanhVien',
    approverName: reg.approverName,
    paymentDate: reg.paymentDate,
    startDate: reg.startDate,
    endDate: reg.endDate,
    joinDate: reg.joinDate
  });

  /**
   * USE EFFECT 1: FETCH MY REGISTRATIONS
   * 
   * KHI NÀO CHẠY: Khi component mount lần đầu
   * 
   * MỤC ĐÍCH: Lấy danh sách đơn đăng ký tham gia CLB của student hiện tại
   * 
   * FLOW:
   * 1. Gọi API GET /registers/my-registrations
   * 2. Map dữ liệu từ API format sang UI format
   * 3. Lưu vào joinRequests state
   * 4. Fallback về localStorage nếu API fail hoặc không có token
   */
  useEffect(() => {
    const fetchMyRegistrations = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        // Fallback to localStorage if no token
        const savedRequests = localStorage.getItem('joinRequests');
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (savedRequests) {
          try {
            const parsed = JSON.parse(savedRequests);
            const filtered = currentUser?.email
              ? parsed.filter((r) => r.studentEmail === currentUser.email)
              : parsed;
            setJoinRequests(filtered);
          } catch (e) {
            console.error('Error parsing joinRequests:', e);
          }
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/registers/my-registrations`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data && (data.code === 1000 || data.code === 0)) {
          // Map API response to local format
          const registrations = (data.result || []).map(normalizeRegistration);

          setJoinRequests(registrations);
          console.log('Loaded registrations from API:', registrations);
        } else {
          // Fallback to localStorage on API error
          const savedRequests = localStorage.getItem('joinRequests');
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (savedRequests) {
            try {
              const parsed = JSON.parse(savedRequests);
              const filtered = currentUser?.email
                ? parsed.filter((r) => r.studentEmail === currentUser.email)
                : parsed;
              setJoinRequests(filtered);
            } catch (e) {
              console.error('Error parsing joinRequests:', e);
            }
          }
        }
      } catch (error) {
        console.error('Fetch my registrations error:', error);
        // Fallback to localStorage on error
        const savedRequests = localStorage.getItem('joinRequests');
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (savedRequests) {
          try {
            const parsed = JSON.parse(savedRequests);
            const filtered = currentUser?.email
              ? parsed.filter((r) => r.studentEmail === currentUser.email)
              : parsed;
            setJoinRequests(filtered);
          } catch (e) {
            console.error('Error parsing joinRequests:', e);
          }
        }
      }
    };

    fetchMyRegistrations();
  }, []);

  /**
   * USE EFFECT 2: LOAD TRẠNG THÁI ĐĂNG KÝ TỪ LOCALSTORAGE
   * 
   * KHI NÀO CHẠY: Khi component mount lần đầu
   * 
   * MỤC ĐÍCH: Khôi phục trạng thái đăng ký đã lưu để tiếp tục theo dõi thay đổi
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('registrationStatus');
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
   * USE EFFECT 3: POLLING REALTIME ĐỂ CẬP NHẬT TRẠNG THÁI ĐĂNG KÝ
   * 
   * KHI NÀO CHẠY: Sau khi component mount
   * 
   * MỤC ĐÍCH: Polling mỗi 2 giây để phát hiện khi đơn đăng ký được duyệt (status: ChoDuyet → DaDuyet)
   * 
   * FLOW:
   * 1. Gọi API GET /registers/my-registrations mỗi 2 giây
   * 2. So sánh status hiện tại với status trước đó
   * 3. Hiển thị toast khi phát hiện đơn được duyệt
   * 4. Lưu trạng thái vào localStorage để persist khi reload
   */
  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return;

    const pollInterval = setInterval(async () => {
      try {
        // ========== API CALL: GET /registers/my-registrations - Polling ==========
        // Mục đích: Polling để kiểm tra thay đổi trạng thái đăng ký realtime (mỗi 2 giây)
        // Response: Array of registration objects
        const response = await fetch(`${API_BASE_URL}/registers/my-registrations`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => null);
        
        if (response.ok && data && data.code === 1000) {
          const raw = data.result || [];
          const mapped = raw.map(normalizeRegistration);

          // So sánh với trạng thái trước đó
          mapped.forEach((reg) => {
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
          
          // Cập nhật joinRequests UI để phản ánh status mới
          setJoinRequests(mapped);
          localStorage.setItem('joinRequests', JSON.stringify(mapped));

          // Lưu trạng thái vào localStorage để giữ lại khi reload
          try {
            const statusMap = Object.fromEntries(previousStatusesRef.current);
            localStorage.setItem('registrationStatus', JSON.stringify(statusMap));
          } catch (err) {
            console.error('Error saving registration status to localStorage:', err);
          }
          
          // Đánh dấu đã hoàn thành lần load đầu tiên
          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
          }
        }
      } catch (err) {
        console.error('Polling registration status error:', err);
        // Không hiển thị lỗi khi polling để tránh spam
      }
    }, 2000); // Poll mỗi 2 giây để real-time hơn

    return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi mount

  /**
   * USE EFFECT 4: LOAD DỮ LIỆU TỪ LOCALSTORAGE
   * 
   * KHI NÀO CHẠY: Khi component mount lần đầu
   * 
   * MỤC ĐÍCH: Khôi phục payments và clubRequests từ localStorage
   */
  useEffect(() => {
    const savedPayments = localStorage.getItem('payments');
    const savedClubRequests = localStorage.getItem('clubRequests');
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (savedPayments) {
      try {
        const parsed = JSON.parse(savedPayments);
        const filtered = currentUser?.email
          ? parsed.filter((p) => p.studentEmail === currentUser.email)
          : parsed;
        setPayments(filtered);
      } catch (e) {
        console.error('Error parsing payments:', e);
      }
    }
    if (savedClubRequests) {
      try {
        setClubRequests(JSON.parse(savedClubRequests));
      } catch (e) {
        console.error('Error parsing clubRequests:', e);
      }
    }
  }, []);

  /**
   * USE EFFECT 4.1: SAVE JOIN REQUESTS TO LOCALSTORAGE
   * 
   * KHI NÀO CHẠY: Khi joinRequests state thay đổi
   * 
   * MỤC ĐÍCH: Lưu joinRequests vào localStorage để persist khi reload
   * 
   * DEPENDENCIES: [joinRequests]
   */
  useEffect(() => {
    localStorage.setItem('joinRequests', JSON.stringify(joinRequests));
  }, [joinRequests]);

  /**
   * USE EFFECT 4.2: SAVE PAYMENTS TO LOCALSTORAGE
   * 
   * KHI NÀO CHẠY: Khi payments state thay đổi
   * 
   * MỤC ĐÍCH: Lưu payments vào localStorage để persist khi reload
   * 
   * DEPENDENCIES: [payments]
   */
  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  /**
   * USE EFFECT 4.3: SAVE CLUB REQUESTS TO LOCALSTORAGE
   * 
   * KHI NÀO CHẠY: Khi clubRequests state thay đổi
   * 
   * MỤC ĐÍCH: Lưu clubRequests vào localStorage để persist khi reload
   * 
   * DEPENDENCIES: [clubRequests]
   */
  useEffect(() => {
    localStorage.setItem('clubRequests', JSON.stringify(clubRequests));
  }, [clubRequests]);

  /**
   * USE EFFECT 4.4: LOAD CLUB REQUEST STATUS FROM LOCALSTORAGE
   * 
   * KHI NÀO CHẠY: Khi component mount
   * 
   * MỤC ĐÍCH: Load trạng thái club requests đã lưu từ localStorage để tránh hiển thị toast khi reload trang
   * 
   * FLOW:
   * 1. Load từ localStorage key 'clubRequestStatus'
   * 2. Khôi phục vào previousClubRequestStatusesRef (Map)
   * 3. Set isInitialClubRequestLoadRef = false nếu có dữ liệu đã lưu
   * 
   * DEPENDENCIES: [] (chỉ chạy một lần)
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('clubRequestStatus');
      if (saved) {
        const savedMap = JSON.parse(saved);
        previousClubRequestStatusesRef.current.clear();
        Object.entries(savedMap).forEach(([key, value]) => {
          previousClubRequestStatusesRef.current.set(key, value);
        });
        // Nếu đã có dữ liệu lưu, không phải lần đầu load
        isInitialClubRequestLoadRef.current = false;
      }
    } catch (err) {
      console.error('Error loading club request status from localStorage:', err);
    }
  }, []);

  /**
   * USE EFFECT 4.5: POLLING CLUB REQUEST STATUS
   * 
   * KHI NÀO CHẠY: Khi component mount, polling mỗi 5 giây
   * 
   * MỤC ĐÍCH: Polling để phát hiện khi đơn mở CLB được admin duyệt
   * 
   * FLOW:
   * 1. Gọi API GET /club-requests để lấy danh sách đơn mở CLB của student
   * 2. So sánh status hiện tại với previousClubRequestStatusesRef
   * 3. Nếu phát hiện thay đổi từ DangCho/pending → ChapThuan/approved:
   *    - Hiển thị toast 10 giây: "🎉 Đơn mở CLB {name} đã được duyệt! Vui lòng đăng xuất và đăng nhập lại để cập nhật tài khoản."
   * 4. Lưu trạng thái vào previousClubRequestStatusesRef và localStorage
   * 
   * DEPENDENCIES: [] (chỉ chạy một lần khi mount)
   */
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return;

    const pollInterval = setInterval(async () => {
      try {
        // ========== API CALL: GET /club-requests - Get My Club Requests ==========
        // Mục đích: Lấy danh sách đơn mở CLB của student để kiểm tra trạng thái
        // Response: Array of club request objects với status (DangCho, ChapThuan, TuChoi)
        const response = await fetch(`${API_BASE_URL}/club-requests`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => null);
        
        if (!isMounted) return;
        
        if (response.ok && data && (data.code === 1000 || data.code === 0)) {
          const raw = data.result || [];
          
          // Lấy thông tin user hiện tại để filter chỉ club requests của student này
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const currentUserEmail = currentUser?.email || currentUser?.studentEmail || '';
          
          // Filter chỉ club requests của student hiện tại
          const myClubRequests = raw.filter(req => {
            if (!currentUserEmail) return true; // Nếu không có email, lấy tất cả (fallback)
            const reqEmail = req.creatorEmail || req.applicantEmail || '';
            return reqEmail.toLowerCase() === currentUserEmail.toLowerCase();
          });
          
          // So sánh với trạng thái trước đó và hiển thị toast
          myClubRequests.forEach((req) => {
            const requestId = req.requestId || req.id;
            const currentStatus = (req.status || '').toLowerCase();
            const previousStatus = previousClubRequestStatusesRef.current.has(requestId)
              ? (previousClubRequestStatusesRef.current.get(requestId) || '').toLowerCase()
              : null;
            
            // Phát hiện thay đổi từ DangCho/pending → ChapThuan/approved
            const isApproved = currentStatus === 'chapthuan' || currentStatus === 'approved' || currentStatus === 'chấp thuận';
            const wasPending = previousStatus === 'dangcho' || previousStatus === 'pending' || previousStatus === 'đang chờ';
            
            // Chỉ hiển thị toast nếu:
            // 1. Không phải lần đầu load (isInitialClubRequestLoadRef.current === false)
            // 2. Có thay đổi từ pending → approved
            if (!isInitialClubRequestLoadRef.current && isApproved && wasPending && previousStatus !== null) {
              const clubName = req.proposedName || req.name || 'CLB';
              showToast(
                `🎉 Đơn mở CLB "${clubName}" đã được duyệt! Vui lòng đăng xuất và đăng nhập lại để cập nhật tài khoản.`,
                'success',
                10000 // Hiển thị 10 giây
              );
            }
            
            // Lưu trạng thái hiện tại
            previousClubRequestStatusesRef.current.set(requestId, currentStatus);
          });
          
          // Lưu trạng thái vào localStorage
          try {
            const statusMap = Object.fromEntries(previousClubRequestStatusesRef.current);
            localStorage.setItem('clubRequestStatus', JSON.stringify(statusMap));
          } catch (err) {
            console.error('Error saving club request status to localStorage:', err);
          }
          
          // Đánh dấu đã hoàn thành lần load đầu tiên
          if (isInitialClubRequestLoadRef.current) {
            isInitialClubRequestLoadRef.current = false;
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Polling club request status error:', err);
        }
      }
    }, 5000); // Poll mỗi 5 giây

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi mount

  /**
   * USE EFFECT 5: FETCH DANH SÁCH CLUBS
   * 
   * KHI NÀO CHẠY: Khi component mount lần đầu
   * 
   * MỤC ĐÍCH: Lấy danh sách tất cả CLB để hiển thị cho sinh viên
   * 
   * FLOW:
   * 1. Gọi API GET /clubs để lấy danh sách CLB
   * 2. Normalize dữ liệu từ API format sang UI format
   * 3. Fetch packages cho từng CLB để lấy participationFee chính xác
   * 4. Cập nhật clubs state với dữ liệu đầy đủ
   * 5. Retry nếu network error (tối đa 2 lần)
   */
  useEffect(() => {
    const normalizeClub = (item) => ({
      id: item.id || item.clubId || item.requestId || Date.now(),
      clubId: item.clubId || item.id,
      name: item.name || item.clubName || item.proposedName || 'CLB chưa đặt tên',
      description: item.description || item.purpose || 'Chưa có mô tả',
      category: item.category || item.type || 'Khác',
      president: item.founderName || item.president || item.chairman || item.leaderName || item.adminName || 'Chưa cập nhật',
      founderName: item.founderName || item.president || item.chairman || item.leaderName || item.adminName || 'Chưa cập nhật',
      memberCount: item.totalMembers !== undefined && item.totalMembers !== null ? item.totalMembers : (item.memberCount !== undefined && item.memberCount !== null ? item.memberCount : (item.membersCount !== undefined && item.membersCount !== null ? item.membersCount : (item.memberTotal !== undefined && item.memberTotal !== null ? item.memberTotal : 0))),
      status: item.statusText || item.status || (item.isActive !== false ? 'Hoạt động' : 'Tạm dừng'),
      email: item.email || item.contactEmail || item.creatorEmail || '',
      location: item.location || item.address || 'Chưa cập nhật',
      participationFee: item.participationFee || item.defaultMembershipFee || item.fee || 0,
      membershipDuration: item.membershipDuration || item.durationMonths || 6,
      establishedDate: item.establishedDate || item.foundedDate,
      isActive: item.isActive !== undefined ? item.isActive : true,
      logo: item.logo,
      activityTime: item.activityTime
    });

    // Fetch packages for clubs to get correct participation fee
    const fetchPackagesForClubs = async (clubsList) => {
      if (!clubsList || clubsList.length === 0) return;
      
      try {
        // Fetch packages for all clubs in parallel
        const packagePromises = clubsList.map(async (club) => {
          const clubId = club.clubId || club.id;
          if (!clubId) return null;
          
          try {
            // ========== API CALL: GET /packages/club/{clubId} - Get Club Packages ==========
            // Mục đích: Lấy danh sách gói membership của CLB để hiển thị giá và thời hạn
            // Response: Array of package objects
            const res = await fetch(`${API_BASE_URL}/packages/club/${clubId}`, {
              headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await res.json().catch(() => ({}));
            
            if (res.ok && (data.code === 1000 || data.code === 0)) {
              const packages = Array.isArray(data.result) ? data.result : [];
              // Get first active package, or first package if no active
              const activePackage = packages.find(pkg => pkg.isActive !== false) || packages[0];
              return { clubId, package: activePackage };
            }
          } catch (err) {
            console.warn(`Failed to fetch packages for club ${clubId}:`, err);
          }
          return null;
        });
        
        const packageResults = await Promise.all(packagePromises);
        
        // Update clubs with package data
        // Sử dụng clubsList thay vì prevClubs để đảm bảo giữ nguyên memberCount từ lần fetch đầu
        setClubs(prevClubs => {
          // Tạo map từ clubsList để đảm bảo có memberCount đúng
          const clubsMap = new Map(clubsList.map(c => [c.clubId || c.id, c]));
          
          return prevClubs.map(club => {
            const originalClub = clubsMap.get(club.clubId || club.id) || club;
            const packageData = packageResults.find(pr => pr && (pr.clubId === club.clubId || pr.clubId === club.id));
            if (packageData && packageData.package) {
              const pkg = packageData.package;
              return {
                ...originalClub, // Sử dụng originalClub để đảm bảo có memberCount đúng
                participationFee: pkg.price !== undefined ? pkg.price : originalClub.participationFee,
                membershipDuration: pkg.term || originalClub.membershipDuration,
                packageTerm: pkg.term // Store term separately for display
              };
            }
            return originalClub; // Trả về originalClub để đảm bảo có memberCount đúng
          });
        });
      } catch (error) {
        console.error('Error fetching packages for clubs:', error);
      }
    };

    const fetchClubs = async (retryCount = 0) => {
      const MAX_RETRIES = 2;
      setLoadingClubs(true);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        // ========== API CALL: GET /clubs - List All Clubs ==========
        // Mục đích: Lấy danh sách tất cả CLB để hiển thị cho sinh viên
        // Response: Array of club objects
        const response = await fetch(`${API_BASE_URL}/clubs`, {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          const message = data.message || data.error || 'Không thể tải danh sách CLB.';
          throw new Error(message);
        }
        
        const list = Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];
        const normalizedClubs = list.map(normalizeClub);
        console.log('Fetched clubs with memberCount:', normalizedClubs.map(c => ({ name: c.name, memberCount: c.memberCount, totalMembers: list.find(l => (l.clubId || l.id) === c.clubId)?.totalMembers })));
        
        // Set clubs trước
        setClubs(normalizedClubs);
        
        // Fetch packages for each club to get correct participation fee
        // Truyền normalizedClubs để đảm bảo có memberCount đúng
        fetchPackagesForClubs(normalizedClubs);
      } catch (error) {
        // Retry on network errors
        if (error.name === 'AbortError' || error.message.includes('Failed to fetch') || error.message.includes('ERR_NETWORK')) {
          if (retryCount < MAX_RETRIES) {
            console.warn(`Fetch clubs failed, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
            return fetchClubs(retryCount + 1);
          }
        }
        
        console.error('Fetch clubs error:', error);
        
        // Only show error toast if not a retry attempt or if all retries failed
        if (retryCount >= MAX_RETRIES) {
          const errorMessage = error.name === 'AbortError' 
            ? 'Yêu cầu quá thời gian chờ. Vui lòng kiểm tra kết nối mạng và thử lại.'
            : error.message || 'Không thể tải danh sách CLB. Vui lòng kiểm tra kết nối mạng và thử lại.';
          showToast(errorMessage, 'error');
        }
      } finally {
        setLoadingClubs(false);
      }
    };

    fetchClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi component mount

  /**
   * FUNCTION: HANDLE JOIN REQUEST
   * 
   * MỤC ĐÍCH: Mở modal JoinRequestModal khi student click nút "Tham gia" trên CLB
   * 
   * @param {Object} club - Club object mà student muốn tham gia
   */
  const handleJoinRequest = (club) => {
    setSelectedClub(club);
    setShowJoinModal(true);
  };

  /**
   * FUNCTION: GỬI YÊU CẦU THAM GIA CLB
   * 
   * MỤC ĐÍCH: Student gửi yêu cầu tham gia CLB với package đã chọn
   * 
   * FLOW:
   * 1. Validate token, club, packageId
   * 2. Gọi API POST /registers với packageId và joinReason
   * 3. Cập nhật joinRequests state
   * 4. Refresh danh sách đăng ký từ API để đảm bảo sync
   * 
   * @param {Object} formData - Form data từ JoinRequestModal (packageId, reason, phone, etc.)
   */
  const submitJoinRequest = async (formData) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Bạn cần đăng nhập trước khi đăng ký tham gia CLB.', 'error');
      return;
    }

    if (!selectedClub || !(selectedClub.id || selectedClub.clubId)) {
      showToast('Thông tin câu lạc bộ không hợp lệ.', 'error');
      return;
    }

    if (!formData.packageId) {
      showToast('Vui lòng chọn gói thành viên.', 'error');
      return;
    }

    // Chuẩn bị payload theo đúng format API yêu cầu
    // API cần packageId và joinReason trong body
    const clubId = selectedClub.clubId || selectedClub.id;
    const payload = {
      clubId: typeof clubId === 'string' ? parseInt(clubId, 10) : clubId,
      packageId: parseInt(formData.packageId, 10),
      joinReason: formData.reason.trim(),
      // Gửi kèm thông tin cơ bản để backend không bị thiếu trường
      phone: formData.phone,
      studentId: formData.studentId,
      major: formData.major,
      fullName: formData.fullName
    };

    // ========== API CALL: POST /registers - Create Join Request ==========
    // Mục đích: Gửi yêu cầu tham gia CLB với package đã chọn
    // Request body: { clubId, packageId, joinReason, fullName, phone, studentId, major }
    // Response: Registration object với subscriptionId, status, etc.
    const url = `${API_BASE_URL}/registers`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      // Kiểm tra response code: API trả về code 1000 khi thành công
      if (!response.ok || !data || data.code !== 1000) {
        const message = data?.message || 
          (response.status === 401 
            ? 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.' 
            : `Đăng ký thất bại (mã ${data?.code || response.status}). Vui lòng thử lại.`);
        console.error('registers POST error:', data || response.status);
        showToast(message, 'error');
        return;
      }

      // Map response từ API về format local để hiển thị
      const apiResult = data.result;
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Normalize clubId to ensure consistent type
      const normalizedClubId = typeof apiResult.clubId === 'string' 
        ? parseInt(apiResult.clubId, 10) 
        : apiResult.clubId;
      
      const newRequest = {
        id: apiResult.subscriptionId || Date.now(),
        subscriptionId: apiResult.subscriptionId,
        clubId: normalizedClubId, // Ensure clubId is a number
        clubName: apiResult.clubName,
        clubLogo: apiResult.clubLogo,
        studentEmail: apiResult.studentEmail || user.email,
        studentName: apiResult.studentName || user.name,
        studentCode: apiResult.studentCode,
        userId: apiResult.userId,
        phone: formData.phone,
        studentId: apiResult.studentCode || formData.studentId,
        major: formData.major,
        reason: formData.reason,
        status: apiResult.status || 'ChoDuyet', // ChoDuyet, DaDuyet, TuChoi
        requestDate: apiResult.createdAt ? apiResult.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: apiResult.createdAt,
        message: `Yêu cầu tham gia ${apiResult.clubName}`,
        packageId: apiResult.packageId,
        packageName: apiResult.packageName,
        price: apiResult.price,
        term: apiResult.term,
        isPaid: apiResult.isPaid || false,
        paymentMethod: apiResult.paymentMethod,
        clubRole: apiResult.clubRole || 'ThanhVien',
        approverName: apiResult.approverName,
        paymentDate: apiResult.paymentDate,
        startDate: apiResult.startDate,
        endDate: apiResult.endDate,
        joinDate: apiResult.joinDate
      };

      // Cập nhật state - sử dụng functional update để đảm bảo có state mới nhất
      setJoinRequests(prevRequests => {
        // Normalize clubId for comparison
        const normalizedRequestClubId = typeof normalizedClubId === 'string' 
          ? parseInt(normalizedClubId, 10) 
          : normalizedClubId;
        
        // Kiểm tra xem đã có request cho club này chưa (tránh duplicate)
        const existingIndex = prevRequests.findIndex(r => {
          const rClubId = typeof r.clubId === 'string' ? parseInt(r.clubId, 10) : r.clubId;
          return rClubId === normalizedRequestClubId || 
                 String(r.clubId) === String(normalizedClubId) ||
                 r.clubId == normalizedClubId;
        });
        
        if (existingIndex >= 0) {
          // Update existing request
          const updated = [...prevRequests];
          updated[existingIndex] = newRequest;
          console.log('Updated existing join request:', newRequest);
          return updated;
        } else {
          // Add new request
          console.log('Added new join request:', newRequest);
          return [...prevRequests, newRequest];
        }
      });
      
      setShowJoinModal(false);
      setSelectedClub(null);
      
      // ========== API CALL: GET /registers/my-registrations - Refresh After Submit ==========
      // Mục đích: Refresh danh sách đăng ký sau khi submit thành công để đảm bảo sync
      // Response: Array of registration objects
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/registers/my-registrations`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const refreshData = await refreshResponse.json().catch(() => ({}));
        if (refreshResponse.ok && refreshData && (refreshData.code === 1000 || refreshData.code === 0)) {
          const registrations = (refreshData.result || []).map(reg => ({
            id: reg.subscriptionId || Date.now(),
            subscriptionId: reg.subscriptionId,
            clubId: typeof reg.clubId === 'string' ? parseInt(reg.clubId, 10) : reg.clubId,
            clubName: reg.clubName,
            clubLogo: reg.clubLogo,
            studentEmail: reg.studentEmail,
            studentName: reg.studentName,
            studentCode: reg.studentCode,
            userId: reg.userId,
            phone: '',
            studentId: reg.studentCode,
            major: '',
            reason: '',
            status: reg.status || 'ChoDuyet',
            requestDate: reg.createdAt ? reg.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            createdAt: reg.createdAt,
            message: `Yêu cầu tham gia ${reg.clubName}`,
            packageId: reg.packageId,
            packageName: reg.packageName,
            price: reg.price,
            term: reg.term,
            isPaid: reg.isPaid || false,
            paymentMethod: reg.paymentMethod,
            clubRole: reg.clubRole || 'ThanhVien',
            approverName: reg.approverName,
            paymentDate: reg.paymentDate,
            startDate: reg.startDate,
            endDate: reg.endDate,
            joinDate: reg.joinDate
          }));
          setJoinRequests(registrations);
          console.log('Refreshed registrations from API after submit');
        }
      } catch (refreshError) {
        console.error('Error refreshing registrations:', refreshError);
        // Continue even if refresh fails, we already updated state
      }
      
      // Hiển thị thông báo từ API
      const successMessage = data.message || 'Đăng ký thành công! Vui lòng chờ Leader CLB duyệt.';
      showToast(successMessage, 'success');
    } catch (error) {
      console.error('Submit join request exception:', error);
      showToast('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.', 'error');
    }
  };

  /**
   * FUNCTION: CLOSE DETAILS MODAL
   * 
   * MỤC ĐÍCH: Đóng modal chi tiết CLB
   * 
   * @param {boolean} keepSelected - Nếu true, giữ lại selectedClub (để có thể mở lại modal)
   */
  const closeDetailsModal = (keepSelected = false) => {
    setShowDetailsModal(false);
    if (!keepSelected) {
      setSelectedClub(null);
    }
  };

  /**
   * FUNCTION: HANDLE VIEW DETAILS
   * 
   * MỤC ĐÍCH: Mở modal ClubDetailsModal khi student click xem chi tiết CLB
   * 
   * @param {Object} club - Club object cần xem chi tiết
   */
  const handleViewDetails = (club) => {
    setSelectedClub(club);
    setShowDetailsModal(true);
  };

  /**
   * FUNCTION: GỬI YÊU CẦU ĐĂNG KÝ MỞ CLB MỚI
   * 
   * MỤC ĐÍCH: Student gửi yêu cầu đăng ký mở CLB mới
   * 
   * FLOW:
   * 1. Validate token
   * 2. Gọi API POST /club-requests với thông tin CLB
   * 3. Cập nhật clubRequests state
   * 4. Đóng modal và hiển thị toast thành công
   * 
   * @param {Object} clubData - Dữ liệu CLB từ RegisterClubModal (name, category, purpose, etc.)
   */
  const submitClubRequest = async (clubData) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Bạn cần đăng nhập trước khi gửi yêu cầu mở CLB.', 'error');
      return;
    }

    // Chuẩn bị payload theo đúng format API yêu cầu
    const payload = {
      proposedName: clubData.name.trim(),
      category: clubData.category || 'HocThuat', // HocThuat, TheThao, NgheThuat, TinhNguyen, Khac
      purpose: clubData.goals?.trim() || clubData.description?.trim() || '',
      description: clubData.description?.trim() || '',
      location: clubData.location?.trim() || '',
      email: clubData.email?.trim() || '',
      defaultMembershipFee: clubData.participationFee ? parseFloat(clubData.participationFee) : 0
    };

    try {
      // ========== API CALL: POST /club-requests - Create Club Request ==========
      // Mục đích: Gửi yêu cầu đăng ký mở CLB mới
      // Request body: { proposedName, purpose, category, location, email, defaultMembershipFee }
      // Response: Club request object với requestId, status
      const response = await fetch(`${API_BASE_URL}/club-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      // Kiểm tra response code: API này trả về code 1000 khi thành công
      if (!response.ok || !data || data.code !== 1000) {
        const message = data?.message || 
          (response.status === 401 
            ? 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.' 
            : `Gửi yêu cầu thất bại (mã ${data?.code || response.status}). Vui lòng thử lại.`);
        console.error('club-requests POST error:', data || response.status);
        showToast(message, 'error');
        return;
      }

      // Map response từ API về format local
      const apiResult = data.result;
      const newRequest = {
        id: apiResult.requestId || Date.now(),
        name: apiResult.proposedName,
        description: apiResult.purpose || apiResult.description || '',
        category: apiResult.category,
        location: payload.location,
        email: payload.email,
        participationFee: payload.defaultMembershipFee,
        goals: apiResult.purpose,
        status: apiResult.status || 'DangCho', // DangCho, DaDuyet, TuChoi
        requestDate: apiResult.createdAt ? apiResult.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        applicantEmail: apiResult.creatorName || payload.email,
        requestId: apiResult.requestId,
        creatorId: apiResult.creatorId,
        creatorName: apiResult.creatorName,
        creatorStudentCode: apiResult.creatorStudentCode
      };

      // Cập nhật state
      setClubRequests(prev => [...prev, newRequest]);
      setShowRegisterClubModal(false);
      showToast('Đã gửi yêu cầu đăng ký mở câu lạc bộ thành công! Yêu cầu của bạn đang chờ được duyệt.', 'success');
    } catch (error) {
      console.error('Submit club request exception:', error);
      showToast('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.', 'error');
    }
  };

  /**
   * FUNCTION: GET REQUEST STATUS
   * 
   * MỤC ĐÍCH: Lấy trạng thái đơn đăng ký của CLB (pending, approved, rejected, left)
   * 
   * LOGIC:
   * - Tìm request trong joinRequests có clubId trùng với clubId truyền vào
   * - Map status từ API format (ChoDuyet, DaDuyet, TuChoi, DaRoiCLB) sang UI format (pending, approved, rejected, left)
   * - Normalize clubId để so sánh (xử lý cả number và string)
   * 
   * @param {number|string} clubId - ID của CLB cần kiểm tra
   * @returns {string|null} - Status (pending, approved, rejected, left) hoặc null nếu chưa có request
   */
  const getRequestStatus = (clubId) => {
    if (!clubId || joinRequests.length === 0) {
      return null;
    }
    
    // Normalize clubId to number for comparison
    const normalizedClubId = typeof clubId === 'string' ? parseInt(clubId, 10) : clubId;
    
    // Skip if normalization failed
    if (isNaN(normalizedClubId) && isNaN(clubId)) {
      return null;
    }
    
    const request = joinRequests.find(r => {
      // Try to match by clubId (could be number or string)
      const requestClubId = r.clubId;
      if (!requestClubId && requestClubId !== 0) return false;
      
      // Normalize request clubId
      const normalizedRequestClubId = typeof requestClubId === 'string' 
        ? parseInt(requestClubId, 10) 
        : requestClubId;
      
      // Compare normalized values (handle NaN cases)
      if (!isNaN(normalizedRequestClubId) && !isNaN(normalizedClubId)) {
        return normalizedRequestClubId === normalizedClubId;
      }
      
      // Fallback to string comparison
      return String(requestClubId) === String(clubId) || requestClubId == clubId;
    });
    
    if (!request) {
      return null;
    }
    
    // Map API status to local status for UI
    const apiStatus = request.status;
    if (!apiStatus) return null;
    
    // Normalize status for flexible matching (case-insensitive, handles DaRoiCLB)
    const normalized = apiStatus.toString().trim().toLowerCase();
    const statusMap = {
      'choduyet': 'pending',
      'pending': 'pending',
      'daduyet': 'approved',
      'approved': 'approved',
      'tuchoi': 'rejected',
      'rejected': 'rejected',
      'hoatdong': 'active',
      'active': 'active',
      'hethạn': 'expired',
      'hethan': 'expired',
      'expired': 'expired',
      // Left / cancelled variants
      'daroi': 'left',
      'daroiclb': 'left',
      'roi': 'left',
      'left': 'left',
      'leave': 'left',
      'leaved': 'left',
      'quit': 'left',
      'canceled': 'left',
      'cancelled': 'left',
      'dahuy': 'left',
      'huy': 'left',
      'daroiclub': 'left'
    };
    
    // Return mapped status if available
    if (statusMap[normalized]) {
      return statusMap[normalized];
    }
    
    // Fallback to original status if no mapping found
    return apiStatus;
  };

  /**
   * FUNCTION: HAS PAYMENT
   * 
   * MỤC ĐÍCH: Kiểm tra xem đã thanh toán cho CLB này chưa
   * 
   * @param {number|string} clubId - ID của CLB cần kiểm tra
   * @returns {boolean} - true nếu đã có payment cho CLB này
   */
  const hasPayment = (clubId) => {
    return payments.some(p => p.clubId === clubId);
  };

  /**
   * FUNCTION: GET MY REQUESTS
   * 
   * MỤC ĐÍCH: Lấy danh sách đơn đăng ký của student hiện tại (filter theo email)
   * 
   * @returns {Array} - Danh sách requests có studentEmail trùng với user.email
   */
  const getMyRequests = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return joinRequests.filter(r => r.studentEmail === user.email);
  };

  /**
   * FUNCTION: GET MY PAYMENTS
   * 
   * MỤC ĐÍCH: Lấy danh sách thanh toán của student hiện tại (filter theo email)
   * 
   * @returns {Array} - Danh sách payments có studentEmail trùng với user.email
   */
  const getMyPayments = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return payments.filter(p => p.studentEmail === user.email);
  };

  return (
    <div className="max-w-[1400px] mx-auto p-5">
      <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg mb-8 border border-fpt-blue/10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-fpt-blue mb-2 m-0">🎓 Trang Sinh Viên</h1>
            <p className="text-gray-600 text-lg m-0">Khám phá và tham gia các câu lạc bộ</p>
          </div>
          <button
            onClick={() => setShowRegisterClubModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            <span>➕</span>
            <span>Đăng ký mở Club</span>
          </button>
        </div>
      </div>

      {/* Clubs List Tab */}
      {currentPage === 'clubs' && (
        <>
          {loadingClubs ? (
            <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-600">
              <div className="animate-spin inline-block w-12 h-12 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full mb-4"></div>
              <p className="m-0 text-base">Đang tải danh sách câu lạc bộ...</p>
            </div>
          ) : (
            <StudentClubList
              clubs={clubs}
              joinRequests={joinRequests}
              payments={payments}
              onJoinRequest={handleJoinRequest}
              getRequestStatus={getRequestStatus}
              hasPayment={hasPayment}
              onViewDetails={handleViewDetails}
            />
          )}
        </>
      )}

      {/* Join Request Modal */}
      {showJoinModal && (
        <JoinRequestModal
          club={selectedClub}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedClub(null);
          }}
          onSubmit={submitJoinRequest}
        />
      )}

      {/* Club Details Modal */}
      {showDetailsModal && (
        <ClubDetailsModal
          club={selectedClub}
          onClose={(options = {}) => {
            const keepSelected = options.keepSelected === true;
            closeDetailsModal(keepSelected);
          }}
          onJoinRequest={handleJoinRequest}
          getRequestStatus={getRequestStatus}
        />
      )}

      {/* Register Club Modal */}
      {showRegisterClubModal && (
        <RegisterClubModal
          onClose={() => setShowRegisterClubModal(false)}
          onSubmit={submitClubRequest}
        />
      )}
    </div>
  );
};

export default StudentDashboard;


