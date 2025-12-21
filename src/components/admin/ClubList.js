/**
 * ClubList Component
 * 
 * Component hiển thị danh sách clubs dưới dạng table:
 * - Search và filter theo category
 * - Hiển thị thông tin clubs: tên, danh mục, chủ tịch, số thành viên, địa điểm, trạng thái
 * - Actions: xem chi tiết, xóa club
 * - Hỗ trợ controlled/uncontrolled mode cho search và filter
 * 
 * @param {Object} props
 * @param {Array} props.clubs - Danh sách clubs cần hiển thị
 * @param {Function} props.onEdit - Callback khi click edit (không dùng trong component này)
 * @param {Function} props.onDelete - Callback khi click xóa club
 * @param {Function} props.onView - Callback khi click xem chi tiết
 * @param {boolean} props.loading - Trạng thái loading
 * @param {string} props.searchTerm - Search term từ parent (controlled mode)
 * @param {Function} props.onSearchChange - Callback khi search thay đổi
 * @param {string} props.filterCategory - Category filter từ parent (controlled mode)
 * @param {Function} props.onCategoryChange - Callback khi category filter thay đổi
 * @param {string|number} props.deleteLoadingId - ID của club đang được xóa
 */

import React, { useState } from 'react';
import { clubCategories, clubCategoryLabels } from '../../data/constants';

const ClubList = ({ 
  clubs, 
  onEdit, 
  onDelete, 
  onView,
  loading = false,
  searchTerm: externalSearchTerm = '',
  onSearchChange,
  filterCategory: externalFilterCategory = 'all',
  onCategoryChange,
  deleteLoadingId = null
}) => {
  // Hỗ trợ cả controlled và uncontrolled mode
  // Nếu parent truyền searchTerm/filterCategory, dùng controlled mode
  // Nếu không, dùng internal state (uncontrolled mode)
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [internalFilterCategory, setInternalFilterCategory] = useState('all');

  // Sử dụng external values nếu có, nếu không dùng internal state
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const filterCategory = externalFilterCategory !== undefined ? externalFilterCategory : internalFilterCategory;

  /**
   * FUNCTION: HANDLE SEARCH CHANGE
   * 
   * MỤC ĐÍCH: Xử lý khi search term thay đổi
   * 
   * LOGIC:
   * - Nếu có onSearchChange callback (controlled mode) → Gọi callback để parent xử lý
   * - Nếu không có callback (uncontrolled mode) → Cập nhật internal state
   * 
   * @param {string} value - Search term mới
   */
  const handleSearchChange = (value) => {
    if (onSearchChange) {
      // Controlled mode: gọi callback của parent
      onSearchChange(value);
    } else {
      // Uncontrolled mode: cập nhật internal state
      setInternalSearchTerm(value);
    }
  };

  /**
   * FUNCTION: HANDLE CATEGORY CHANGE
   * 
   * MỤC ĐÍCH: Xử lý khi category filter thay đổi
   * 
   * LOGIC:
   * - Nếu có onCategoryChange callback (controlled mode) → Gọi callback để parent xử lý
   * - Nếu không có callback (uncontrolled mode) → Cập nhật internal state
   * 
   * @param {string} value - Category mới
   */
  const handleCategoryChange = (value) => {
    if (onCategoryChange) {
      // Controlled mode: gọi callback của parent
      onCategoryChange(value);
    } else {
      // Uncontrolled mode: cập nhật internal state
      setInternalFilterCategory(value);
    }
  };

  // Không cần filter ở client vì search và category đã được filter ở server
  // Server trả về danh sách đã được filter rồi
  const filteredClubs = clubs;

  // Luôn sử dụng danh sách categories từ constants
  // Để dropdown không bị mất options khi filter
  const categories = clubCategories;

  /**
   * FUNCTION: GET STATUS BADGE CLASS
   * 
   * MỤC ĐÍCH: Lấy CSS class cho status badge dựa trên trạng thái
   * 
   * LOGIC:
   * - "hoạt động" → bg-green-500 (xanh lá)
   * - "tạm ngưng" → bg-orange-500 (cam)
   * - "ngừng" → bg-red-500 (đỏ)
   * - Mặc định → bg-gray-500 (xám)
   * 
   * @param {string} status - Trạng thái của club
   * @returns {string} - Tailwind CSS classes
   */
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
            placeholder="Tìm kiếm câu lạc bộ theo tên (tìm kiếm từ server)..."
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {club.category ? (clubCategoryLabels[club.category] || club.category) : 'Chưa cập nhật'}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase text-white ${getStatusBadgeClass(club.status)}`}>
                          {club.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => onView(club)} 
                            className="px-2 py-1 bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white rounded text-xs font-medium hover:bg-gradient-to-l transition-all shadow-sm hover:shadow-md"
                          >
                            Chi tiết
                          </button>
                          <button 
                            onClick={() => onDelete(club.id)} 
                            disabled={deleteLoadingId === club.id}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteLoadingId === club.id ? 'Đang xóa...' : 'Xóa'}
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

