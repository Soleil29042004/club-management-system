/**
 * ClubRequestsManagement Component
 * 
 * Component quản lý yêu cầu đăng ký mở club cho admin:
 * - Hiển thị danh sách yêu cầu đăng ký mở club từ students
 * - Filter theo trạng thái (tất cả, chờ duyệt, đã duyệt, đã từ chối)
 * - Xem chi tiết yêu cầu
 * - Duyệt yêu cầu (tự động tạo club mới)
 * - Từ chối yêu cầu (có thể nhập lý do)
 * - Hiển thị thống kê: tổng yêu cầu, chờ duyệt, đã duyệt, đã từ chối
 * 
 * @param {Object} props
 * @param {Array} props.clubs - Danh sách clubs (để update sau khi duyệt)
 * @param {Function} props.setClubs - Callback để update clubs state
 */
import React, { useState, useEffect } from 'react';
import { useToast } from '../shared/Toast';
import { clubCategoryLabels } from '../../data/constants';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

/**
 * Map status từ API format (DangCho, ChapThuan, TuChoi) sang local format (pending, approved, rejected)
 * @param {string} apiStatus - Status từ API
 * @returns {string} - Status local
 */
const mapApiStatusToLocal = (apiStatus) => {
  const statusMap = {
    'DangCho': 'pending',
    'ChapThuan': 'approved',
    'TuChoi': 'rejected'
  };
  return statusMap[apiStatus] || apiStatus;
};

// Map status từ local sang API
const mapLocalStatusToApi = (localStatus) => {
  const statusMap = {
    'pending': 'DangCho',
    'approved': 'ChapThuan',
    'rejected': 'TuChoi'
  };
  return statusMap[localStatus] || localStatus;
};

