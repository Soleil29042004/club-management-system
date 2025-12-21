/**
 * LeaderStats Component
 * 
 * Component hiển thị thống kê cho club leader:
 * - Số thành viên
 * - Số yêu cầu chờ duyệt
 * - Danh mục club
 * - Địa điểm
 * - Tổng doanh thu (nếu có)
 * - Số thành viên chưa đóng phí (nếu có)
 * 
 * @param {Object} props
 * @param {number} props.memberCount - Số thành viên hiện tại
 * @param {number} props.pendingRequestsCount - Số yêu cầu chờ duyệt
 * @param {string} props.category - Danh mục của club
 * @param {string} props.location - Địa điểm của club
 * @param {number} props.totalRevenue - Tổng doanh thu (optional)
 * @param {number} props.unpaidCount - Số thành viên chưa đóng phí (optional)
 */

import React from 'react';
import { clubCategoryLabels } from '../../data/constants';

const LeaderStats = ({ 
  memberCount, 
  pendingRequestsCount, 
  category, 
  location,
  totalRevenue = 0,
  unpaidCount = 0
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg border border-fpt-blue/8">
        <div className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex-shrink-0">
          👥
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-1">Thành viên</h3>
          <p className="text-3xl font-bold text-fpt-blue">{memberCount}</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg border border-fpt-blue/8">
        <div className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex-shrink-0">
          📋
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-1">Yêu cầu chờ duyệt</h3>
          <p className="text-3xl font-bold text-fpt-blue">{pendingRequestsCount}</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg border border-fpt-blue/8">
        <div className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex-shrink-0">
          📂
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-1">Danh mục</h3>
          <p className="text-lg font-semibold text-fpt-blue truncate">{category ? (clubCategoryLabels[category] || category) : 'Chưa cập nhật'}</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg border border-fpt-blue/8">
        <div className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex-shrink-0">
          📍
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-1">Địa điểm</h3>
          <p className="text-lg font-semibold text-fpt-blue truncate">{location}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg border border-fpt-blue/8">
        <div className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex-shrink-0">
          💰
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-1">Doanh thu theo tháng</h3>
          <p className="text-3xl font-bold text-fpt-blue">{(totalRevenue || 0).toLocaleString('vi-VN')} VNĐ</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg border border-fpt-blue/8">
        <div className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex-shrink-0">
          ⏳
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-1">Chưa đóng phí</h3>
          <p className="text-3xl font-bold text-fpt-blue">{unpaidCount || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderStats;


