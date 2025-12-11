import React from 'react';

const ClubInfoForm = ({ formData, onFormChange, onFormSubmit, onFormCancel }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light p-6">
        <h2 className="text-2xl font-bold text-white m-0">Chỉnh sửa thông tin Câu lạc bộ</h2>
      </div>
      
      <form onSubmit={onFormSubmit} className="p-8">
        <div className="mb-6">
          <label className="mb-2 font-semibold text-gray-800 text-sm block">Mô tả *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onFormChange}
            rows="4"
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all font-sans resize-y focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-800 text-sm">Địa điểm *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={onFormChange}
              required
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-800 text-sm">Logo URL</label>
            <input
              type="url"
              name="logo"
              value={formData.logo || ''}
              onChange={onFormChange}
              placeholder="https://example.com/logo.png"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10"
            />
            <p className="text-xs text-gray-500 mt-1">Dán URL logo hợp lệ (PNG/JPG/SVG).</p>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-100">
          <button 
            type="button" 
            className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gray-200 text-gray-600 hover:bg-gray-300" 
            onClick={onFormCancel}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClubInfoForm;

