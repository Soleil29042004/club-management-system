import React, { useState } from 'react';
import MemberList from './MemberList';
import MemberForm from './MemberForm';
import { getNextMemberId } from '../data/mockData';

const MemberManagement = ({ members, setMembers, clubs }) => {
  const nonAdminMembers = members.filter(
    m => String(m.role || '').toLowerCase() !== 'admin'
  );
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

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
          <p className="m-0 text-gray-600 text-base font-medium">Quản lý thông tin người dùng (trừ Admin)</p>
        </div>
        <button 
          onClick={handleAdd} 
          className="w-full md:w-auto bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white border-none px-8 py-4 text-base font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-1 hover:shadow-xl"
        >
          <span className="text-2xl font-light">+</span>
          Thêm người dùng mới
        </button>
      </div>

      <MemberList
        members={nonAdminMembers}
        clubs={clubs}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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

