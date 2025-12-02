import React, { useState, useEffect } from 'react';
import LeaderStats from './LeaderStats';
import ClubInfo from './ClubInfo';
import JoinRequestsList from './JoinRequestsList';
import MembersList from './MembersList';
import { clubCategories, statusOptions } from '../data/mockData';
import './ClubLeaderDashboard.css';

const ClubLeaderDashboard = ({ clubs, setClubs, members, setMembers, currentPage }) => {
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
    const savedRequests = localStorage.getItem('joinRequests');
    if (savedRequests) {
      setJoinRequests(JSON.parse(savedRequests));
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
    
    alert('Đã chấp nhận yêu cầu tham gia!');
  };

  const handleReject = (requestId) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      setJoinRequests(joinRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: 'rejected' }
          : request
      ));
      alert('Đã từ chối yêu cầu tham gia!');
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
      alert('Vui lòng điền đầy đủ thông tin!');
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
    alert('Cập nhật thông tin club thành công!');
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
      
      alert('Đã xóa thành viên khỏi club!');
    }
  };

  const handleUpdateMemberRole = (memberId, newRole) => {
    setMembers(members.map(member =>
      member.id === memberId
        ? { ...member, role: newRole }
        : member
    ));
    alert('Đã cập nhật vai trò thành viên!');
  };

  const pendingRequests = getPendingRequests();
  const clubMembers = getClubMembers();

  if (!myClub) {
    return (
      <div className="club-leader-dashboard">
        <div className="no-club-message">
          <div className="no-club-icon">⚠️</div>
          <h2>Bạn chưa được gán quản lý câu lạc bộ nào</h2>
          <p>Vui lòng liên hệ admin để được gán quản lý câu lạc bộ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="club-leader-dashboard">
      <div className="leader-header">
        <h1>👑 Trang Quản lý Club Leader</h1>
        <p>Quản lý câu lạc bộ: <strong>{myClub.name}</strong></p>
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
    </div>
  );
};

export default ClubLeaderDashboard;

