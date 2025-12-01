import React, { useState } from 'react';
import MemberList from './MemberList';
import MemberForm from './MemberForm';
import { getNextMemberId } from '../data/mockData';
import './MemberManagement.css';

const MemberManagement = ({ members, setMembers, clubs }) => {
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
    <div className="member-management">
      <div className="management-header">
        <div>
          <h1>Quản lý Thành viên</h1>
          <p className="subtitle">Quản lý thông tin thành viên các câu lạc bộ</p>
        </div>
        <button onClick={handleAdd} className="btn-add-new">
          <span className="plus-icon">+</span>
          Thêm thành viên mới
        </button>
      </div>

      <MemberList
        members={members}
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

