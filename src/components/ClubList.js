import React, { useState } from 'react';

const ClubList = ({ clubs, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || club.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || club.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(clubs.map(club => club.category))];
  const statuses = [...new Set(clubs.map(club => club.status))];

  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('hoạt động')) {
      return 'bg-green-500 text-white';
    } else if (statusLower.includes('tạm ngưng')) {
      return 'bg-orange-500 text-white';
    } else if (statusLower.includes('ngừng')) {
      return 'bg-red-500 text-white';
    }
    return 'bg-gray-500 text-white';
  };

  return (
    <div className="p-5">
      <div className="bg-white p-5 rounded-lg shadow-md mb-8">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm câu lạc bộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 text-base border-2 border-gray-300 rounded-lg transition-all focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg bg-white cursor-pointer transition-all flex-1 min-w-[200px] focus:outline-none focus:border-green-500"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg bg-white cursor-pointer transition-all flex-1 min-w-[200px] focus:outline-none focus:border-green-500"
          >
            <option value="all">Tất cả trạng thái</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
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
          filteredClubs.map(club => (
            <div key={club.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-5 flex justify-between items-center">
                <h3 className="m-0 text-xl font-semibold">{club.name}</h3>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${getStatusBadgeClass(club.status)}`}>
                  {club.status}
                </span>
              </div>
              <div className="p-5">
                <p className="text-gray-600 mb-5 leading-relaxed min-h-[50px]">{club.description}</p>
                <div className="flex flex-col gap-2.5">
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
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex gap-2.5 justify-end">
                <button 
                  onClick={() => onView(club)} 
                  className="px-4 py-2 border-none rounded-md text-sm font-medium cursor-pointer transition-all bg-gradient-to-r from-fpt-blue-light to-fpt-blue text-white shadow-md hover:bg-gradient-to-l hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Xem chi tiết
                </button>
                <button 
                  onClick={() => onEdit(club)} 
                  className="px-4 py-2 border-none rounded-md text-sm font-medium cursor-pointer transition-all bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:bg-gradient-to-l hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Sửa
                </button>
                <button 
                  onClick={() => onDelete(club.id)} 
                  className="px-4 py-2 border-none rounded-md text-sm font-medium cursor-pointer transition-all bg-red-500 text-white hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClubList;

