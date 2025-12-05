import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import LeaderStats from './LeaderStats';
import ClubInfo from './ClubInfo';
import JoinRequestsList from './JoinRequestsList';
import MembersList from './MembersList';
import ClubActivities from './ClubActivities';
import { clubCategories, statusOptions, initializeMockData } from '../data/mockData';

const ClubLeaderDashboard = ({ clubs, setClubs, members, setMembers, currentPage }) => {
  const { showToast } = useToast();
  const [joinRequests, setJoinRequests] = useState([]);
  const [myClub, setMyClub] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Công nghệ',
    foundedDate: '',
    president: '',
    memberCount: 0,
    status: 'Hoạt động',
    email: '',
    location: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    // Đảm bảo mock data được khởi tạo
    initializeMockData();
    
    // Load requests sau khi đã initialize
    const savedRequests = localStorage.getItem('joinRequests');
    if (savedRequests) {
      const requests = JSON.parse(savedRequests);
      setJoinRequests(requests);
    }

    // Find club managed by this leader
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const club = clubs.find(c => c.president === user.name);
      if (club) {
        setMyClub(club);
        setFormData(club);
      }
    }
  }, [clubs]);

  // Save to localStorage whenever requests change
  useEffect(() => {
    localStorage.setItem('joinRequests', JSON.stringify(joinRequests));
  }, [joinRequests]);

  // Get pending requests for this leader's club
  const getPendingRequests = () => {
    if (!myClub) return [];
    return joinRequests.filter(
      request => request.clubId === myClub.id && request.status === 'pending'
    );
  };

  const handleApprove = (requestId) => {
    setJoinRequests(joinRequests.map(request => 
      request.id === requestId 
        ? { ...request, status: 'approved' }
        : request
    ));
    
    // Update member count
    if (myClub) {
      setClubs(clubs.map(club =>
        club.id === myClub.id
          ? { ...club, memberCount: club.memberCount + 1 }
          : club
      ));
    }
    
    showToast('Đã chấp nhận yêu cầu tham gia!', 'success');
  };

  const handleReject = (requestId) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      setJoinRequests(joinRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: 'rejected' }
          : request
      ));
      showToast('Đã từ chối yêu cầu tham gia!', 'success');
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'memberCount' ? parseInt(value) || 0 : value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }

    // Update club
    setClubs(clubs.map(club =>
      club.id === myClub.id
        ? { ...formData, id: myClub.id }
        : club
    ));

    // Update myClub state
    setMyClub({ ...formData, id: myClub.id });
    setShowEditForm(false);
    showToast('Cập nhật thông tin club thành công!', 'success');
  };

  const handleFormCancel = () => {
    setFormData(myClub);
    setShowEditForm(false);
  };

  // Get members of this club
  const getClubMembers = () => {
    if (!myClub) return [];
    return members.filter(member => member.clubId === myClub.id);
  };

  const handleDeleteMember = (memberId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi club?')) {
      setMembers(members.filter(m => m.id !== memberId));
      
      // Update member count
      if (myClub) {
        setClubs(clubs.map(club =>
          club.id === myClub.id
            ? { ...club, memberCount: Math.max(0, club.memberCount - 1) }
            : club
        ));
        setMyClub({ ...myClub, memberCount: Math.max(0, myClub.memberCount - 1) });
      }
      
      showToast('Đã xóa thành viên khỏi club!', 'success');
    }
  };

  const handleUpdateMemberRole = (memberId, newRole) => {
    setMembers(members.map(member =>
      member.id === memberId
        ? { ...member, role: newRole }
        : member
    ));
    showToast('Đã cập nhật vai trò thành viên!', 'success');
  };

  const handleUpdateActivities = (activities) => {
    if (!myClub) return;
    
    const updatedClub = { ...myClub, activities };
    setMyClub(updatedClub);
    setClubs(clubs.map(club =>
      club.id === myClub.id
        ? updatedClub
        : club
    ));
    showToast('Đã cập nhật hoạt động thành công!', 'success');
  };

  const pendingRequests = getPendingRequests();
  const clubMembers = getClubMembers();

  if (!myClub) {
    return (
      <div className="max-w-[1400px] mx-auto p-5">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Bạn chưa được gán quản lý câu lạc bộ nào</h2>
          <p className="text-gray-600">Vui lòng liên hệ admin để được gán quản lý câu lạc bộ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-5">
      <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg mb-8 border border-fpt-blue/10">
        <h1 className="text-3xl font-bold text-fpt-blue mb-2">👑 Trang Quản lý Club Leader</h1>
        <p className="text-gray-600 text-lg">Quản lý câu lạc bộ: <strong className="text-fpt-blue">{myClub.name}</strong></p>
      </div>

      <LeaderStats
        memberCount={myClub.memberCount}
        pendingRequestsCount={pendingRequests.length}
        category={myClub.category}
        location={myClub.location}
      />

      {/* Manage Club Tab */}
      {currentPage === 'manage' && (
        <ClubInfo
          club={myClub}
          onEdit={handleEdit}
          showEditForm={showEditForm}
          formData={formData}
          onFormChange={handleFormChange}
          onFormSubmit={handleFormSubmit}
          onFormCancel={handleFormCancel}
        />
      )}

      {/* Join Requests Tab */}
      {currentPage === 'requests' && (
        <JoinRequestsList
          requests={pendingRequests}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Members Management Tab */}
      {currentPage === 'members' && (
        <MembersList
          members={clubMembers}
          onUpdateRole={handleUpdateMemberRole}
          onDeleteMember={handleDeleteMember}
        />
      )}

      {/* Activities Management Tab */}
      {currentPage === 'activities' && (
        <ClubActivities
          club={myClub}
          onUpdateActivities={handleUpdateActivities}
        />
      )}
    </div>
  );
};

export default ClubLeaderDashboard;

