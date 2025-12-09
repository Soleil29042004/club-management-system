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
  const [joinRequests, setJoinRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRegisterClubModal, setShowRegisterClubModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubRequests, setClubRequests] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    // Đảm bảo dữ liệu được khởi tạo trước khi load
    initializeDemoData();
    
    const savedRequests = localStorage.getItem('joinRequests');
    const savedPayments = localStorage.getItem('payments');
    const savedClubRequests = localStorage.getItem('clubRequests');
    
    if (savedRequests) {
      try {
        setJoinRequests(JSON.parse(savedRequests));
      } catch (e) {
        console.error('Error parsing joinRequests:', e);
      }
    }
    if (savedPayments) {
      try {
        setPayments(JSON.parse(savedPayments));
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

  const handleJoinRequest = (club) => {
    setSelectedClub(club);
    setShowJoinModal(true);
  };

  const submitJoinRequest = (formData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const newRequest = {
      id: Date.now(),
      clubId: selectedClub.id,
      clubName: selectedClub.name,
      studentEmail: user.email,
      studentName: user.name,
      phone: formData.phone,
      studentId: formData.studentId,
      major: formData.major,
      reason: formData.reason,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      message: `Yêu cầu tham gia ${selectedClub.name}`
    };

    setJoinRequests([...joinRequests, newRequest]);
    setShowJoinModal(false);
    setSelectedClub(null);
    showToast('Đã gửi yêu cầu tham gia thành công!', 'success');
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

  const submitClubRequest = (clubData) => {
    const newRequest = {
      id: Date.now(),
      ...clubData,
      requestDate: new Date().toISOString().split('T')[0]
    };

    setClubRequests([...clubRequests, newRequest]);
    setShowRegisterClubModal(false);
    showToast('Đã gửi yêu cầu đăng ký mở câu lạc bộ thành công! Yêu cầu của bạn đang chờ được duyệt.', 'success');
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


