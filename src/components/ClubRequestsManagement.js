import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { getNextClubId, initializeDemoData } from '../data/mockData';

const ClubRequestsManagement = ({ clubs, setClubs }) => {
  const { showToast } = useToast();
  const [clubRequests, setClubRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Load club requests from localStorage
  useEffect(() => {
    // Đảm bảo dữ liệu được khởi tạo trước khi load
    initializeDemoData();
    
    const savedRequests = localStorage.getItem('clubRequests');
    if (savedRequests) {
      try {
        setClubRequests(JSON.parse(savedRequests));
      } catch (e) {
        console.error('Error parsing clubRequests:', e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('clubRequests', JSON.stringify(clubRequests));
  }, [clubRequests]);

  const filteredRequests = clubRequests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  const handleApprove = (request) => {
    if (window.confirm(`Bạn có chắc chắn muốn duyệt yêu cầu đăng ký mở câu lạc bộ "${request.name}"?`)) {
      // Create new club from request
      const newClub = {
        id: getNextClubId(clubs),
        name: request.name,
        description: request.description,
        category: request.category,
        foundedDate: new Date().toISOString().split('T')[0],
        president: request.applicantName,
        memberCount: 1, // Start with 1 member (the founder)
        status: 'Hoạt động',
        email: request.email,
        location: request.location,
        participationFee: request.participationFee || 0,
        activities: []
      };

      // Add club to clubs list
      setClubs([...clubs, newClub]);

      // Update request status - sử dụng functional update
      setClubRequests(prevRequests => {
        const updated = prevRequests.map(req =>
          req.id === request.id
            ? { ...req, status: 'approved', approvedDate: new Date().toISOString().split('T')[0] }
            : req
        );
        // Lưu vào localStorage ngay lập tức
        localStorage.setItem('clubRequests', JSON.stringify(updated));
        return updated;
      });

      setShowDetailModal(false);
      setSelectedRequest(null);
      showToast(`Đã duyệt yêu cầu và tạo câu lạc bộ "${request.name}" thành công!`, 'success');
    }
  };

  const handleReject = (request) => {
    const reason = window.prompt('Vui lòng nhập lý do từ chối (tùy chọn):');
    
    // Update request status - sử dụng functional update
    setClubRequests(prevRequests => {
      const updated = prevRequests.map(req =>
        req.id === request.id
          ? { 
              ...req, 
              status: 'rejected', 
              rejectedDate: new Date().toISOString().split('T')[0],
              rejectionReason: reason || ''
            }
          : req
      );
      // Lưu vào localStorage ngay lập tức
      localStorage.setItem('clubRequests', JSON.stringify(updated));
      return updated;
    });

    setShowDetailModal(false);
    setSelectedRequest(null);
    showToast(`Đã từ chối yêu cầu đăng ký mở câu lạc bộ "${request.name}"`, 'info');
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-amber-500', text: 'Chờ duyệt' },
      approved: { bg: 'bg-green-500', text: 'Đã duyệt' },
      rejected: { bg: 'bg-red-500', text: 'Đã từ chối' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase text-white ${config.bg}`}>
        {config.text}
      </span>
    );
  };

  const pendingCount = clubRequests.filter(r => r.status === 'pending').length;
  const approvedCount = clubRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = clubRequests.filter(r => r.status === 'rejected').length;

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
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredRequests.length === 0 ? (
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
                      <div className="font-medium text-gray-800">{request.applicantName}</div>
                      <div className="text-sm text-gray-500">{request.applicantEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {request.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start gap-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="px-4 py-2 bg-fpt-blue text-white rounded-lg text-sm font-medium hover:bg-fpt-blue-light transition-all"
                        >
                          Chi tiết
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all"
                            >
                              ✅ Duyệt
                            </button>
                            <button
                              onClick={() => handleReject(request)}
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
                  Yêu cầu từ: {selectedRequest.applicantName} ({selectedRequest.applicantEmail})
                </div>
                <div className="text-sm text-gray-500">
                  Ngày yêu cầu: {new Date(selectedRequest.requestDate).toLocaleDateString('vi-VN')}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="font-semibold text-gray-700 block mb-2">Danh mục:</label>
                  <p className="text-gray-800 m-0">{selectedRequest.category}</p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-2">Mô tả câu lạc bộ:</label>
                  <p className="text-gray-800 leading-relaxed m-0">{selectedRequest.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">Email liên hệ:</label>
                    <p className="text-gray-800 m-0">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">Địa điểm hoạt động:</label>
                    <p className="text-gray-800 m-0">{selectedRequest.location}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">Phí tham gia:</label>
                    <p className="text-gray-800 m-0">
                      {selectedRequest.participationFee 
                        ? `${selectedRequest.participationFee.toLocaleString('vi-VN')} VNĐ` 
                        : 'Miễn phí'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-2">Lý do thành lập:</label>
                  <p className="text-gray-800 leading-relaxed m-0 bg-gray-50 p-4 rounded-lg">{selectedRequest.reason}</p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-2">Mục tiêu hoạt động:</label>
                  <p className="text-gray-800 leading-relaxed m-0 bg-gray-50 p-4 rounded-lg">{selectedRequest.goals}</p>
                </div>

                {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <label className="font-semibold text-red-700 block mb-2">Lý do từ chối:</label>
                    <p className="text-red-800 m-0">{selectedRequest.rejectionReason}</p>
                  </div>
                )}

                {selectedRequest.status === 'approved' && selectedRequest.approvedDate && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-green-800 m-0">
                      <strong>Đã duyệt vào:</strong> {new Date(selectedRequest.approvedDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-4 justify-end mt-8 pt-5 border-t-2 border-gray-100">
                  <button
                    onClick={() => handleReject(selectedRequest)}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-red-500 text-white hover:bg-red-600 shadow-lg hover:-translate-y-1 hover:shadow-xl"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest)}
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

