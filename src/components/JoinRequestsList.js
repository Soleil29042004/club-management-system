import React from 'react';

const JoinRequestsList = ({ requests, onApprove, onReject }) => {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không có yêu cầu nào đang chờ duyệt</h2>
        <p className="text-gray-600">Tất cả các yêu cầu đã được xử lý.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 m-0 mb-2">{request.studentName}</h3>
              <span className="text-gray-600 text-sm">{request.studentEmail}</span>
            </div>
            <span className="px-4 py-2 bg-amber-500 text-white rounded-full text-xs font-semibold uppercase">
              Đang chờ
            </span>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium mb-1">Ngày gửi yêu cầu:</span>
                <span className="text-sm font-semibold text-gray-800">{request.requestDate}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium mb-1">Câu lạc bộ:</span>
                <span className="text-sm font-semibold text-gray-800">{request.clubName}</span>
              </div>
              {request.studentId && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium mb-1">Mã sinh viên:</span>
                  <span className="text-sm font-semibold text-gray-800">{request.studentId}</span>
                </div>
              )}
              {request.phone && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium mb-1">Số điện thoại:</span>
                  <span className="text-sm font-semibold text-gray-800">{request.phone}</span>
                </div>
              )}
              {request.major && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium mb-1">Chuyên ngành:</span>
                  <span className="text-sm font-semibold text-gray-800">{request.major}</span>
                </div>
              )}
              {request.startDate && request.endDate && (
                <div className="flex flex-col md:col-span-2">
                  <span className="text-xs text-gray-500 font-medium mb-1">Thời gian tham gia:</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {request.startDate} - {request.endDate}
                  </span>
                </div>
              )}
            </div>
            
            {request.reason && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-fpt-blue">
                <strong className="text-sm text-gray-700 block mb-2">Lý do gia nhập:</strong>
                <p className="text-sm text-gray-600 m-0">{request.reason}</p>
              </div>
            )}
            {request.message && (
              <p className="mt-4 text-sm text-gray-600 italic">{request.message}</p>
            )}
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
            <button
              onClick={() => onReject(request.id)}
              className="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg"
            >
              ❌ Từ chối
            </button>
            <button
              onClick={() => onApprove(request.id)}
              className="px-6 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg"
            >
              ✅ Chấp nhận
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JoinRequestsList;

