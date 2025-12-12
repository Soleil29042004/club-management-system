import React, { useEffect, useState } from 'react';

const JoinRequestsList = ({ requests = [], clubId, onApprove, onReject }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiRequests, setApiRequests] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!clubId) return;
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchRegistrations = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint =
          statusFilter && statusFilter !== 'All'
            ? `https://clubmanage.azurewebsites.net/api/registrations/club/${clubId}/status/${statusFilter}`
            : `https://clubmanage.azurewebsites.net/api/registrations/club/${clubId}`;

        const res = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          const mapped = (data.result || []).map(item => ({
            id: item.subscriptionId || item.id,
            subscriptionId: item.subscriptionId || item.id,
            studentName: item.studentName || '',
            studentEmail: item.studentEmail || '',
            studentId: item.studentCode || '',
            phone: item.phone || '',
            major: item.major || '',
            requestDate: item.createdAt || item.joinDate || new Date().toISOString(),
            status: (() => {
              const st = (item.status || '').toLowerCase();
              if (st === 'choduyet') return 'pending';
              if (st === 'daduyet') return 'approved';
              if (st === 'tuchoi') return 'rejected';
              return st || 'pending';
            })(),
            reason: item.reason || '',
            message: item.message || '',
            packageName: item.packageName,
            price: item.price,
            term: item.term,
            isPaid: item.isPaid,
            paymentMethod: item.paymentMethod
          }));
          setApiRequests(mapped);
        } else {
          setApiRequests([]);
          setError(data.message || 'Không thể tải danh sách đơn đăng ký.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch registrations error:', err);
          setError('Không thể tải danh sách đơn đăng ký.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
    return () => controller.abort();
  }, [clubId, statusFilter]);

  const displayRequests = apiRequests.length ? apiRequests : requests;

  const statusToDisplay = (statusRaw) => {
    const st = (statusRaw || '').toLowerCase();
    if (st === 'daduyet' || st === 'approved') return 'approved';
    if (st === 'tuchoi' || st === 'rejected') return 'rejected';
    return 'pending';
  };

  const updateStatus = async (request, statusValue) => {
    const subscriptionId = request.subscriptionId || request.id;
    if (!subscriptionId) return;
    setActionLoadingId(subscriptionId);
    setActionError('');
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('https://clubmanage.azurewebsites.net/api/registrations/approve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subscriptionId,
          status: statusValue
        }),
        signal: controller.signal
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
        setActionError(data.message || 'Không thể cập nhật trạng thái.');
        return;
      }
      const newStatus = statusToDisplay(statusValue);
      setApiRequests(prev =>
        prev.map(r =>
          (r.subscriptionId || r.id) === subscriptionId ? { ...r, status: newStatus } : r
        )
      );
      if (selectedRequest && (selectedRequest.subscriptionId || selectedRequest.id) === subscriptionId) {
        setSelectedRequest(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Approve/Reject error:', err);
        setActionError('Không thể cập nhật trạng thái.');
      }
    } finally {
      setActionLoadingId(null);
    }
    return () => controller.abort();
  };

  const handleApproveClick = (req) => {
    if (onApprove) onApprove(req.id);
    updateStatus(req, 'DaDuyet');
  };

  const handleRejectClick = (req) => {
    if (onReject) onReject(req.id);
    updateStatus(req, 'TuChoi');
  };

  const handleConfirmPayment = async (request, method = 'Offline') => {
    const subscriptionId = request.subscriptionId || request.id;
    if (!subscriptionId) return;
    setPaymentLoadingId(subscriptionId);
    setActionError('');
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('https://clubmanage.azurewebsites.net/api/registrations/confirm-payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subscriptionId,
          paymentMethod: method
        }),
        signal: controller.signal
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
        setActionError(data.message || 'Không thể xác nhận thanh toán.');
        return;
      }
      setApiRequests(prev =>
        prev.map(r =>
          (r.subscriptionId || r.id) === subscriptionId
            ? { ...r, isPaid: true, paymentMethod: method }
            : r
        )
      );
      if (selectedRequest && (selectedRequest.subscriptionId || selectedRequest.id) === subscriptionId) {
        setSelectedRequest(prev => ({ ...prev, isPaid: true, paymentMethod: method }));
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Confirm payment error:', err);
        setActionError('Không thể xác nhận thanh toán.');
      }
    } finally {
      setPaymentLoadingId(null);
    }
    return () => controller.abort();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-6">⏳</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Đang tải danh sách yêu cầu...</h2>
        <p className="text-gray-600">Vui lòng đợi trong giây lát.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không thể tải danh sách</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-amber-500', text: 'Chờ duyệt' },
      approved: { bg: 'bg-green-500', text: 'Đã chấp nhận' },
      rejected: { bg: 'bg-red-500', text: 'Đã từ chối' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase text-white whitespace-nowrap inline-block ${config.bg}`}>
        {config.text}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 m-0">Danh sách đơn đăng ký</h3>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-fpt-blue focus:border-fpt-blue"
            >
              <option value="All">Tất cả</option>
              <option value="ChoDuyet">Chờ duyệt</option>
              <option value="DaDuyet">Đã duyệt</option>
              <option value="TuChoi">Từ chối</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Tên sinh viên</th>
                <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Mã sinh viên</th>
                <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Ngày gửi</th>
                <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 text-center text-sm font-semibold whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-600">
                    <div className="text-4xl mb-3">✅</div>
                    <div className="text-lg font-semibold">Không có yêu cầu nào ở trạng thái này</div>
                    <div className="text-sm text-gray-500 mt-1">Hãy chọn trạng thái khác để xem các đơn khác.</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-start gap-2">
                      {request.status === 'approved' && request.isPaid && (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold border border-green-200 whitespace-nowrap">
                          ✅ Thanh toán thành công
                        </span>
                      )}
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveClick(request)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all whitespace-nowrap disabled:opacity-60"
                            disabled={actionLoadingId === (request.subscriptionId || request.id)}
                          >
                            {actionLoadingId === (request.subscriptionId || request.id) ? 'Đang duyệt...' : '✅ Chấp nhận'}
                          </button>
                          <button
                            onClick={() => handleRejectClick(request)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all whitespace-nowrap disabled:opacity-60"
                            disabled={actionLoadingId === (request.subscriptionId || request.id)}
                          >
                            {actionLoadingId === (request.subscriptionId || request.id) ? 'Đang cập nhật...' : '❌ Từ chối'}
                          </button>
                        </>
                      )}
                      {request.status === 'approved' && !request.isPaid && (
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="px-4 py-2 bg-fpt-blue text-white rounded-lg text-sm font-medium hover:bg-fpt-blue-light transition-all whitespace-nowrap"
                        >
                          Chi tiết
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveClick(request)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all whitespace-nowrap disabled:opacity-60"
                              disabled={actionLoadingId === (request.subscriptionId || request.id)}
                            >
                              {actionLoadingId === (request.subscriptionId || request.id) ? 'Đang duyệt...' : '✅ Chấp nhận'}
                            </button>
                            <button
                              onClick={() => handleRejectClick(request)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all whitespace-nowrap disabled:opacity-60"
                              disabled={actionLoadingId === (request.subscriptionId || request.id)}
                            >
                              {actionLoadingId === (request.subscriptionId || request.id) ? 'Đang cập nhật...' : '❌ Từ chối'}
                            </button>
                          </>
                        )}
                        {request.status === 'approved' && !request.isPaid && (
                          <button
                            onClick={() => handleConfirmPayment(request)}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-all whitespace-nowrap disabled:opacity-60"
                            disabled={paymentLoadingId === (request.subscriptionId || request.id)}
                          >
                            {paymentLoadingId === (request.subscriptionId || request.id) ? 'Đang xác nhận...' : '✓ Xác nhận đã thu phí'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
              {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
              <h2 className="text-2xl font-bold m-0">Chi tiết yêu cầu tham gia</h2>
              <button 
                className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 m-0">{selectedRequest.studentName}</h3>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="text-sm text-gray-500">
                  Email: {selectedRequest.studentEmail}
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">Mã sinh viên:</label>
                    <p className="text-gray-800 m-0">{selectedRequest.studentId || '-'}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">Số điện thoại:</label>
                    <p className="text-gray-800 m-0">{selectedRequest.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">Chuyên ngành:</label>
                    <p className="text-gray-800 m-0">{selectedRequest.major || '-'}</p>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">Ngày gửi yêu cầu:</label>
                    <p className="text-gray-800 m-0">{new Date(selectedRequest.requestDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                {selectedRequest.reason && (
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">Lý do gia nhập:</label>
                    <p className="text-gray-800 leading-relaxed m-0 bg-gray-50 p-4 rounded-lg">{selectedRequest.reason}</p>
                  </div>
                )}

                {selectedRequest.message && (
                  <div>
                    <label className="font-semibold text-gray-700 block mb-2">Tin nhắn:</label>
                    <p className="text-gray-800 leading-relaxed m-0 bg-gray-50 p-4 rounded-lg italic">{selectedRequest.message}</p>
                  </div>
                )}
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-4 justify-end mt-8 pt-5 border-t-2 border-gray-100">
                  <button
                    onClick={() => {
                      handleRejectClick(selectedRequest);
                      setShowDetailModal(false);
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-red-500 text-white hover:bg-red-600 shadow-lg hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"
                    disabled={actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id)}
                  >
                    {actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id) ? 'Đang cập nhật...' : 'Từ chối'}
                  </button>
                  <button
                    onClick={() => {
                      handleApproveClick(selectedRequest);
                      setShowDetailModal(false);
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"
                    disabled={actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id)}
                  >
                    {actionLoadingId === (selectedRequest.subscriptionId || selectedRequest.id) ? 'Đang duyệt...' : 'Chấp nhận'}
                  </button>
                </div>
              )}
              {selectedRequest.status === 'approved' && !selectedRequest.isPaid && (
                <div className="flex gap-4 justify-end mt-6 pt-4 border-t-2 border-gray-100">
                  <button
                    onClick={() => {
                      handleConfirmPayment(selectedRequest);
                      setShowDetailModal(false);
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"
                    disabled={paymentLoadingId === (selectedRequest.subscriptionId || selectedRequest.id)}
                  >
                    {paymentLoadingId === (selectedRequest.subscriptionId || selectedRequest.id) ? 'Đang xác nhận...' : 'Xác nhận đã thu phí'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {actionError && (
        <div className="mt-4 text-center text-red-600 text-sm">{actionError}</div>
      )}
    </>
  );
};

export default JoinRequestsList;


