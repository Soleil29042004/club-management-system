import React, { useState } from 'react';
import './MemberList.css';

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

  return (
    <div className="member-list-container">
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, MSSV, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterClub}
            onChange={(e) => setFilterClub(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả câu lạc bộ</option>
            {clubs.map(club => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả vai trò</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="members-table-container">
        {filteredMembers.length === 0 ? (
          <div className="no-results">
            <p>Không tìm thấy thành viên nào</p>
          </div>
        ) : (
          <table className="members-table">
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Câu lạc bộ</th>
                <th>Vai trò</th>
                <th>Chuyên ngành</th>
                <th>Ngày tham gia</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id}>
                  <td className="student-id">{member.studentId}</td>
                  <td className="member-name">{member.fullName}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>
                    <span className="club-badge">{member.clubName}</span>
                  </td>
                  <td>
                    <span className={`role-badge role-${member.role.toLowerCase().replace(/\s+/g, '-')}`}>
                      {member.role}
                    </span>
                  </td>
                  <td>{member.major}</td>
                  <td>{new Date(member.joinDate).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={`status-badge status-${member.status.toLowerCase()}`}>
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onEdit(member)} className="btn-edit-small">
                        Sửa
                      </button>
                      <button onClick={() => onDelete(member.id)} className="btn-delete-small">
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

      <div className="table-footer">
        <p>Tổng số: <strong>{filteredMembers.length}</strong> thành viên</p>
      </div>
    </div>
  );
};

export default MemberList;

