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
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Tên thành viên</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Mã sinh viên</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Số điện thoại</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Chuyên ngành</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ngày tham gia</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Vai trò</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member, index) => (
                <tr 
                  key={member.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{member.fullName}</div>
                    <div className="text-sm text-gray-500 mt-1">{member.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-fpt-blue">{member.studentId}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.phone || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.major || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(member.joinDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-start gap-2">
                      <button
                        onClick={() => onDeleteMember(member.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all"
                      >
                        ❌ Xóa
                      </button>
                    </div>
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

