import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import StudentClubList from './StudentClubList';
import JoinRequestModal from './JoinRequestModal';
import PaymentModal from './PaymentModal';
import ClubDetailsModal from './ClubDetailsModal';
import RegisterClubModal from './RegisterClubModal';

const StudentDashboard = ({ clubs, currentPage, setClubs }) => {
  const { showToast } = useToast();
  const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';
  const [joinRequests, setJoinRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRegisterClubModal, setShowRegisterClubModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubRequests, setClubRequests] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);

  // Fetch my registrations from API
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
          const registrations = (data.result || []).map(reg => ({
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
          }));

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

  // Load other data from localStorage on mount
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

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('joinRequests', JSON.stringify(joinRequests));
  }, [joinRequests]);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('clubRequests', JSON.stringify(clubRequests));
  }, [clubRequests]);

  // Fetch clubs from API (student view)
  useEffect(() => {
    const normalizeClub = (item) => ({
      id: item.id || item.clubId || item.requestId || Date.now(),
      clubId: item.clubId || item.id,
      name: item.name || item.clubName || item.proposedName || 'CLB chưa đặt tên',
      description: item.description || item.purpose || 'Chưa có mô tả',
      category: item.category || item.type || 'Khác',
      president: item.founderName || item.president || item.chairman || item.leaderName || item.adminName || 'Chưa cập nhật',
      founderName: item.founderName || item.president || item.chairman || item.leaderName || item.adminName || 'Chưa cập nhật',
      memberCount: item.memberCount || item.totalMembers || item.membersCount || item.memberTotal || 0,
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
        setClubs(prevClubs => {
          return prevClubs.map(club => {
            const packageData = packageResults.find(pr => pr && (pr.clubId === club.clubId || pr.clubId === club.id));
            if (packageData && packageData.package) {
              const pkg = packageData.package;
              return {
                ...club,
                participationFee: pkg.price !== undefined ? pkg.price : club.participationFee,
                membershipDuration: pkg.term || club.membershipDuration,
                packageTerm: pkg.term // Store term separately for display
              };
            }
            return club;
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
        setClubs(normalizedClubs);
        
        // Fetch packages for each club to get correct participation fee
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
  }, [API_BASE_URL, setClubs, showToast]);

  const handleJoinRequest = (club) => {
    setSelectedClub(club);
    setShowJoinModal(true);
  };

  const submitJoinRequest = async (formData) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Bạn cần đăng nhập trước khi đăng ký tham gia CLB.', 'error');
      return;
    }

    if (!selectedClub || !selectedClub.id) {
      showToast('Thông tin câu lạc bộ không hợp lệ.', 'error');
      return;
    }

    if (!formData.packageId) {
      showToast('Vui lòng chọn gói thành viên.', 'error');
      return;
    }

    // Chuẩn bị payload theo đúng format API yêu cầu
    // API chỉ cần packageId trong body, không cần clubId (API tự lấy từ package)
    const payload = {
      packageId: parseInt(formData.packageId)
    };

    // API endpoint: POST /api/registers
    // Chỉ gửi packageId trong body, không cần query parameter
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
      
      // Refresh registrations from API to ensure sync
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

  const handlePayment = (club) => {
    setSelectedClub(club);
    setShowPaymentModal(true);
  };

  const closeDetailsModal = (keepSelected = false) => {
    setShowDetailsModal(false);
    if (!keepSelected) {
      setSelectedClub(null);
    }
  };

  const handleViewDetails = (club) => {
    setSelectedClub(club);
    setShowDetailsModal(true);
  };

  const submitPayment = (paymentData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const newPayment = {
      id: Date.now(),
      clubId: selectedClub.id,
      clubName: selectedClub.name,
      studentEmail: user.email,
      studentName: user.name,
      amount: paymentData.amount,
      note: paymentData.note,
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'completed'
    };

    setPayments([...payments, newPayment]);
    setShowPaymentModal(false);
    setSelectedClub(null);
    showToast('Nộp phí thành công!', 'success');
  };

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
    
    // Map API status to local status
    const statusMap = {
      'ChoDuyet': 'pending',
      'DaDuyet': 'approved',
      'TuChoi': 'rejected',
      'HoatDong': 'active',
      'HetHan': 'expired'
    };
    
    // Return mapped status or original if not in map
    return statusMap[apiStatus] || apiStatus;
  };

  const hasPayment = (clubId) => {
    return payments.some(p => p.clubId === clubId);
  };

  const getMyRequests = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return joinRequests.filter(r => r.studentEmail === user.email);
  };

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

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          club={selectedClub}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedClub(null);
          }}
          onSubmit={submitPayment}
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


