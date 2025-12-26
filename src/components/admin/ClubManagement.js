/**
 * ClubManagement Component
 * 
 * Component quản lý clubs cho admin:
 * - Hiển thị danh sách clubs với search và filter
 * - Thêm, sửa, xóa clubs
 * - Xem chi tiết club
 * 
 * @param {Object} props
 * @param {Array} props.clubs - Danh sách clubs
 * @param {Function} props.setClubs - Callback để update clubs state
 */

import React, { useState, useEffect } from 'react';
import ClubList from './ClubList';
import ClubForm from './ClubForm';
import { clubCategoryLabels } from '../../data/constants';
import { useToast } from '../shared/Toast';
import { API_BASE_URL, apiRequest } from '../../utils/api';
import { mapApiClubToComponent } from '../../utils/clubMapper';

const ClubManagement = ({ clubs, setClubs }) => {
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [viewingClub, setViewingClub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  /**
   * FUNCTION: HANDLE ADD
   * 
   * MỤC ĐÍCH: Mở form để thêm club mới
   */
  const handleAdd = () => {
    setEditingClub(null);
    setShowForm(true);
  };

  /**
   * FUNCTION: HANDLE EDIT
   * 
   * MỤC ĐÍCH: Mở form để chỉnh sửa club
   * 
   * @param {Object} club - Club object cần chỉnh sửa
   */
  const handleEdit = (club) => {
    setEditingClub(club);
    setShowForm(true);
  };

  /**
   * FUNCTION: HANDLE DELETE
   * 
   * MỤC ĐÍCH: Xóa club khỏi hệ thống
   * 
   * FLOW:
   * 1. Confirm với user trước khi xóa
   * 2. Gọi API DELETE /clubs/{clubId}
   * 3. Xóa club khỏi local state
   * 4. Refresh clubs list để đảm bảo consistency
   * 
   * @param {string|number} clubId - ID của club cần xóa
   */
  const handleDelete = async (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    if (!club) {
      showToast('Không tìm thấy câu lạc bộ.', 'error');
      return;
    }

    // Xác nhận trước khi xóa
    if (!window.confirm(`Bạn có chắc chắn muốn xóa câu lạc bộ "${club.name}"?\n\nLưu ý: Chủ tịch sẽ được chuyển về Sinh viên và tất cả đăng ký sẽ bị xóa.`)) {
      return;
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
      return;
    }

    setDeleteLoadingId(clubId);
    setError(null);

      try {
        // ========== API CALL: DELETE /clubs/{clubId} - Delete Club ==========
        // Mục đích: Admin xóa club khỏi hệ thống (chủ tịch sẽ được chuyển về Sinh viên)
        // Response: Success message
        const data = await apiRequest(`/clubs/${clubId}`, {
          method: 'DELETE',
          token
        });

      // Xóa club khỏi local state
      setClubs(clubs.filter(c => c.id !== clubId));
      showToast(`Đã xóa câu lạc bộ "${club.name}" thành công.`, 'success');
      
      // Refresh clubs list để đảm bảo consistency
      fetchClubs(filterCategory, searchTerm);
    } catch (error) {
      if (error.status === 401) {
        showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
      } else {
        console.error('Delete club error:', error);
        const errorMessage = error.data?.message || 'Đã xảy ra lỗi khi xóa câu lạc bộ. Vui lòng thử lại.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } finally {
      setDeleteLoadingId(null);
    }
  };

  /**
   * FUNCTION: HANDLE VIEW
   * 
   * MỤC ĐÍCH: Mở modal xem chi tiết club
   * 
   * @param {Object} club - Club object cần xem chi tiết
   */
  const handleView = (club) => {
    setViewingClub(club);
  };

  /**
   * FUNCTION: HANDLE SUBMIT
   * 
   * MỤC ĐÍCH: Xử lý khi submit form (thêm hoặc sửa club)
   * 
   * FLOW:
   * - Nếu editingClub có giá trị → Gọi API PUT /clubs/{clubId} để cập nhật
   * - Nếu không → Hiện tại chưa hỗ trợ tạo club mới (form chỉ có logo, description, location)
   * 
   * @param {Object} formData - Dữ liệu form từ ClubForm
   */
  const handleSubmit = async (formData) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
      return;
    }

    if (editingClub) {
      // Update existing club
      const clubId = editingClub.id || editingClub.clubId;
      if (!clubId) {
        showToast('Không tìm thấy ID câu lạc bộ.', 'error');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // ========== API CALL: PUT /clubs/{clubId} - Update Club Info ==========
        // Mục đích: Admin cập nhật thông tin CLB (logo, description, location, email)
        // Request body: { logo, description, location, email }
        // Response: Updated club object
        const payload = {
          logo: formData.logo || null,
          description: formData.description || '',
          location: formData.location || '',
          email: formData.email || ''
        };

        const data = await apiRequest(`/clubs/${clubId}`, {
          method: 'PUT',
          body: payload,
          token
        });

        // Map response và cập nhật clubs state
        const updatedClub = mapApiClubToComponent(data.result || {});
        setClubs(clubs.map(club => 
          club.id === clubId || club.clubId === clubId ? updatedClub : club
        ));
        
        setShowForm(false);
        setEditingClub(null);
        showToast('Cập nhật thông tin câu lạc bộ thành công!', 'success');
        
        // Refresh clubs list để đảm bảo consistency
        fetchClubs(filterCategory, searchTerm);
      } catch (error) {
        if (error.status === 401) {
          showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
        } else {
          console.error('Update club error:', error);
          const errorMessage = error.data?.message || error.message || 'Đã xảy ra lỗi khi cập nhật câu lạc bộ. Vui lòng thử lại.';
          setError(errorMessage);
          showToast(errorMessage, 'error');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Add new club - Hiện tại form chỉ có logo, description, location
      // Không đủ thông tin để tạo club mới, nên chỉ hiển thị thông báo
      showToast('Chức năng tạo câu lạc bộ mới chưa được hỗ trợ. Vui lòng sử dụng chức năng đăng ký CLB từ trang sinh viên.', 'info');
      setShowForm(false);
      setEditingClub(null);
    }
  };

  /**
   * FUNCTION: HANDLE CANCEL
   * 
   * MỤC ĐÍCH: Đóng form và reset editingClub
   */
  const handleCancel = () => {
    setShowForm(false);
    setEditingClub(null);
  };

  /**
   * FUNCTION: CLOSE VIEW MODAL
   * 
   * MỤC ĐÍCH: Đóng modal xem chi tiết club
   */
  const closeViewModal = () => {
    setViewingClub(null);
  };

  /**
   * FUNCTION: FETCH CLUBS
   * 
   * MỤC ĐÍCH: Lấy danh sách clubs từ API với search và filter
   * 
   * FLOW:
   * 1. Build URL với query parameters (category, name)
   * 2. Gọi API GET /clubs với query params
   * 3. Map dữ liệu từ API format sang component format
   * 4. Cập nhật clubs state
   * 
   * @param {string} category - Category filter (optional, 'all' để bỏ filter)
   * @param {string} searchName - Search term (optional)
   */
  const fetchClubs = async (category = null, searchName = '') => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      // Build URL với query parameters cho filter và search
      let endpoint = '/clubs';
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('category', category);
      }
      if (searchName && searchName.trim()) {
        params.append('name', searchName.trim());
      }
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

        // ========== API CALL: GET /clubs - List Clubs (with filters) ==========
        // Mục đích: Admin lấy danh sách clubs với search và filter
        // Query params: ?category={category}&name={searchName}
        // Response: Array of club objects
        const data = await apiRequest(endpoint, {
          method: 'GET',
          token
        });

      // Map API data sang component format
      const mappedClubs = (data.result || []).map(mapApiClubToComponent);
      setClubs(mappedClubs);
    } catch (error) {
      if (error.status === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        console.error('Fetch clubs error:', error);
        setError(error.data?.message || 'Đã xảy ra lỗi khi tải danh sách câu lạc bộ. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * USE EFFECT: FETCH CLUBS ON MOUNT/FILTER CHANGE
   * 
   * KHI NÀO CHẠY: Khi filterCategory hoặc searchTerm thay đổi
   * 
   * MỤC ĐÍCH: Fetch clubs từ API khi filter hoặc search thay đổi
   * 
   * LOGIC:
   * - Debounce search: nếu có searchTerm, đợi 500ms trước khi fetch
   * - Nếu chỉ filterCategory thay đổi, fetch ngay
   * 
   * DEPENDENCIES: [filterCategory, searchTerm]
   */
  useEffect(() => {
    let timeoutId;
    
    // Debounce search: nếu có searchTerm, đợi 500ms trước khi fetch
    // Nếu chỉ filterCategory thay đổi, fetch ngay
    if (searchTerm) {
      timeoutId = setTimeout(() => {
        fetchClubs(filterCategory, searchTerm);
      }, 500);
    } else {
      fetchClubs(filterCategory, searchTerm);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, searchTerm]);

  /**
   * FUNCTION: HANDLE SEARCH CHANGE
   * 
   * MỤC ĐÍCH: Cập nhật searchTerm state (sẽ trigger useEffect để fetch clubs)
   * 
   * @param {string} term - Search term mới
   */
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  /**
   * FUNCTION: HANDLE CATEGORY CHANGE
   * 
   * MỤC ĐÍCH: Cập nhật filterCategory state (sẽ trigger useEffect để fetch clubs)
   * 
   * @param {string} category - Category filter mới
   */
  const handleCategoryChange = (category) => {
    setFilterCategory(category);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 p-8 md:p-9 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg mb-9 border border-fpt-blue/10">
        <div>
          <h1 className="m-0 mb-2.5 text-fpt-blue text-[34px] md:text-3xl font-bold tracking-tight">Quản lý Câu lạc bộ</h1>
          <p className="m-0 text-gray-600 text-base font-medium">Quản lý thông tin các câu lạc bộ trong trường</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <ClubList
        clubs={clubs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterCategory={filterCategory}
        onCategoryChange={handleCategoryChange}
        deleteLoadingId={deleteLoadingId}
      />

      {showForm && (
        <ClubForm
          club={editingClub}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {viewingClub && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5" onClick={closeViewModal}>
          <div className="bg-white rounded-xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl">
              <h2 className="m-0 text-2xl font-semibold">Chi tiết câu lạc bộ</h2>
              <button 
                className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
                onClick={closeViewModal}
              >
                &times;
              </button>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <h3 className="m-0 mb-2.5 text-2xl text-gray-800 inline-block mr-4">{viewingClub.name}</h3>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${
                  viewingClub.status.toLowerCase().includes('hoạt động') ? 'bg-green-500 text-white' :
                  viewingClub.status.toLowerCase().includes('tạm ngưng') ? 'bg-orange-500 text-white' :
                  viewingClub.status.toLowerCase().includes('ngừng') ? 'bg-red-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {viewingClub.status}
                </span>
              </div>
              <div className="mb-6">
                <label className="font-semibold text-gray-600 block mb-2">Mô tả:</label>
                <p className="text-gray-800 leading-relaxed m-0">{viewingClub.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-semibold text-gray-600 block mb-1.5 text-sm">Danh mục:</label>
                  <p className="text-gray-800 m-0 text-base">{viewingClub.category ? (clubCategoryLabels[viewingClub.category] || viewingClub.category) : 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1.5 text-sm">Chủ tịch:</label>
                  <p className="text-gray-800 m-0 text-base">{viewingClub.president}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1.5 text-sm">Email:</label>
                  <p className="text-gray-800 m-0 text-base">{viewingClub.email}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1.5 text-sm">Địa điểm:</label>
                  <p className="text-gray-800 m-0 text-base">{viewingClub.location}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1.5 text-sm">Ngày thành lập:</label>
                  <p className="text-gray-800 m-0 text-base">{new Date(viewingClub.foundedDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-600 block mb-1.5 text-sm">Số thành viên:</label>
                  <p className="text-gray-800 m-0 text-base">{viewingClub.memberCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManagement;

