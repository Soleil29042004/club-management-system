import React, { useState, useEffect } from 'react';

const JoinRequestModal = ({ club, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    phone: '',
    studentId: '',
    major: '',
    reason: '',
    packageId: '' // ID của gói membership được chọn
  });
  const [errors, setErrors] = useState({});
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Fetch packages khi club thay đổi
  useEffect(() => {
    if (!club || !club.id) return;

    const fetchPackages = async () => {
      setLoadingPackages(true);
      try {
        // Tạm thời sử dụng packages mặc định nếu không có API
        // Có thể thay thế bằng API: GET /api/clubs/{clubId}/packages
        const basePrice = club.participationFee || 20000;
        const defaultPackages = [
          { id: 1, name: 'Thành Viên Cơ Bản', term: '1 năm', price: basePrice },
          { id: 2, name: 'Thành Viên Nâng Cao', term: '2 năm', price: basePrice * 1.5 }
        ];
        setPackages(defaultPackages);
        // Set package mặc định là package đầu tiên
        if (defaultPackages.length > 0) {
          setFormData(prev => ({ ...prev, packageId: defaultPackages[0].id }));
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club?.id]); // Chỉ phụ thuộc vào club.id

  useEffect(() => {
    // Load user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const detailedUser = registeredUsers.find(u => u.email === user.email);
    
    // Auto-fill form with user data
    if (detailedUser) {
      setFormData(prev => ({
        ...prev,
        phone: detailedUser.phone || '',
        studentId: detailedUser.studentId || '',
        major: detailedUser.major || '',
        reason: '' // Keep reason empty for user to fill
      }));
    } else if (user.email) {
      // If user exists but not in registeredUsers, try to get from mock data or use defaults
      setFormData(prev => ({
        ...prev,
        phone: '',
        studentId: '',
        major: '',
        reason: ''
      }));
    }
  }, [club]); // Re-run when club changes (modal opens)

  if (!club) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Mã sinh viên không được để trống';
    }

    if (!formData.major.trim()) {
      newErrors.major = 'Chuyên ngành không được để trống';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Lý do gia nhập không được để trống';
    }

    if (!formData.packageId) {
      newErrors.packageId = 'Vui lòng chọn gói thành viên';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto shadow-2xl my-5" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
          <h2 className="text-2xl font-bold m-0">Gửi yêu cầu tham gia</h2>
          <button 
            className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-fpt-blue">
            <p className="m-0 mb-2 text-sm"><strong>Câu lạc bộ:</strong> {club.name}</p>
            <p className="m-0 mb-2 text-sm"><strong>Danh mục:</strong> {club.category}</p>
            <p className="m-0 text-sm"><strong>Chủ tịch:</strong> {club.president}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cá nhân</h3>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label htmlFor="phone" className="mb-2 font-semibold text-gray-800 text-sm">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                      errors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone}</span>}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="studentId" className="mb-2 font-semibold text-gray-800 text-sm">Mã sinh viên *</label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="VD: SE150001"
                    className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                      errors.studentId ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.studentId && <span className="text-red-500 text-xs mt-1">{errors.studentId}</span>}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="major" className="mb-2 font-semibold text-gray-800 text-sm">Chuyên ngành *</label>
                  <input
                    type="text"
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    placeholder="VD: Kỹ thuật phần mềm"
                    className={`px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                      errors.major ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.major && <span className="text-red-500 text-xs mt-1">{errors.major}</span>}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Chọn gói thành viên *</h3>
              {loadingPackages ? (
                <div className="text-center py-4 text-gray-500">Đang tải gói thành viên...</div>
              ) : packages.length > 0 ? (
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <label
                      key={pkg.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.packageId === pkg.id
                          ? 'border-fpt-blue bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="packageId"
                        value={pkg.id}
                        checked={formData.packageId === pkg.id}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{pkg.name}</div>
                        <div className="text-sm text-gray-600">
                          Thời hạn: {pkg.term} • Giá: {pkg.price?.toLocaleString('vi-VN') || '0'} VNĐ
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">Không có gói thành viên nào</div>
              )}
              {errors.packageId && <span className="text-red-500 text-xs mt-1 block">{errors.packageId}</span>}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lý do gia nhập</h3>
              <div className="flex flex-col">
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Vui lòng nêu rõ lý do bạn muốn tham gia câu lạc bộ này..."
                  rows="4"
                  className={`w-full px-4 py-3 border-2 rounded-lg text-sm transition-all font-sans resize-y min-h-[100px] focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 ${
                    errors.reason ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.reason && <span className="text-red-500 text-xs mt-1">{errors.reason}</span>}
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
              <button 
                type="button" 
                className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gray-200 text-gray-600 hover:bg-gray-300" 
                onClick={onClose}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
              >
                Gửi yêu cầu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestModal;

