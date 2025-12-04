import React from 'react';

const StudentStats = ({ requestsCount, paymentsCount, unpaidFeesCount, clubsCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg border border-fpt-blue/8">
        <div className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex-shrink-0">
          📋
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-1">Yêu cầu đã gửi</h3>
          <p className="text-3xl font-bold text-fpt-blue m-0">{requestsCount}</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg border border-fpt-blue/8">
        <div className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex-shrink-0">
          💰
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-1">Đã nộp phí</h3>
          <p className="text-3xl font-bold text-fpt-blue m-0">{paymentsCount}</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg border border-fpt-blue/8">
        <div className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex-shrink-0">
          ⚠️
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-1">Phí chưa nộp</h3>
          <p className="text-3xl font-bold text-fpt-blue m-0">{unpaidFeesCount}</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg border border-fpt-blue/8">
        <div className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-fpt-blue to-fpt-blue-light flex-shrink-0">
          🏛️
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-1">CLB đang hoạt động</h3>
          <p className="text-3xl font-bold text-fpt-blue m-0">{clubsCount}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentStats;


