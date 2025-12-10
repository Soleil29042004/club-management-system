import React, { useState } from 'react';

const StudentClubList = ({ 
  clubs, 
  joinRequests, 
  payments, 
  onJoinRequest, 
  getRequestStatus, 
  hasPayment,
  onViewDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = (club.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (club.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || club.category === filterCategory;
    const activeStatuses = ['Hoạt động', 'HoatDong', 'DangHoatDong', 'Active', 'ACTIVE', undefined, null, ''];
    const isActive = activeStatuses.includes(club.status);
    return matchesSearch && matchesCategory && isActive;
  });

  const categories = [...new Set(clubs.map(club => club.category || 'Khác'))];

  return (
    <div>
      <div className="bg-white p-5 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm câu lạc bộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 text-base border-2 border-gray-300 rounded-lg transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
          />
        </div>
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg bg-white cursor-pointer transition-all focus:outline-none focus:border-fpt-blue"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-500 text-lg col-span-full">
            <p>Không tìm thấy câu lạc bộ nào</p>
          </div>
        ) : (
          filteredClubs.map(club => {
            const requestStatus = getRequestStatus(club.id);
            const paid = hasPayment(club.id);
            
            return (
              <div key={club.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
                <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-5 flex justify-between items-center">
                  <h3 className="m-0 text-xl font-semibold flex-1">{club.name}</h3>
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase bg-green-500 text-white">
                    {club.status}
                  </span>
                </div>
                
                <div className="p-5">
                  <p className="text-gray-600 mb-5 leading-relaxed min-h-[50px]">{club.description}</p>
                  <div className="flex flex-col gap-2.5 mb-5">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Danh mục:</span>
                      <span className="text-gray-800 font-semibold">{club.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Chủ tịch:</span>
                      <span className="text-gray-800 font-semibold">{club.president}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Số thành viên:</span>
                      <span className="text-gray-800 font-semibold">{club.memberCount}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Địa điểm:</span>
                      <span className="text-gray-800 font-semibold">{club.location}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500 font-medium">Phí tham gia:</span>
                      <span className="text-gray-800 font-semibold">
                        {club.participationFee 
                          ? `${club.participationFee.toLocaleString('vi-VN')} VNĐ / ${club.membershipDuration || 6} tháng`
                          : `Miễn phí / ${club.membershipDuration || 6} tháng`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 flex flex-col gap-2.5">
                  <button 
                    onClick={() => onViewDetails && onViewDetails(club)} 
                    className="px-4 py-2 border-none rounded-md text-sm font-medium cursor-pointer transition-all bg-gradient-to-r from-fpt-blue-light to-fpt-blue text-white shadow-md hover:bg-gradient-to-l hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    📋 Chi tiết
                  </button>
                  
                  {requestStatus === 'pending' && (
                    <span className="px-4 py-2 text-center rounded-md text-sm font-semibold bg-amber-500 text-white">
                      Đang chờ duyệt
                    </span>
                  )}
                  {requestStatus === 'approved' && (
                    <span className="px-4 py-2 text-center rounded-md text-sm font-semibold bg-green-500 text-white">
                      Đã được chấp nhận
                    </span>
                  )}
                  {requestStatus === 'rejected' && (
                    <span className="px-4 py-2 text-center rounded-md text-sm font-semibold bg-red-500 text-white">
                      Đã bị từ chối
                    </span>
                  )}
                  {!requestStatus && (
                    <button 
                      onClick={() => onJoinRequest(club)} 
                      className="px-4 py-2 border-none rounded-md text-sm font-medium cursor-pointer transition-all bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:bg-gradient-to-l hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      Gửi yêu cầu tham gia
                    </button>
                  )}
                  {paid && (
                    <span className="px-4 py-2 text-center rounded-md text-sm font-semibold bg-blue-500 text-white">
                      ✓ Đã nộp phí
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentClubList;

