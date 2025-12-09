import React from 'react';
import { memberRoles } from '../data/mockData';

const MembersList = ({ members, club, onUpdateRole, onDeleteMember }) => {
  const parseDate = (value) => {
    if (!value) return null;
    if (typeof value === 'string' && value.includes('/')) {
      const [d, m, y] = value.split('/').map(Number);
      if (!Number.isNaN(d) && !Number.isNaN(m) && !Number.isNaN(y)) {
        const parsed = new Date(y, m - 1, d);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      }
    }
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (date) => {
    const d = date instanceof Date ? date : parseDate(date);
    if (!d) return '-';
    return d.toLocaleDateString('vi-VN');
  };

  const getMembershipInfo = (member) => {
    const statusText = member.status ? member.status.toLowerCase() : '';

    // Ưu tiên trạng thái khai báo sẵn
    if (statusText === 'hết hạn') {
      return {
        expiryDate: formatDate(member.expiryDate || null),
        status: 'Hết hạn',
        badgeClass: 'bg-red-100 text-red-700'
      };
    }
    if (statusText === 'hoạt động') {
      return {
        expiryDate: formatDate(member.expiryDate || null),
        status: 'Còn hiệu lực',
        badgeClass: 'bg-green-100 text-green-700'
      };
    }

    const durationMonths = club?.membershipDuration || 6;
    const join = parseDate(member.joinDate);

    // Nếu không parse được ngày tham gia, hiển thị còn hiệu lực để tránh crash UI
    if (!join) {
      return {
        expiryDate: '-',
        status: 'Còn hiệu lực',
        badgeClass: 'bg-green-100 text-green-700'
      };
    }

    const expiry = new Date(join);
    expiry.setMonth(expiry.getMonth() + durationMonths);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

    let status = 'Còn hiệu lực';
    let badgeClass = 'bg-green-100 text-green-700';

    if (diffDays < 0) {
      status = 'Hết hạn';
      badgeClass = 'bg-red-100 text-red-700';
    } else if (diffDays <= 30) {
      status = 'Sắp hết hạn';
      badgeClass = 'bg-amber-100 text-amber-700';
    }

    return {
      expiryDate: formatDate(expiry),
      status,
      badgeClass
    };
  };

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
                <th className="px-6 py-4 text-left text-sm font-semibold">Tình trạng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Vai trò</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map((member) => {
                const membershipInfo = getMembershipInfo(member);
                return (
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
                      <span className="whitespace-nowrap">{member.phone || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="whitespace-nowrap truncate block max-w-[180px]">
                        {member.major || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(member.joinDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${membershipInfo.badgeClass}`}>
                        {membershipInfo.status}
                      </span>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersList;

