import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useToast } from './Toast';
import LeaderStats from './LeaderStats';
import ClubInfo from './ClubInfo';
import JoinRequestsList from './JoinRequestsList';
import MembersList from './MembersList';
import ClubFeeManagement from './ClubFeeManagement';
import { clubCategoryLabels } from '../data/constants';

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
  const lastFetchedClubId = useRef(null);
  const [showEditForm, setShowEditForm] = useState(false);
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

  const normalizeRole = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'chutich' || r === 'chủ tịch' || r === 'chu tich') return 'Chủ tịch';
    if (r === 'phochutich' || r === 'phó chủ tịch' || r === 'pho chu tich') return 'Phó Chủ tịch';
    if (r === 'thuky' || r === 'thư ký' || r === 'thu ky') return 'Thư ký';
    if (r === 'thuquy' || r === 'thủ quỹ' || r === 'thu quy') return 'Thủ quỹ';
    if (r === 'thanhvien' || r === 'thành viên' || r === 'thanh vien') return 'Thành viên';
    return role || 'Thành viên';
  };

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

  // Load data từ localStorage (join requests mock) - giữ lại cho tới khi có API chính thức
  useEffect(() => {
    const savedRequests = localStorage.getItem('joinRequests');
    if (savedRequests) {
      try {
        setJoinRequests(JSON.parse(savedRequests));
      } catch (e) {
        console.error('Error parsing joinRequests:', e);
      }
    }
  }, []); // Chỉ chạy một lần khi mount

  // Fetch chi tiết CLB cho Club Leader
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
        console.log('[ClubLeaderDashboard] Fetch club detail', {
          targetClubId,
          tokenExists: !!token,
          useAuth
        });
        const res = await fetch(`${API_BASE_URL}/clubs/${targetClubId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(useAuth && token ? { Authorization: `Bearer ${token}` } : {})
          },
          mode: 'cors'
        });

        const data = await res.json().catch(() => ({}));

        console.log('[ClubLeaderDashboard] Club detail response', {
          status: res.status,
          data,
          useAuth
        });

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

  // Save to localStorage whenever requests change
  useEffect(() => {
    localStorage.setItem('joinRequests', JSON.stringify(joinRequests));
  }, [joinRequests]);

  // Fetch members of the current club
  useEffect(() => {
    const targetClubId = myClub?.id || myClub?.clubId;
    if (!targetClubId) return;

    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchMembers = async () => {
      setMembersLoading(true);
      setMembersError('');
      try {
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

  // Fetch club internal stats: members, revenue, unpaid list
  useEffect(() => {
    const targetClubId = myClub?.id || myClub?.clubId;
    if (!targetClubId) return;

    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError('');
      try {
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

  // Get all requests for this leader's club (pending, approved, rejected)
  // Sắp xếp: pending trước, sau đó approved, cuối cùng rejected
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

  // Get pending requests count for stats
  const getPendingRequestsCount = useCallback(() => {
    if (!myClub) return 0;
    return joinRequests.filter(
      request => request.clubId === myClub.id && request.status === 'pending'
    ).length;
  }, [joinRequests, myClub]);

  const handleApprove = (requestId) => {
    // Sử dụng functional update để đảm bảo state được cập nhật đúng
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
    
    // Update member count
    if (myClub) {
      setClubs(prevClubs => prevClubs.map(club =>
        club.id === myClub.id
          ? { ...club, memberCount: club.memberCount + 1 }
          : club
      ));
    }
    
    showToast('Đã chấp nhận yêu cầu tham gia!', 'success');
  };

  const handleReject = (requestId) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      // Sử dụng functional update để đảm bảo state được cập nhật đúng
      setJoinRequests(prevRequests => {
        const updated = prevRequests.map(request => {
          if (request.id === requestId) {
            return { ...request, status: 'rejected' };
          }
          return request;
        });
        // Lưu vào localStorage ngay lập tức
        localStorage.setItem('joinRequests', JSON.stringify(updated));
        return updated;
      });
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
    
    if (!formData.description.trim() || !formData.location.trim()) {
      showToast('Vui lòng nhập mô tả và địa điểm.', 'error');
      return;
    }

    const token = localStorage.getItem('authToken');
    // API cập nhật thông tin cơ bản: logo, mô tả, địa điểm
    const payload = {
      logo: formData.logo || null,
      description: formData.description || '',
      location: formData.location || ''
    };

    const doUpdate = async () => {
      try {
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

  const handleFormCancel = () => {
    setFormData(myClub);
    setShowEditForm(false);
  };

  // Get members of this club
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

    setDeleteLoadingId(memberId);
    try {
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

      // Remove member from local state
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
      
      showToast('Đã xóa thành viên khỏi club (đánh dấu DaRoiCLB)!', 'success');
    } catch (err) {
      console.error('Delete member error:', err);
      showToast(err.message || 'Không thể xóa thành viên khỏi club.', 'error');
    } finally {
      setDeleteLoadingId(null);
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

  // Sử dụng useMemo để đảm bảo được tính toán lại khi dependencies thay đổi
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

