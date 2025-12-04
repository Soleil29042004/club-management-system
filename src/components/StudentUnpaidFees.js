import React from 'react';

const StudentUnpaidFees = ({ unpaidFees, onPayment }) => {
  if (unpaidFees.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bạn đã nộp đủ tất cả các phí!</h2>
        <p className="text-gray-600">Không có phí nào cần nộp tại thời điểm này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {unpaidFees.map((item) => (
        <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 m-0 mb-2">{item.clubName}</h3>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                {item.club.category}
              </span>
            </div>
            <span className="px-4 py-2 bg-red-500 text-white rounded-full text-xs font-semibold uppercase">
              Chưa nộp
            </span>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium mb-1">Ngày được chấp nhận:</span>
                <span className="text-sm font-semibold text-gray-800">{item.requestDate}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium mb-1">Chủ tịch:</span>
                <span className="text-sm font-semibold text-gray-800">{item.club.president}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium mb-1">Địa điểm:</span>
                <span className="text-sm font-semibold text-gray-800">{item.club.location}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium mb-1">Số thành viên:</span>
                <span className="text-sm font-semibold text-gray-800">{item.club.memberCount}</span>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-fpt-blue mt-4">
              {item.club.description}
            </p>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
            <button
              onClick={() => onPayment(item.club)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:bg-gradient-to-l hover:-translate-y-0.5 hover:shadow-lg transition-all shadow-md"
            >
              💰 Nộp phí ngay
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentUnpaidFees;

