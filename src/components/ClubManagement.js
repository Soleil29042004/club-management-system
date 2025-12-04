import React, { useState } from 'react';
import ClubList from './ClubList';
import ClubForm from './ClubForm';
import { getNextClubId } from '../data/mockData';

const ClubManagement = ({ clubs, setClubs }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [viewingClub, setViewingClub] = useState(null);

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
      // Add new club
      const newClub = {
        ...formData,
        id: getNextClubId(clubs)
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

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 p-8 md:p-9 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg mb-9 border border-fpt-blue/10">
        <div>
          <h1 className="m-0 mb-2.5 text-fpt-blue text-[34px] md:text-3xl font-bold tracking-tight">Quản lý Câu lạc bộ</h1>
          <p className="m-0 text-gray-600 text-base font-medium">Quản lý thông tin các câu lạc bộ trong trường</p>
        </div>
        <button 
          onClick={handleAdd} 
          className="w-full md:w-auto bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white border-none px-8 py-4 text-base font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-1 hover:shadow-xl"
        >
          <span className="text-2xl font-light">+</span>
          Thêm câu lạc bộ mới
        </button>
      </div>

      <ClubList
        clubs={clubs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
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
                  <p className="text-gray-800 m-0 text-base">{viewingClub.category}</p>
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

