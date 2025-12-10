import React, { useEffect, useState } from 'react';
import MemberList from './MemberList';
import MemberForm from './MemberForm';
import { getNextMemberId } from '../data/mockData';

const MemberManagement = ({ members, setMembers, clubs }) => {
  const nonAdminMembers = members.filter(
    m => String(m.role || '').toLowerCase() !== 'admin'
  );
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://clubmanage.azurewebsites.net/api/users?page=0&size=100&sort=createdAt,DESC', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          const list = Array.isArray(data.result?.content)
            ? data.result.content
            : Array.isArray(data.result)
              ? data.result
              : [];
          const mapped = list.map(u => ({
            id: u.userId || u.id,
            fullName: u.fullName || '',
            name: u.fullName || '',
            email: u.email || '',
            phone: u.phoneNumber || u.phone || '',
            studentId: u.studentCode || '',
            role: u.role || '',
            status: u.active ? 'Hoạt động' : 'Tạm dừng',
            joinDate: u.createdAt || '',
            clubId: u.clubId || null,
            major: u.major || '',
            clubName: u.clubName || '',
            packageName: u.packageName || ''
          }));
          setMembers(mapped);
        } else {
          setError(data.message || 'Không thể tải danh sách người dùng.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch users error:', err);
          setError('Không thể tải danh sách người dùng.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, [setMembers]);

  const handleAdd = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      setMembers(members.filter(member => member.id !== id));
    }
  };

  const handleSubmit = (formData) => {
    if (editingMember) {
      // Update existing member
      setMembers(members.map(member => 
        member.id === editingMember.id ? { ...formData, id: editingMember.id } : member
      ));
    } else {
      // Add new member
      const newMember = {
        ...formData,
        id: getNextMemberId(members)
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

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center text-gray-600">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full mb-4"></div>
          <p className="m-0 text-base">Đang tải danh sách người dùng...</p>
        </div>
      ) : (
        <MemberList
          members={nonAdminMembers}
          clubs={clubs}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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

