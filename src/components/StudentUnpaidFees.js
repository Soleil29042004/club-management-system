/**
 * StudentUnpaidFees Component
 * 
 * Component hiển thị danh sách phí chưa nộp của student:
 * - Hiển thị thông tin CLB: tên, danh mục, mô tả, chủ tịch, địa điểm
 * - Tính toán và hiển thị ngày bắt đầu và ngày hết hạn dựa vào membershipDuration
 * - Button để nộp phí ngay
 * - Hiển thị empty state nếu không có phí nào cần nộp
 * 
 * @param {Object} props
 * @param {Array} props.unpaidFees - Danh sách phí chưa nộp (mỗi item có club, clubName, requestDate)
 * @param {Function} props.onPayment - Callback khi click button nộp phí (club)
 */
import React from 'react';

const StudentUnpaidFees = ({ unpaidFees, onPayment }) => {
  /**
   * Format date string sang định dạng tiếng Việt (DD/MM/YYYY)
   * @param {string} dateString - Date string cần format
   * @returns {string} - Formatted date hoặc '-' nếu không hợp lệ
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  /**
   * Tính toán ngày bắt đầu và ngày hết hạn dựa vào requestDate và membershipDuration
   * Nếu không có requestDate, dùng ngày hiện tại làm ngày bắt đầu
   * @param {string|null} requestDate - Ngày yêu cầu (có thể null)
   * @param {number} membershipDuration - Thời hạn membership (tháng, mặc định 6)
   * @returns {Object} - Object chứa startDate và expiryDate (ISO string)
   */
  const calculateStartAndExpiryDate = (requestDate, membershipDuration) => {
    if (!requestDate) {
      const today = new Date();
      const startDate = new Date(today);
      const expiryDate = new Date(today);
      expiryDate.setMonth(expiryDate.getMonth() + (membershipDuration || 6));
      return {
        startDate: startDate.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0]
      };
    }

    const startDate = new Date(requestDate);
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + (membershipDuration || 6));
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0]
    };
  };

  if (unpaidFees.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bạn đã nộp đủ tất cả các phí!</h2>
        <p className="text-gray-600">Không có phí nào cần nộp tại thời điểm này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {unpaidFees.map((item) => {
        const { startDate, expiryDate } = calculateStartAndExpiryDate(
          item.requestDate,
          item.club.membershipDuration || 6
        );
        
        return (
        <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 m-0 mb-2">{item.clubName}</h3>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                {item.club.category}
              </span>
            </div>
            <span className="px-4 py-2 bg-red-500 text-white rounded-full text-xs font-semibold uppercase">
              Chưa nộp
            </span>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium mb-1">Ngày bắt đầu:</span>
                <span className="text-sm font-semibold text-gray-800">{formatDate(startDate)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium mb-1">Ngày hết hạn:</span>
                <span className="text-sm font-semibold text-gray-800">{formatDate(expiryDate)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium mb-1">Chủ tịch:</span>
                <span className="text-sm font-semibold text-gray-800">{item.club.president}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium mb-1">Địa điểm:</span>
                <span className="text-sm font-semibold text-gray-800">{item.club.location}</span>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-fpt-blue mt-4">
              {item.club.description}
            </p>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
            <button
              onClick={() => onPayment(item.club)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:bg-gradient-to-l hover:-translate-y-0.5 hover:shadow-lg transition-all shadow-md"
            >
              💰 Nộp phí ngay
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default StudentUnpaidFees;

