import React, { useState } from 'react';

const MemberList = ({ members, clubs, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClub, setFilterClub] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClub = filterClub === 'all' || member.clubId === parseInt(filterClub);
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesClub && matchesRole && matchesStatus;
  });

  const roles = [...new Set(members.map(member => member.role))];
  const statuses = [...new Set(members.map(member => member.status))];

  const getRoleBadgeClass = (role) => {
    const roleLower = role.toLowerCase().replace(/\s+/g, '-');
    if (roleLower.includes('chủ-tịch')) return 'bg-pink-100 text-pink-700';
    if (roleLower.includes('phó')) return 'bg-purple-100 text-purple-700';
    if (roleLower.includes('thư-ký')) return 'bg-green-100 text-green-700';
    if (roleLower.includes('thủ-quỹ')) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('hoạt động')) return 'bg-green-500 text-white';
    if (statusLower.includes('tạm ngưng')) return 'bg-orange-500 text-white';
    return 'bg-gray-500 text-white';
  };

  return (
    <div className="p-5">
      <div className="bg-white p-5 rounded-lg shadow-md mb-5">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, MSSV, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 text-base border-2 border-gray-300 rounded-lg transition-all focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          <select
            value={filterClub}
            onChange={(e) => setFilterClub(e.target.value)}
            className="px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg bg-white cursor-pointer transition-all flex-1 min-w-[200px] focus:outline-none focus:border-fpt-blue"
          >
            <option value="all">Tất cả câu lạc bộ</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg bg-white cursor-pointer transition-all flex-1 min-w-[200px] focus:outline-none focus:border-fpt-blue"
          >
            <option value="all">Tất cả vai trò</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg bg-white cursor-pointer transition-all flex-1 min-w-[200px] focus:outline-none focus:border-fpt-blue"
          >
            <option value="all">Tất cả trạng thái</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 px-5 text-gray-500 text-lg">
            <p>Không tìm thấy thành viên nào</p>
          </div>
        ) : (
          <table className="w-full border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white">
                <th className="px-3 py-4 text-left font-semibold text-sm uppercase tracking-wide">MSSV</th>
                <th className="px-3 py-4 text-left font-semibold text-sm uppercase tracking-wide">Họ và tên</th>
                <th className="px-3 py-4 text-left font-semibold text-sm uppercase tracking-wide">Email</th>
                <th className="px-3 py-4 text-left font-semibold text-sm uppercase tracking-wide">Số điện thoại</th>
                <th className="px-3 py-4 text-left font-semibold text-sm uppercase tracking-wide">Câu lạc bộ</th>
                <th className="px-3 py-4 text-left font-semibold text-sm uppercase tracking-wide">Vai trò</th>
                <th className="px-3 py-4 text-left font-semibold text-sm uppercase tracking-wide">Chuyên ngành</th>
                <th className="px-3 py-4 text-left font-semibold text-sm uppercase tracking-wide">Ngày tham gia</th>
                <th className="px-3 py-4 text-left font-semibold text-sm uppercase tracking-wide">Trạng thái</th>
                <th className="px-3 py-4 text-left font-semibold text-sm uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                  <td className="px-3 py-4 text-sm font-semibold text-fpt-blue">{member.studentId}</td>
                  <td className="px-3 py-4 text-sm font-semibold text-gray-800">{member.fullName}</td>
                  <td className="px-3 py-4 text-sm text-gray-800">{member.email}</td>
                  <td className="px-3 py-4 text-sm text-gray-800">{member.phone}</td>
                  <td className="px-3 py-4 text-sm">
                    <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {member.clubName}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${getRoleBadgeClass(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-800">{member.major}</td>
                  <td className="px-3 py-4 text-sm text-gray-800">{new Date(member.joinDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-3 py-4 text-sm">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${getStatusBadgeClass(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onEdit(member)} 
                        className="px-3 py-1.5 border-none rounded-md text-xs font-medium cursor-pointer transition-all bg-green-500 text-white hover:bg-green-600"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => onDelete(member.id)} 
                        className="px-3 py-1.5 border-none rounded-md text-xs font-medium cursor-pointer transition-all bg-red-500 text-white hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-b-xl px-5 py-4 shadow-md -mt-1">
        <p className="m-0 text-gray-600 text-sm">
          Tổng số: <strong className="text-fpt-blue">{filteredMembers.length}</strong> thành viên
        </p>
      </div>
    </div>
  );
};

export default MemberList;

