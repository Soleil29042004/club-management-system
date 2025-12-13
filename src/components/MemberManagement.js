import React, { useEffect, useState, useRef } from 'react';
import MemberList from './MemberList';
import MemberForm from './MemberForm';
import { useToast } from './Toast';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

const MemberManagement = ({ members, setMembers, clubs }) => {
  const { showToast } = useToast();
  const nonAdminMembers = members.filter(
    m => String(m.role || '').toLowerCase() !== 'admin'
  );
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [clubsMap, setClubsMap] = useState({});
  const clubsMapRef = useRef({});

  // Fetch danh sách clubs để map với clubIds
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchClubs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/clubs`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        
        if (!isMounted) return;
        
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          const clubsList = Array.isArray(data.result) ? data.result : [];
          const map = {};
          clubsList.forEach(club => {
            const clubId = club.clubId || club.id;
            if (clubId) {
              map[clubId] = club.clubName || club.name || '';
            }
          });
          if (isMounted) {
            setClubsMap(map);
            clubsMapRef.current = map; // Cập nhật ref cùng lúc
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMounted) {
          console.error('Fetch clubs error:', err);
        }
      }
    };

    fetchClubs();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Fetch users khi page, size, sort thay đổi (KHÔNG phụ thuộc vào clubsMap)
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchUsers = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError('');
      try {
        const sortParam = `${sortBy},${sortDirection}`;
        const url = `${API_BASE_URL}/users?page=${page}&size=${size}&sort=${encodeURIComponent(sortParam)}`;
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        
        if (!isMounted) return;
        
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          const list = Array.isArray(data.result?.content)
            ? data.result.content
            : Array.isArray(data.result)
              ? data.result
              : [];
          
          // Lấy thông tin phân trang
          if (data.result) {
            setTotalPages(data.result.totalPages || 0);
            setTotalElements(data.result.totalElements || 0);
          }

          // Map users và cập nhật clubName sau đó (sử dụng functional update để đọc clubsMap mới nhất)
          const mapped = list.map(u => {
            // Xử lý clubIds từ backend (có thể là null, array, hoặc empty array)
            const userClubIds = u.clubIds;
            
            return {
              id: u.userId || u.id,
              fullName: u.fullName || '',
              name: u.fullName || '',
              email: u.email || '',
              phone: u.phoneNumber || u.phone || '',
              studentId: u.studentCode || '',
              role: u.role || '',
              status: u.active ? 'Hoạt động' : 'Tạm dừng',
              joinDate: u.createdAt || '',
              clubId: userClubIds && Array.isArray(userClubIds) && userClubIds.length > 0 ? userClubIds[0] : null,
              clubIds: userClubIds && Array.isArray(userClubIds) ? userClubIds : [],
              major: u.major || '',
              clubName: '-', // Sẽ được cập nhật bởi functional update hoặc useEffect
              packageName: u.packageName || ''
            };
          });
          
          if (isMounted) {
            // Sử dụng clubsMapRef để đọc giá trị mới nhất (không phụ thuộc vào closure)
            const currentClubsMap = clubsMapRef.current;
            const finalMapped = mapped.map(m => {
              // Map clubName từ clubsMap nếu có clubIds và clubsMap đã có dữ liệu
              if (m.clubIds && Array.isArray(m.clubIds) && m.clubIds.length > 0) {
                if (Object.keys(currentClubsMap).length > 0) {
                  const names = m.clubIds
                    .map(clubId => currentClubsMap[clubId])
                    .filter(name => name);
                  const clubNames = names.length > 0 ? names.join(', ') : '-';
                  return { ...m, clubName: clubNames };
                }
              }
              return m;
            });
            setMembers(finalMapped);
          }
        } else {
          if (isMounted) {
            setError(data.message || 'Không thể tải danh sách người dùng.');
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMounted) {
          console.error('Fetch users error:', err);
          setError('Không thể tải danh sách người dùng.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sortBy, sortDirection]);

  // Helper function để cập nhật clubName từ clubsMap
  const updateClubNames = (membersList, clubsMapData) => {
    if (Object.keys(clubsMapData).length === 0 || membersList.length === 0) {
      return membersList;
    }
    
    let hasChanges = false;
    const updated = membersList.map(m => {
      // Cập nhật clubName từ clubsMap nếu có clubIds
      if (m.clubIds && Array.isArray(m.clubIds) && m.clubIds.length > 0) {
        const names = m.clubIds
          .map(clubId => clubsMapData[clubId])
          .filter(name => name);
        const clubNames = names.length > 0 ? names.join(', ') : '-';
        // Cập nhật nếu khác với giá trị hiện tại
        if (clubNames !== m.clubName) {
          hasChanges = true;
          return { ...m, clubName: clubNames };
        }
      } else if (!m.clubIds || (Array.isArray(m.clubIds) && m.clubIds.length === 0)) {
        // Nếu không có clubIds, đảm bảo clubName là '-'
        if (m.clubName !== '-') {
          hasChanges = true;
          return { ...m, clubName: '-' };
        }
      }
      return m;
    });
    return hasChanges ? updated : membersList;
  };

  // Cập nhật clubName khi clubsMap thay đổi
  useEffect(() => {
    if (Object.keys(clubsMap).length > 0) {
      setMembers(prev => updateClubNames(prev, clubsMap));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubsMap]);

  // Cập nhật clubName sau khi fetch users xong nếu clubsMap đã có dữ liệu
  // Sử dụng useRef để track xem đã cập nhật chưa, tránh vòng lặp
  const prevPageRef = React.useRef(page);
  
  useEffect(() => {
    // Khi page thay đổi (chuyển trang), cập nhật lại clubName nếu clubsMap đã có
    if (prevPageRef.current !== page && Object.keys(clubsMap).length > 0) {
      setMembers(prev => updateClubNames(prev, clubsMap));
      prevPageRef.current = page;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, clubsMap]);

  const handleAdd = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = async (member) => {
    if (!member?.id) return;

    if (!window.confirm(`Xác nhận xóa (deactivate) tài khoản ${member.fullName}?`)) {
      return;
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Vui lòng đăng nhập với quyền Admin.', 'error');
      return;
    }

    setDeleteLoadingId(member.id);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/users/${member.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
        const message = data?.message || 'Không thể xóa người dùng.';
        setError(message);
        showToast(message, 'error');
        return;
      }

      // Soft delete: đánh dấu trạng thái tạm dừng thay vì loại bỏ
      setMembers(prev =>
        prev.map(m =>
          m.id === member.id ? { ...m, status: 'Tạm dừng', active: false } : m
        )
      );
      showToast('Đã hủy kích hoạt tài khoản người dùng.', 'success');
    } catch (err) {
      console.error('Delete user error:', err);
      const message = err.message || 'Không thể xóa người dùng.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleSubmit = (formData) => {
    if (editingMember) {
      // Update existing member
      setMembers(members.map(member => 
        member.id === editingMember.id ? { ...formData, id: editingMember.id } : member
      ));
    } else {
      // Add new member - ID will be assigned by API
      const newMember = {
        ...formData
      };
      setMembers([...members, newMember]);
    }
    setShowForm(false);
    setEditingMember(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 p-8 md:p-9 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg mb-9 border border-fpt-blue/10">
        <div>
          <h1 className="m-0 mb-2.5 text-fpt-blue text-[34px] md:text-3xl font-bold tracking-tight">Quản lý Người dùng</h1>
          <p className="m-0 text-gray-600 text-base font-medium">Quản lý thông tin người dùng</p>
        </div>
        <button 
          onClick={handleAdd} 
          className="w-full md:w-auto bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white border-none px-8 py-4 text-base font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-1 hover:shadow-xl"
        >
          <span className="text-2xl font-light">+</span>
          Thêm người dùng mới
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {/* Pagination và Sort Controls */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Sắp xếp theo:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-fpt-blue focus:outline-none focus:ring-2 focus:ring-fpt-blue focus:border-transparent transition-all cursor-pointer"
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="fullName">Tên</option>
              <option value="studentCode">Mã sinh viên</option>
              <option value="email">Email</option>
            </select>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-fpt-blue focus:outline-none focus:ring-2 focus:ring-fpt-blue focus:border-transparent transition-all cursor-pointer"
            >
              <option value="DESC">Giảm dần</option>
              <option value="ASC">Tăng dần</option>
            </select>
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Số lượng mỗi trang:
            </label>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-fpt-blue focus:outline-none focus:ring-2 focus:ring-fpt-blue focus:border-transparent transition-all cursor-pointer"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Trang <span className="font-semibold text-fpt-blue">{page + 1}</span> / {totalPages || 1} 
            {' '}(Tổng: <span className="font-semibold text-fpt-blue">{totalElements}</span> người dùng)
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-600">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full mb-4"></div>
          <p className="m-0 text-base">Đang tải danh sách người dùng...</p>
        </div>
      ) : (
        <>
          <MemberList
            members={nonAdminMembers}
            clubs={clubs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleteLoadingId={deleteLoadingId}
          />
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-md p-4 mt-4 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                « Đầu
              </button>
              <button
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹ Trước
              </button>
              <div className="px-4 py-2 text-sm font-semibold text-gray-700">
                Trang {page + 1} / {totalPages}
              </div>
              <button
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau ›
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cuối »
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <MemberForm
          member={editingMember}
          clubs={clubs}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default MemberManagement;

