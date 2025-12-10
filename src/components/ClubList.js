import React, { useState } from 'react';
import { clubCategories, clubCategoryLabels } from '../data/mockData';

const ClubList = ({ 
  clubs, 
  onEdit, 
  onDelete, 
  onView,
  loading = false,
  searchTerm: externalSearchTerm = '',
  onSearchChange,
  filterCategory: externalFilterCategory = 'all',
  onCategoryChange
}) => {
  // Use external search and filter if provided, otherwise use internal state
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [internalFilterCategory, setInternalFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const filterCategory = externalFilterCategory !== undefined ? externalFilterCategory : internalFilterCategory;

  const handleSearchChange = (value) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchTerm(value);
    }
  };

  const handleCategoryChange = (value) => {
    if (onCategoryChange) {
      onCategoryChange(value);
    } else {
      setInternalFilterCategory(value);
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase());
    // Match by category code or display name
    const matchesCategory = filterCategory === 'all' || 
                            club.category === filterCategory || 
                            club.categoryCode === filterCategory;
    const matchesStatus = filterStatus === 'all' || club.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories from clubs or use predefined categories
  const categories = clubs.length > 0 
    ? [...new Set(clubs.map(club => club.categoryCode || club.category).filter(Boolean))]
    : clubCategories;
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
            placeholder="Tìm kiếm câu lạc bộ theo tên..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-5 py-3 text-base border-2 border-gray-300 rounded-lg transition-all focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg bg-white cursor-pointer transition-all flex-1 min-w-[200px] focus:outline-none focus:border-green-500"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {clubCategoryLabels[category] || category}
              </option>
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

      {loading ? (
        <div className="text-center py-16 px-5 text-gray-500 text-lg">
          <div className="animate-spin inline-block w-10 h-10 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full mb-4"></div>
          <p>Đang tải danh sách câu lạc bộ...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredClubs.length === 0 ? (
            <div className="text-center py-16 px-5 text-gray-500 text-lg">
              <p className="text-6xl mb-4">📭</p>
              <p>Không tìm thấy câu lạc bộ nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tên câu lạc bộ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Danh mục</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Chủ tịch</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Số thành viên</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Địa điểm</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClubs.map(club => (
                    <tr key={club.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{club.name}</div>
                        {club.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-md">
                            {club.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {club.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {club.president || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {club.memberCount || 0}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {club.location || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase text-white ${getStatusBadgeClass(club.status)}`}>
                          {club.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => onView(club)} 
                            className="px-4 py-2 bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white rounded-lg text-sm font-medium hover:bg-gradient-to-l transition-all shadow-md hover:shadow-lg"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClubList;