const ClubRequestsManagement = ({ clubs, setClubs }) => {
  const { showToast } = useToast();
  const [clubRequests, setClubRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, DangCho, ChapThuan, TuChoi
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' or 'reject'
  const [confirmReason, setConfirmReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedReasonType, setSelectedReasonType] = useState(''); // 'approve' or 'reject'

  // Fetch club requests from API
  useEffect(() => {
    let isMounted = true;

    const fetchClubRequests = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        if (isMounted) {
          setLoading(false);
          showToast('Vui lòng đăng nhập để xem yêu cầu đăng ký mở CLB.', 'error');
        }
        return;
      }

      try {
        // Build URL với filter status nếu có
        let url = `${API_BASE_URL}/club-requests`;
        if (filterStatus !== 'all') {
          url += `?status=${filterStatus}`;
        }

        // ========== API CALL: GET /club-requests - List Club Requests ==========
        // Mục đích: Admin xem danh sách yêu cầu đăng ký mở CLB mới (có thể filter theo status)
        // Query: Optional ?status={status} để filter
        // Response: Array of club request objects
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => null);

        if (response.status === 401) {
          if (isMounted) {
            setLoading(false);
            showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
          }
          return;
        }

        if (!response.ok || !data || data.code !== 1000) {
          const message = data?.message || 'Không thể tải danh sách yêu cầu đăng ký mở CLB.';
          if (isMounted) {
            setLoading(false);
            showToast(message, 'error');
          }
          return;
        }

        // Map response từ API về format local
        const rawRequests = data.result || [];
        const mappedRequests = rawRequests.map(req => ({
          id: req.requestId,
          requestId: req.requestId,
          name: req.proposedName,
          description: req.purpose || req.description || '',
          category: req.category,
          email: req.email || '',
          location: req.location || '',
          participationFee: req.defaultMembershipFee || 0,
          goals: req.purpose || '',
          status: mapApiStatusToLocal(req.status), // Map về pending/approved/rejected
          apiStatus: req.status, // Giữ nguyên status từ API
          requestDate: req.createdAt ? req.createdAt.split('T')[0] : '',
          applicantName: req.creatorName || '',
          applicantEmail: req.creatorEmail || '',
          applicantStudentCode: req.creatorStudentCode || '',
          adminNote: req.adminNote,
          reviewerName: req.reviewerName,
          clubId: req.clubId,
          createdAt: req.createdAt,
          updatedAt: req.updatedAt
        }));

        if (isMounted) {
          setClubRequests(mappedRequests);
          setLoading(false);
        }
      } catch (error) {
        console.error('Fetch club requests error:', error);
        if (isMounted) {
          setLoading(false);
          showToast('Đã xảy ra lỗi. Vui lòng thử lại sau.', 'error');
        }
      }
    };

    fetchClubRequests();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]); // Fetch lại khi filter status thay đổi

  const filteredRequests = clubRequests; // Đã được filter từ API

  // Hàm fetch lại danh sách yêu cầu
  const refetchRequests = async () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) return;

    try {
      let url = `${API_BASE_URL}/club-requests`;
      if (filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }

      // ========== API CALL: GET /club-requests - Polling Club Requests ==========
      // Mục đích: Polling để kiểm tra yêu cầu mới hoặc thay đổi trạng thái (mỗi 10 giây)
      // Query: Optional ?status={status} để filter
      // Response: Array of club request objects
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.code === 1000) {
        const rawRequests = data.result || [];
        const mappedRequests = rawRequests.map(req => ({
          id: req.requestId,
          requestId: req.requestId,
          name: req.proposedName,
          description: req.purpose || req.description || '',
          category: req.category,
          email: req.email || '',
          location: req.location || '',
          participationFee: req.defaultMembershipFee || 0,
          goals: req.purpose || '',
          status: mapApiStatusToLocal(req.status),
          apiStatus: req.status,
          requestDate: req.createdAt ? req.createdAt.split('T')[0] : '',
          applicantName: req.creatorName || '',
          applicantEmail: req.creatorEmail || '',
          applicantStudentCode: req.creatorStudentCode || '',
          adminNote: req.adminNote,
          reviewerName: req.reviewerName,
          clubId: req.clubId,
          createdAt: req.createdAt,
          updatedAt: req.updatedAt
        }));
        setClubRequests(mappedRequests);
      }
    } catch (error) {
      console.error('Refetch requests error:', error);
    }
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setConfirmAction('approve');
    setConfirmReason('');
    setShowConfirmModal(true);
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setConfirmAction('reject');
    setConfirmReason('');
    setShowConfirmModal(true);
  };

  const handleApprove = async (request, reason = '') => {
    // reason được truyền từ modal confirm

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
      return;
    }

    try {
      // Validate requestId
      const requestId = request.requestId || request.id;
      if (!requestId) {
        showToast('Không tìm thấy ID yêu cầu. Vui lòng thử lại.', 'error');
        console.error('Missing requestId:', request);
        return;
      }

      // Chuẩn bị payload - adminNote là required field, gửi empty string nếu không có
      const payload = {
        status: 'ChapThuan',
        adminNote: (reason || '').trim() || ''
      };

      console.log('Approving request:', {
        requestId,
        payload,
        url: `${API_BASE_URL}/club-requests/${requestId}/review`
      });
      //Duyệt/Từ chối yêu cầu mở câu lạc bộ
      const response = await fetch(`${API_BASE_URL}/club-requests/${requestId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
        return;
      }

      // Xử lý lỗi 500 hoặc các lỗi server khác
      if (response.status === 500) {
        const errorMessage = data?.message || 'Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
        console.error('Server error (500):', {
          requestId: request.requestId || request.id,
          payload,
          response: data
        });
        showToast(errorMessage, 'error');
        return;
      }

      // API này trả về code: 0 khi thành công (khác với các API khác trả về code: 1000)
      if (!response.ok || !data || (data.code !== 0 && data.code !== 1000)) {
        const message = data?.message || `Không thể duyệt yêu cầu (mã ${response.status}). Vui lòng thử lại.`;
        console.error('Approve request failed:', {
          status: response.status,
          data,
          requestId: request.requestId || request.id
        });
        showToast(message, 'error');
        return;
      }

      // Đóng modal
      setShowDetailModal(false);
      setSelectedRequest(null);

      // Hiển thị thông báo thành công
      const successMessage = data?.message || `Đã duyệt yêu cầu "${request.name}" thành công! Hệ thống đã tự động tạo câu lạc bộ mới.`;
      showToast(successMessage, 'success');

      // Fetch lại danh sách yêu cầu để cập nhật UI
      await refetchRequests();

      // Nếu có callback để refresh danh sách CLB, gọi nó
      // (Có thể cần refresh danh sách CLB để hiển thị CLB mới được tạo)
    } catch (error) {
      console.error('Approve request error:', error);
      showToast('Đã xảy ra lỗi khi duyệt yêu cầu. Vui lòng thử lại.', 'error');
    }
  };

  const handleReject = async (request, reason = '') => {
    // reason được truyền từ modal confirm

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
      return;
    }

    try {
      // Validate requestId
      const requestId = request.requestId || request.id;
      if (!requestId) {
        showToast('Không tìm thấy ID yêu cầu. Vui lòng thử lại.', 'error');
        console.error('Missing requestId:', request);
        return;
      }

      // Chuẩn bị payload - adminNote là required field, gửi empty string nếu không có
      const payload = {
        status: 'TuChoi',
        adminNote: (reason || '').trim() || ''
      };

      console.log('Rejecting request:', {
        requestId,
        payload,
        url: `${API_BASE_URL}/club-requests/${requestId}/review`
      });
      ////Duyệt/Từ chối yêu cầu mở câu lạc bộ
      const response = await fetch(`${API_BASE_URL}/club-requests/${requestId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
        return;
      }

      // Xử lý lỗi 500 hoặc các lỗi server khác
      if (response.status === 500) {
        const errorMessage = data?.message || 'Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
        console.error('Server error (500):', {
          requestId: request.requestId || request.id,
          payload,
          response: data
        });
        showToast(errorMessage, 'error');
        return;
      }

      // API này trả về code: 0 khi thành công
      if (!response.ok || !data || (data.code !== 0 && data.code !== 1000)) {
        const message = data?.message || `Không thể từ chối yêu cầu (mã ${response.status}). Vui lòng thử lại.`;
        console.error('Reject request failed:', {
          status: response.status,
          data,
          requestId: request.requestId || request.id
        });
        showToast(message, 'error');
        return;
      }

      // Đóng modal
      setShowDetailModal(false);
      setSelectedRequest(null);

      // Hiển thị thông báo thành công
      const successMessage = data?.message || `Đã từ chối yêu cầu "${request.name}".`;
      showToast(successMessage, 'info');

      // Fetch lại danh sách yêu cầu để cập nhật UI
      await refetchRequests();
    } catch (error) {
      console.error('Reject request error:', error);
      showToast('Đã xảy ra lỗi khi từ chối yêu cầu. Vui lòng thử lại.', 'error');
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-amber-500', text: 'Chờ duyệt' },
      approved: { bg: 'bg-green-500', text: 'Đã duyệt' },
      rejected: { bg: 'bg-red-500', text: 'Đã từ chối' },
      DangCho: { bg: 'bg-amber-500', text: 'Chờ duyệt' },
      ChapThuan: { bg: 'bg-green-500', text: 'Đã duyệt' },
      TuChoi: { bg: 'bg-red-500', text: 'Đã từ chối' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase text-white ${config.bg}`}>
        {config.text}
      </span>
    );
  };

  // Tính toán số lượng từ API response (cần fetch tất cả để đếm chính xác)
  const pendingCount = clubRequests.filter(r => r.status === 'pending' || r.apiStatus === 'DangCho').length;
  const approvedCount = clubRequests.filter(r => r.status === 'approved' || r.apiStatus === 'ChapThuan').length;
  const rejectedCount = clubRequests.filter(r => r.status === 'rejected' || r.apiStatus === 'TuChoi').length;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg mb-8 border border-fpt-blue/10">
        <h1 className="text-3xl font-bold text-fpt-blue mb-2 m-0">Quản lý yêu cầu đăng ký mở Club</h1>
        <p className="text-gray-600 text-base m-0">Duyệt và quản lý các yêu cầu đăng ký mở câu lạc bộ mới từ sinh viên</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 m-0">Tổng yêu cầu</p>
              <p className="text-3xl font-bold text-fpt-blue m-0">{clubRequests.length}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 m-0">Chờ duyệt</p>
              <p className="text-3xl font-bold text-amber-600 m-0">{pendingCount}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 m-0">Đã duyệt</p>
              <p className="text-3xl font-bold text-green-600 m-0">{approvedCount}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 m-0">Đã từ chối</p>
              <p className="text-3xl font-bold text-red-600 m-0">{rejectedCount}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Lọc theo trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
          >
            <option value="all">Tất cả</option>
            <option value="DangCho">Chờ duyệt</option>
            <option value="ChapThuan">Đã duyệt</option>
            <option value="TuChoi">Đã từ chối</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-16 px-5 text-gray-500 text-lg">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full mb-4"></div>
            <p>Đang tải danh sách yêu cầu...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-500 text-lg">
            <p className="text-6xl mb-4">📭</p>
            <p>Không có yêu cầu nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tên câu lạc bộ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Người đăng ký</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Danh mục</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ngày yêu cầu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Lý do</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={`${request.id}-${request.status}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{request.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{request.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{request.applicantName || '—'}</div>
                      {request.applicantStudentCode && (
                        <div className="text-sm text-gray-500">Mã SV: {request.applicantStudentCode}</div>
                      )}
                      {request.applicantEmail && (
                        <div className="text-sm text-gray-500">{request.applicantEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {clubCategoryLabels[request.category] || request.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {request.requestDate ? new Date(request.requestDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4">
                      {request.adminNote ? (
                        <button
                          onClick={() => {
                            setSelectedReason(request.adminNote);
                            setSelectedReasonType(
                              request.status === 'approved' || request.apiStatus === 'ChapThuan'
                                ? 'approve'
                                : request.status === 'rejected' || request.apiStatus === 'TuChoi'
                                ? 'reject'
                                : ''
                            );
                            setShowReasonModal(true);
                          }}
                          className="text-sm text-fpt-blue hover:text-fpt-blue-light hover:underline cursor-pointer text-left max-w-[200px] line-clamp-2"
                          title="Click để xem chi tiết"
                        >
                          {request.adminNote}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start gap-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="px-4 py-2 bg-fpt-blue text-white rounded-lg text-sm font-medium hover:bg-fpt-blue-light transition-all"
                        >
                          Chi tiết
                        </button>
                        {(request.status === 'pending' || request.apiStatus === 'DangCho') && (
                          <>
                            <button
                              onClick={() => openApproveModal(request)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all"
                            >
                              ✅ Duyệt
                            </button>
                            <button
                              onClick={() => openRejectModal(request)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all"
                            >
                              ❌ Từ chối
                            </button>
                          </>
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

      {/* Reason View Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1001] p-5" onClick={() => {
          setShowReasonModal(false);
          setSelectedReason('');
          setSelectedReasonType('');
        }}>
          <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 flex justify-between items-center rounded-t-xl ${
              selectedReasonType === 'approve'
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : selectedReasonType === 'reject'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-fpt-blue to-fpt-blue-light'
            } text-white`}>
              <h2 className="m-0 text-xl font-semibold">
                {selectedReasonType === 'approve'
                  ? '✅ Lý do duyệt'
                  : selectedReasonType === 'reject'
                  ? '❌ Lý do từ chối'
                  : '📝 Lý do'}
              </h2>
              <button
                className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedReason('');
                  setSelectedReasonType('');
                }}
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedReason || 'Không có lý do'}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setSelectedReason('');
                    setSelectedReasonType('');
                  }}
                  className="px-6 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {showConfirmModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1001] p-5" onClick={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
          setConfirmReason('');
        }}>
          <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 flex justify-between items-center rounded-t-xl ${
              confirmAction === 'approve' 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
            } text-white`}>
              <h2 className="m-0 text-xl font-semibold">
                {confirmAction === 'approve' ? '✅ Duyệt yêu cầu' : '❌ Từ chối yêu cầu'}
              </h2>
              <button
                className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                  setConfirmReason('');
                }}
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-800 text-base mb-2">
                  {confirmAction === 'approve' ? (
                    <>
                      Bạn có chắc chắn muốn duyệt yêu cầu đăng ký mở câu lạc bộ <strong>"{selectedRequest.name}"</strong>?
                    </>
                  ) : (
                    <>
                      Bạn có chắc chắn muốn từ chối yêu cầu đăng ký mở câu lạc bộ <strong>"{selectedRequest.name}"</strong>?
                    </>
                  )}
                </p>
                {confirmAction === 'approve' && (
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    Khi duyệt, hệ thống sẽ tự động tạo câu lạc bộ mới.
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {confirmAction === 'approve' ? 'Lý do duyệt:' : 'Lý do từ chối:'}
                  <span className="text-gray-500 font-normal ml-1">(tùy chọn)</span>
                </label>
                <textarea
                  value={confirmReason}
                  onChange={(e) => setConfirmReason(e.target.value)}
                  placeholder={confirmAction === 'approve' 
                    ? 'Ví dụ: Yêu cầu hợp lệ, đáp ứng đủ điều kiện thành lập CLB...' 
                    : 'Ví dụ: Chưa đáp ứng đủ điều kiện, thiếu thông tin...'}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm transition-all font-sans resize-y focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bạn có thể để trống hoặc nhập lý do để ghi chú cho yêu cầu này.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                    setConfirmReason('');
                  }}
                  className="px-6 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    const action = confirmAction;
                    const reason = confirmReason;
                    const request = selectedRequest;
                    
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                    setConfirmReason('');
                    setSelectedRequest(null);
                    
                    if (action === 'approve') {
                      await handleApprove(request, reason);
                    } else if (action === 'reject') {
                      await handleReject(request, reason);
                    }
                  }}
                  className={`px-6 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all text-white shadow-lg hover:-translate-y-1 hover:shadow-xl ${
                    confirmAction === 'approve'
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                >
                  {confirmAction === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5">
          <div className="bg-white rounded-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
              <h2 className="m-0 text-2xl font-semibold">Chi tiết yêu cầu đăng ký</h2>
              <button
                className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRequest(null);
                }}
              >
                &times;
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 m-0">{selectedRequest.name}</h3>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="text-sm text-gray-500">
                  Yêu cầu từ: {selectedRequest.applicantName || selectedRequest.creatorName} 
                  {selectedRequest.applicantStudentCode && ` (${selectedRequest.applicantStudentCode})`}
                </div>
                {selectedRequest.applicantEmail && (
                  <div className="text-sm text-gray-500">
                    Email: {selectedRequest.applicantEmail}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  Ngày yêu cầu: {selectedRequest.requestDate ? new Date(selectedRequest.requestDate).toLocaleDateString('vi-VN') : '—'}
                </div>
                {selectedRequest.createdAt && (
                  <div className="text-sm text-gray-500">
                    Thời gian tạo: {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="font-semibold text-gray-700 block mb-2">Danh mục:</label>
                  <p className="text-gray-800 m-0">
                    {clubCategoryLabels[selectedRequest.category] || selectedRequest.category}
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-2">Mục đích thành lập:</label>
                  <p className="text-gray-800 leading-relaxed m-0 bg-gray-50 p-4 rounded-lg">
                    {selectedRequest.purpose || selectedRequest.description || selectedRequest.goals || '—'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRequest.email && (
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">Email liên hệ:</label>
                      <p className="text-gray-800 m-0">{selectedRequest.email}</p>
                    </div>
                  )}
                  {selectedRequest.location && (
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">Địa điểm hoạt động:</label>
                      <p className="text-gray-800 m-0">{selectedRequest.location}</p>
                    </div>
                  )}
                  {selectedRequest.participationFee > 0 && (
                    <div>
                      <label className="font-semibold text-gray-700 block mb-2">Phí tham gia:</label>
                      <p className="text-gray-800 m-0">
                        {selectedRequest.participationFee.toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  )}
                </div>

                {selectedRequest.adminNote && (
                  <div className={`border-l-4 p-4 rounded ${
                    selectedRequest.status === 'approved' || selectedRequest.apiStatus === 'ChapThuan'
                      ? 'bg-green-50 border-green-500'
                      : selectedRequest.status === 'rejected' || selectedRequest.apiStatus === 'TuChoi'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}>
                    <label className="font-semibold text-gray-700 block mb-2">
                      {selectedRequest.status === 'approved' || selectedRequest.apiStatus === 'ChapThuan'
                        ? '✅ Lý do duyệt:'
                        : selectedRequest.status === 'rejected' || selectedRequest.apiStatus === 'TuChoi'
                        ? '❌ Lý do từ chối:'
                        : '📝 Ghi chú của Admin:'}
                    </label>
                    <p className="text-gray-800 m-0 whitespace-pre-wrap">{selectedRequest.adminNote}</p>
                  </div>
                )}

                {selectedRequest.reviewerName && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-green-800 m-0">
                      <strong>Người duyệt:</strong> {selectedRequest.reviewerName}
                    </p>
                    {selectedRequest.updatedAt && (
                      <p className="text-green-800 m-0 mt-1">
                        <strong>Thời gian:</strong> {new Date(selectedRequest.updatedAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                )}

                {selectedRequest.clubId && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <p className="text-purple-800 m-0">
                      <strong>Đã tạo CLB với ID:</strong> {selectedRequest.clubId}
                    </p>
                  </div>
                )}
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-4 justify-end mt-8 pt-5 border-t-2 border-gray-100">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openRejectModal(selectedRequest);
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-red-500 text-white hover:bg-red-600 shadow-lg hover:-translate-y-1 hover:shadow-xl"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openApproveModal(selectedRequest);
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
                  >
                    Duyệt yêu cầu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubRequestsManagement;

