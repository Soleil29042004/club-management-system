/**
 * ClubInfo Component
 * 
 * Component hiển thị thông tin club cho club leader:
 * - Hiển thị thông tin: tên, danh mục, mô tả, địa điểm, email, ngày thành lập, số thành viên
 * - Button để chỉnh sửa thông tin
 * - Toggle giữa view mode và edit mode (sử dụng ClubInfoForm)
 * 
 * @param {Object} props
 * @param {Object} props.club - Club object cần hiển thị
 * @param {Function} props.onEdit - Callback khi click button chỉnh sửa
 * @param {boolean} props.showEditForm - Flag để toggle edit mode
 * @param {Object} props.formData - Form data cho edit mode
 * @param {Function} props.onFormChange - Callback khi form input thay đổi
 * @param {Function} props.onFormSubmit - Callback khi submit form
 * @param {Function} props.onFormCancel - Callback khi cancel edit
 */

import React from 'react';
import ClubInfoForm from './ClubInfoForm';
import { clubCategoryLabels } from '../../data/constants';

const ClubInfo = ({ club, onEdit, showEditForm, formData, onFormChange, onFormSubmit, onFormCancel }) => {
  if (!club) return null;

  // Khi showEditForm = true → hiển thị form chỉnh sửa
  if (showEditForm) {
    return (
      <ClubInfoForm
        formData={formData}
        onFormChange={onFormChange}
        onFormSubmit={onFormSubmit}
        onFormCancel={onFormCancel}
      />
    );
  }

  /**
   * FUNCTION: GET STATUS BADGE CLASS
   * 
   * MỤC ĐÍCH: Lấy CSS class cho status badge dựa vào status string
   * 
   * LOGIC:
   * - "hoạt động" → bg-green-500 (xanh lá)
   * - "tạm ngưng" → bg-orange-500 (cam)
   * - "ngừng" → bg-red-500 (đỏ)
   * - Mặc định → bg-gray-500 (xám)
   * 
   * @param {string} status - Trạng thái của club
   * @returns {string} - Tailwind CSS classes
   */
  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('hoạt động')) return 'bg-green-500 text-white';
    if (statusLower.includes('tạm ngưng')) return 'bg-orange-500 text-white';
    if (statusLower.includes('ngừng')) return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
  };

  // View mode: hiển thị thông tin CLB + nút chỉnh sửa
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🏛️</div>
          <div>
            <h2 className="text-2xl font-bold text-white m-0">{club.name}</h2>
            <p className="text-white/90 text-base mt-1">{club.category ? (clubCategoryLabels[club.category] || club.category) : 'Chưa cập nhật'}</p>
          </div>
        </div>
        <button 
          onClick={onEdit}
          className="px-6 py-3 bg-white text-fpt-blue font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg"
        >
          ✏️ Chỉnh sửa
        </button>
      </div>
      
      <div className="p-8">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>📝</span> Mô tả
          </h3>
          <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-fpt-blue">
            {club.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-200 flex items-start gap-4 hover:shadow-md transition-all">
            <div className="text-3xl flex-shrink-0">📅</div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wide block mb-1">Ngày thành lập</span>
              <span className="text-base font-semibold text-gray-800">{club.foundedDate}</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200 flex items-start gap-4 hover:shadow-md transition-all">
            <div className="text-3xl flex-shrink-0">👤</div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wide block mb-1">Chủ tịch</span>
              <span className="text-base font-semibold text-gray-800">{club.president}</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 flex items-start gap-4 hover:shadow-md transition-all">
            <div className="text-3xl flex-shrink-0">👥</div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wide block mb-1">Số thành viên</span>
              <span className="text-base font-semibold text-gray-800">{club.memberCount}</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-5 rounded-xl border border-pink-200 flex items-start gap-4 hover:shadow-md transition-all">
            <div className="text-3xl flex-shrink-0">📍</div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wide block mb-1">Địa điểm</span>
              <span className="text-base font-semibold text-gray-800">{club.location}</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-xl border border-cyan-200 flex items-start gap-4 hover:shadow-md transition-all">
            <div className="text-3xl flex-shrink-0">📧</div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wide block mb-1">Email</span>
              <span className="text-base font-semibold text-gray-800 break-all">{club.email}</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-200 flex items-start gap-4 hover:shadow-md transition-all">
            <div className="text-3xl flex-shrink-0">⚡</div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-gray-600 font-medium uppercase tracking-wide block mb-1">Trạng thái</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadgeClass(club.status)}`}>
                {club.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubInfo;

