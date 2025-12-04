import React from 'react';
import { memberRoles } from '../data/mockData';

const MembersList = ({ members, onUpdateRole, onDeleteMember }) => {
  if (members.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-6">👥</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chưa có thành viên nào</h2>
        <p className="text-gray-600">Club hiện tại chưa có thành viên nào.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md mb-6 border border-fpt-blue/10">
        <h2 className="text-2xl font-bold text-fpt-blue m-0">Danh sách thành viên ({members.length})</h2>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white">
                <th className="px-4 py-4 text-left font-semibold text-sm uppercase tracking-wide">Thành viên</th>
                <th className="px-4 py-4 text-left font-semibold text-sm uppercase tracking-wide">ID</th>
                <th className="px-4 py-4 text-left font-semibold text-sm uppercase tracking-wide">Số điện thoại</th>
                <th className="px-4 py-4 text-left font-semibold text-sm uppercase tracking-wide">Chuyên ngành</th>
                <th className="px-4 py-4 text-left font-semibold text-sm uppercase tracking-wide">Ngày tham gia</th>
                <th className="px-4 py-4 text-left font-semibold text-sm uppercase tracking-wide">Vai trò</th>
                <th className="px-4 py-4 text-left font-semibold text-sm uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr 
                  key={member.id} 
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fpt-blue to-fpt-blue-light flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-md">
                        {member.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm">{member.fullName}</div>
                        <div className="text-xs text-gray-500 truncate">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-fpt-blue">{member.studentId}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span>📞</span>
                      <span>{member.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span>📚</span>
                      <span>{member.major}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span>📅</span>
                      <span>{new Date(member.joinDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={member.role}
                      onChange={(e) => onUpdateRole(member.id, e.target.value)}
                      className="px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:border-fpt-blue focus:ring-2 focus:ring-fpt-blue/20 bg-white"
                    >
                      {memberRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onDeleteMember(member.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersList;

