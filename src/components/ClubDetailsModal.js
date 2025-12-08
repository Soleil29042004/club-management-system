import React from 'react';

const ClubDetailsModal = ({ club, onClose }) => {
  if (!club) return null;

  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('hoạt động')) return 'bg-green-500 text-white';
    if (statusLower.includes('tạm ngưng')) return 'bg-orange-500 text-white';
    if (statusLower.includes('ngừng')) return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl my-5" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
          <h2 className="text-2xl font-bold m-0">Chi tiết câu lạc bộ</h2>
          <button 
            className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 m-0">{club.name}</h3>
            <span className={`px-4 py-2 rounded-full text-xs font-semibold uppercase ${getStatusBadgeClass(club.status)}`}>
              {club.status}
            </span>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Danh mục:</span>
                <span className="text-sm font-semibold text-gray-800">{club.category}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Chủ tịch:</span>
                <span className="text-sm font-semibold text-gray-800">{club.president}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Số thành viên:</span>
                <span className="text-sm font-semibold text-gray-800">{club.memberCount}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Địa điểm:</span>
                <span className="text-sm font-semibold text-gray-800">{club.location}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Email:</span>
                <span className="text-sm font-semibold text-gray-800 break-all">{club.email}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Ngày thành lập:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {club.foundedDate ? new Date(club.foundedDate).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg md:col-span-2">
                <span className="text-xs text-gray-500 font-medium mb-1">Phí tham gia:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {club.participationFee ? `${club.participationFee.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Mô tả</h4>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-fpt-blue">
              {club.description}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Hoạt động của club</h4>
            {club.activities && club.activities.length > 0 ? (
              <div className="space-y-4">
                {club.activities.map((activity, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-fpt-blue hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                      <h5 className="text-lg font-semibold text-gray-800 m-0">{activity.title}</h5>
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <span>📅</span>
                        {activity.date ? new Date(activity.date).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-gray-600 leading-relaxed mb-3">{activity.description}</p>
                    )}
                    {activity.location && (
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span>📍</span>
                        {activity.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-8 bg-gray-50 rounded-lg">
                Chưa có hoạt động nào được ghi nhận.
              </p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t-2 border-gray-200 rounded-b-xl">
          <button 
            className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg hover:-translate-y-1 hover:shadow-xl" 
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubDetailsModal;

