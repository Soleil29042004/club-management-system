import React from 'react';
import { memberRoles } from '../data/mockData';
import './MembersList.css';

const MembersList = ({ members, onUpdateRole, onDeleteMember }) => {
  if (members.length === 0) {
    return (
      <div className="members-section">
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h2>Chưa có thành viên nào</h2>
          <p>Club hiện tại chưa có thành viên nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="members-section">
      <div className="members-header">
        <h2>Danh sách thành viên ({members.length})</h2>
      </div>
      <div className="members-list">
        {members.map((member) => (
          <div key={member.id} className="member-card">
            <div className="member-avatar">
              {member.fullName.charAt(0)}
            </div>
            <div className="member-info">
              <h3>{member.fullName}</h3>
              <div className="member-details">
                <span className="member-id">ID: {member.studentId}</span>
                <span className="member-email">{member.email}</span>
                <span className="member-phone">📞 {member.phone}</span>
                <span className="member-major">📚 {member.major}</span>
                <span className="member-join-date">📅 Tham gia: {member.joinDate}</span>
              </div>
            </div>
            <div className="member-actions">
              <div className="member-role-select">
                <label>Vai trò:</label>
                <select
                  value={member.role}
                  onChange={(e) => onUpdateRole(member.id, e.target.value)}
                  className="role-select"
                >
                  {memberRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => onDeleteMember(member.id)}
                className="btn-delete-member"
              >
                🗑️ Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersList;

