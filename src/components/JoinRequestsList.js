import React, { useState } from 'react';

const JoinRequestsList = ({ requests, onApprove, onReject }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không có yêu cầu nào đang chờ duyệt</h2>
        <p className="text-gray-600">Tất cả các yêu cầu đã được xử lý.</p>
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
              {requests.map((request) => (
                <tr key={`${request.id}-${request.status}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-800">{request.studentName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{request.studentEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-800">{request.studentId || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-start gap-2">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="px-4 py-2 bg-fpt-blue text-white rounded-lg text-sm font-medium hover:bg-fpt-blue-light transition-all whitespace-nowrap"
                      >
                        Chi tiết
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApprove(request.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all whitespace-nowrap"
                          >
                            ✅ Chấp nhận
                          </button>
                          <button
                            onClick={() => onReject(request.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all whitespace-nowrap"
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
                      onReject(selectedRequest.id);
                      setShowDetailModal(false);
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-red-500 text-white hover:bg-red-600 shadow-lg hover:-translate-y-1 hover:shadow-xl"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => {
                      onApprove(selectedRequest.id);
                      setShowDetailModal(false);
                    }}
                    className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
                  >
                    Chấp nhận
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JoinRequestsList;

