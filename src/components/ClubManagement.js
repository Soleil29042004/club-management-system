import React, { useState, useEffect } from 'react';
import ClubList from './ClubList';
import ClubForm from './ClubForm';
import { clubCategoryLabels } from '../data/constants';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

const ClubManagement = ({ clubs, setClubs }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [viewingClub, setViewingClub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const handleAdd = () => {
    setEditingClub(null);
    setShowForm(true);
  };

  const handleEdit = (club) => {
    setEditingClub(club);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu lạc bộ này?')) {
      setClubs(clubs.filter(club => club.id !== id));
    }
  };

  const handleView = (club) => {
    setViewingClub(club);
  };

  const handleSubmit = (formData) => {
    if (editingClub) {
      // Update existing club
      setClubs(clubs.map(club => 
        club.id === editingClub.id ? { ...formData, id: editingClub.id } : club
      ));
    } else {
      // Add new club - ID will be assigned by API
      const newClub = {
        ...formData
      };
      setClubs([...clubs, newClub]);
    }
    setShowForm(false);
    setEditingClub(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClub(null);
  };

  const closeViewModal = () => {
    setViewingClub(null);
  };

  // Map API data to component format
  const mapApiDataToClub = (apiClub) => {
    return {
      id: apiClub.clubId,
      name: apiClub.clubName,
      description: apiClub.description || '',
      category: clubCategoryLabels[apiClub.category] || apiClub.category,
      categoryCode: apiClub.category, // Keep original category code
      foundedDate: apiClub.establishedDate,
      president: apiClub.founderName || '',
      memberCount: apiClub.totalMembers || 0, // Sử dụng totalMembers từ API
      status: apiClub.isActive ? 'Hoạt động' : 'Ngừng hoạt động',
      email: apiClub.email || '',
      location: apiClub.location || '',
      logo: apiClub.logo,
      founderId: apiClub.founderId,
      founderStudentCode: apiClub.founderStudentCode
    };
  };

  // Fetch clubs from API với search và filter
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

      // Build URL with optional category filter and search
      let url = `${API_BASE_URL}/clubs`;
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('category', category);
      }
      if (searchName && searchName.trim()) {
        params.append('name', searchName.trim());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      if (!response.ok || !data || (data.code !== 0 && data.code !== 1000)) {
        const errorMessage = data?.message || `Không thể tải danh sách câu lạc bộ (mã ${response.status}).`;
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Map API data to component format
      const mappedClubs = (data.result || []).map(mapApiDataToClub);
      setClubs(mappedClubs);
    } catch (error) {
      console.error('Fetch clubs error:', error);
      setError('Đã xảy ra lỗi khi tải danh sách câu lạc bộ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch clubs khi component mounts hoặc khi filter/search thay đổi (với debounce cho search)
  useEffect(() => {
    let timeoutId;
    
    // Nếu searchTerm thay đổi, debounce 500ms
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

  // Handle search and filter changes
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

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

