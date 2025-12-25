/**
 * MembersList Component
 * 
 * Component hiển thị danh sách thành viên của club cho club leader:
 * - Hiển thị thông tin: tên, MSSV, SĐT, chuyên ngành, ngày tham gia, tình trạng, vai trò
 * - Cho phép cập nhật vai trò thành viên (dropdown)
 * - Cho phép xóa thành viên khỏi club
 * - Tính toán và hiển thị tình trạng membership (còn hiệu lực, sắp hết hạn, hết hạn)
 * 
 * @param {Object} props
 * @param {Array} props.members - Danh sách members
 * @param {Object} props.club - Club object (để lấy membershipDuration)
 * @param {Function} props.onUpdateRole - Callback khi cập nhật vai trò (memberId, newRole)
 * @param {Function} props.onDeleteMember - Callback khi xóa thành viên (memberId)
 * @param {number|string} props.deleteLoadingId - ID của member đang được xóa (để hiển thị loading)
 * @param {number|string} props.roleLoadingId - ID của member đang được cập nhật vai trò (để hiển thị loading)
 */
import React from 'react';
import { memberRoles } from '../../data/constants';

// Danh sách thành viên: show thông tin, badge tình trạng, dropdown đổi role, nút xóa
const MembersList = ({ members, club, onUpdateRole, onDeleteMember, deleteLoadingId, roleLoadingId }) => {
  /**
   * FUNCTION: PARSE DATE
   * 
   * MỤC ĐÍCH: Parse date từ nhiều format khác nhau (string, Date object, DD/MM/YYYY)
   * 
   * @param {any} value - Giá trị date cần parse
   * @returns {Date|null} - Date object hoặc null nếu không parse được
   */
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

  /**
   * FUNCTION: FORMAT DATE
   * 
   * MỤC ĐÍCH: Format date sang định dạng tiếng Việt (DD/MM/YYYY)
   * 
   * @param {Date|string} date - Date cần format
   * @returns {string} - Date string hoặc '-' nếu không hợp lệ
   */
  const formatDate = (date) => {
    const d = date instanceof Date ? date : parseDate(date);
    if (!d) return '-';
    return d.toLocaleDateString('vi-VN');
  };

  /**
   * FUNCTION: GET MEMBERSHIP INFO
   * 
   * MỤC ĐÍCH: Tính toán thông tin membership (ngày hết hạn, trạng thái, badge class)
   * Dựa vào joinDate và membershipDuration của club
   * 
   * LOGIC:
   * - Ưu tiên status từ member.status nếu có
   * - Tính toán expiryDate = joinDate + membershipDuration (tháng)
   * - So sánh với ngày hiện tại để xác định status (Còn hiệu lực / Sắp hết hạn / Hết hạn)
   * 
   * @param {Object} member - Member object
   * @returns {Object} - Object chứa expiryDate, status, badgeClass
   */
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
                const normalizeRole = (role) => {
                  if (!role) return 'Thành viên';
                  // Nếu role đã là tiếng Việt, map về format đúng với memberRoles (chữ thường "chủ")
                  const r = (role || '').toLowerCase();
                  if (r === 'chutich' || r === 'chủ tịch' || r === 'chu tich' || role === 'Chủ tịch') return 'Chủ tịch';
                  if (r === 'phochutich' || r === 'phó chủ tịch' || r === 'pho chu tich' || role === 'Phó Chủ tịch' || role === 'Phó chủ tịch') return 'Phó chủ tịch';
                  if (r === 'thuky' || r === 'thư ký' || r === 'thu ky' || role === 'Thư ký') return 'Thư ký';
                  if (r === 'thuquy' || r === 'thủ quỹ' || r === 'thu quy') return 'Thủ quỹ';
                  if (r === 'thanhvien' || r === 'thành viên' || r === 'thanh vien' || role === 'Thành viên') return 'Thành viên';
                  return role || 'Thành viên';
                };
                // Ưu tiên dùng member.role (đã được normalize) trước, nếu không có mới normalize từ roleCode/clubRole
                const roleValue = member.role || normalizeRole(member.clubRole || member.roleCode);
                // Debug log
                if (member.email === 'hbhuyhoang04@gmail.com') {
                  console.log('MembersList - member:', member);
                  console.log('MembersList - roleValue:', roleValue);
                  console.log('MembersList - member.role:', member.role);
                  console.log('MembersList - member.clubRole:', member.clubRole);
                  console.log('MembersList - member.roleCode:', member.roleCode);
                }
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
                        value={roleValue}
                        onChange={(e) => onUpdateRole(member.id, e.target.value)}
                        disabled={roleLoadingId === member.id}
                        className="px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm font-sans focus:outline-none focus:border-fpt-blue focus:ring-2 focus:ring-fpt-blue/20 bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {memberRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      {roleLoadingId === member.id && (
                        <span className="ml-2 text-xs text-gray-500">Đang cập nhật...</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start gap-2">
                        <button
                          onClick={() => onDeleteMember(member.id)}
                          disabled={deleteLoadingId === member.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {deleteLoadingId === member.id ? 'Đang xóa...' : '❌ Xóa'}
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

