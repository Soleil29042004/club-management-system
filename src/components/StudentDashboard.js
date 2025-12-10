import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import StudentClubList from './StudentClubList';
import StudentUnpaidFees from './StudentUnpaidFees';
import JoinRequestModal from './JoinRequestModal';
import PaymentModal from './PaymentModal';
import ClubDetailsModal from './ClubDetailsModal';
import RegisterClubModal from './RegisterClubModal';
import { initializeDemoData } from '../data/mockData';

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

  // Load data from localStorage on mount
  useEffect(() => {
    // Đảm bảo dữ liệu được khởi tạo trước khi load
    initializeDemoData();
    
    const savedRequests = localStorage.getItem('joinRequests');
    const savedPayments = localStorage.getItem('payments');
    const savedClubRequests = localStorage.getItem('clubRequests');
    
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
      name: item.name || item.clubName || item.proposedName || 'CLB chưa đặt tên',
      description: item.description || item.purpose || 'Chưa có mô tả',
      category: item.category || item.type || 'Khác',
      president: item.president || item.chairman || item.leaderName || item.adminName || 'Chưa cập nhật',
      memberCount: item.memberCount || item.membersCount || item.memberTotal || 0,
      status: item.statusText || item.status || 'Hoạt động',
      email: item.email || item.contactEmail || item.creatorEmail || '',
      location: item.location || item.address || 'Chưa cập nhật',
      participationFee: item.participationFee || item.defaultMembershipFee || item.fee || 0,
      membershipDuration: item.membershipDuration || item.durationMonths || 6
    });

    const fetchClubs = async () => {
      setLoadingClubs(true);
      try {
        const response = await fetch(`${API_BASE_URL}/clubs`, {
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = data.message || data.error || 'Không thể tải danh sách CLB.';
          throw new Error(message);
        }
        const list = Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];
        setClubs(list.map(normalizeClub));
      } catch (error) {
        console.error('Fetch clubs error:', error);
        showToast(error.message || 'Không thể tải danh sách CLB. Vui lòng thử lại.', 'error');
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
    // Theo API documentation: chỉ cần packageId trong body
    const payload = {
      packageId: parseInt(formData.packageId)
    };

    // API endpoint: POST /api/registers
    // Theo tài liệu API, chỉ cần packageId trong body
    // clubId có thể được lấy từ context hoặc truyền qua query parameter
    // Thử với query parameter: /registers?clubId={clubId}
    const url = `${API_BASE_URL}/registers${selectedClub.id ? `?clubId=${selectedClub.id}` : ''}`;

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

      // Kiểm tra response code: API có thể trả về 1000 hoặc 0 khi thành công
      if (!response.ok || !data || (data.code !== 1000 && data.code !== 0)) {
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
      
      const newRequest = {
        id: apiResult.subscriptionId || Date.now(),
        subscriptionId: apiResult.subscriptionId,
        clubId: apiResult.clubId,
        clubName: apiResult.clubName,
        studentEmail: apiResult.studentEmail || user.email,
        studentName: apiResult.studentName || user.name,
        phone: formData.phone,
        studentId: apiResult.studentCode || formData.studentId,
        major: formData.major,
        reason: formData.reason,
        status: apiResult.status || 'ChoDuyet', // ChoDuyet, DaDuyet, TuChoi
        requestDate: apiResult.createdAt ? apiResult.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        message: `Yêu cầu tham gia ${apiResult.clubName}`,
        packageId: apiResult.packageId,
        packageName: apiResult.packageName,
        price: apiResult.price,
        term: apiResult.term
      };

      // Cập nhật state
      setJoinRequests([...joinRequests, newRequest]);
      setShowJoinModal(false);
      setSelectedClub(null);
      
      // Hiển thị thông báo từ API hoặc thông báo mặc định
      const successMessage = data.message || 'Đã gửi yêu cầu tham gia thành công! Vui lòng chờ Leader CLB duyệt.';
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
    const request = joinRequests.find(r => r.clubId === clubId);
    if (!request) return null;
    return request.status;
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

  // Get clubs that student has been approved to join but hasn't paid yet
  const getUnpaidFees = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const myApprovedRequests = joinRequests.filter(
      r => r.studentEmail === user.email && r.status === 'approved'
    );
    
    const paidClubIds = getMyPayments().map(p => p.clubId);
    
    return myApprovedRequests
      .filter(request => !paidClubIds.includes(request.clubId))
      .map(request => {
        const club = clubs.find(c => c.id === request.clubId);
        return {
          ...request,
          club: club
        };
      })
      .filter(item => item.club); // Only include if club still exists
  };

  const unpaidFees = getUnpaidFees();

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

      {/* Unpaid Fees Tab */}
      {currentPage === 'unpaid-fees' && (
        <StudentUnpaidFees
          unpaidFees={unpaidFees}
          onPayment={handlePayment}
        />
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
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedClub(null);
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


