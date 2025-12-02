import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import StudentStats from './StudentStats';
import StudentClubList from './StudentClubList';
import StudentUnpaidFees from './StudentUnpaidFees';
import JoinRequestModal from './JoinRequestModal';
import PaymentModal from './PaymentModal';
import './StudentDashboard.css';

const StudentDashboard = ({ clubs, currentPage }) => {
  const { showToast } = useToast();
  const [joinRequests, setJoinRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedRequests = localStorage.getItem('joinRequests');
    const savedPayments = localStorage.getItem('payments');
    if (savedRequests) {
      setJoinRequests(JSON.parse(savedRequests));
    }
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('joinRequests', JSON.stringify(joinRequests));
  }, [joinRequests]);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  const handleJoinRequest = (club) => {
    setSelectedClub(club);
    setShowJoinModal(true);
  };

  const submitJoinRequest = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const newRequest = {
      id: Date.now(),
      clubId: selectedClub.id,
      clubName: selectedClub.name,
      studentEmail: user.email,
      studentName: user.name,
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
    <div className="student-dashboard">
      <div className="student-header">
        <h1>🎓 Trang Sinh Viên</h1>
        <p>Khám phá và tham gia các câu lạc bộ</p>
      </div>

      <StudentStats
        requestsCount={getMyRequests().length}
        paymentsCount={getMyPayments().length}
        unpaidFeesCount={unpaidFees.length}
        clubsCount={clubs.filter(c => c.status === 'Hoạt động').length}
      />

      {/* Clubs List Tab */}
      {currentPage === 'clubs' && (
        <StudentClubList
          clubs={clubs}
          joinRequests={joinRequests}
          payments={payments}
          onJoinRequest={handleJoinRequest}
          getRequestStatus={getRequestStatus}
          hasPayment={hasPayment}
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
    </div>
  );
};

export default StudentDashboard;


