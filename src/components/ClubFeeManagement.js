/**
 * ClubFeeManagement Component
 * 
 * Component quản lý phí thành viên và thời hạn cho club leader:
 * - Hiển thị danh sách các gói thành viên (packages) của club
 * - Xem chi tiết từng gói thành viên
 * - Cập nhật thông tin gói thành viên (tên, thời hạn, giá, mô tả)
 * - Highlight gói đầu tiên trong danh sách
 * 
 * @param {Object} props
 * @param {Object} props.club - Club object cần quản lý phí
 */
import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

const ClubFeeManagement = ({ club }) => {
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packagesError, setPackagesError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    packageName: '',
    term: '',
    price: 0,
    description: ''
  });
  const [editPackageId, setEditPackageId] = useState(null);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  /**
   * Fetch danh sách packages từ API khi club thay đổi
   * Sử dụng AbortController để hủy request khi component unmount
   */
  useEffect(() => {
    if (!club?.id && !club?.clubId) return;
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');
    const targetClubId = club?.id || club?.clubId;

    const fetchPackages = async () => {
      setLoadingPackages(true);
      setPackagesError('');
      try {
        const res = await fetch(`${API_BASE_URL}/packages/club/${targetClubId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.code === 1000 || data.code === 0)) {
          setPackages(data.result || []);
        } else {
          setPackages([]);
          setPackagesError(data.message || 'Không thể tải danh sách gói thành viên.');
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Fetch packages error:', err);
        setPackagesError('Không thể tải danh sách gói thành viên.');
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
    return () => controller.abort();
  }, [club?.id, club?.clubId]);

  /**
   * Xem chi tiết một package cụ thể
   * @param {number|string} packageId - ID của package cần xem chi tiết
   */
  const handleViewDetail = async (packageId) => {
    if (!packageId) return;
    setDetail(null);
    setDetailError('');
    setDetailLoading(true);
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal: controller.signal
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.code === 1000 || data.code === 0)) {
        setDetail(data.result || null);
      } else {
        setDetailError(data.message || 'Không thể tải chi tiết gói.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Fetch package detail error:', err);
        setDetailError('Không thể tải chi tiết gói.');
      }
    } finally {
      setDetailLoading(false);
    }
    return () => controller.abort();
  };

  /**
   * Mở modal chỉnh sửa package
   * Fetch chi tiết package từ API để có đầy đủ thông tin, fallback về dữ liệu từ list nếu API fail
   * @param {Object} pkg - Package object cần chỉnh sửa
   */
  const openEdit = async (pkg) => {
    const packageId = pkg?.packageId || pkg?.id;
    if (!packageId) {
      setEditError('Không tìm thấy ID gói thành viên.');
      return;
    }

    // Fetch chi tiết package từ API để có đầy đủ thông tin
    const token = localStorage.getItem('authToken');
    setEditError('');
    setEditLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.code === 1000 || data.code === 0)) {
        const packageDetail = data.result || {};
        // Lọc bỏ giá trị "string" từ BE (có thể là placeholder)
        const cleanValue = (value) => {
          if (value === 'string' || value === 'String') return '';
          return value || '';
        };
        
        setEditData({
          packageName: cleanValue(packageDetail.packageName) || cleanValue(pkg?.packageName) || '',
          term: cleanValue(packageDetail.term) || cleanValue(pkg?.term) || '',
          price: packageDetail.price !== undefined && packageDetail.price !== 'string' 
            ? packageDetail.price 
            : (pkg?.price !== undefined && pkg?.price !== 'string' ? pkg.price : 0),
          description: cleanValue(packageDetail.description) || cleanValue(pkg?.description) || ''
        });
        setEditPackageId(packageId);
        setEditOpen(true);
      } else {
        // Fallback to package data from list if API fails
        const cleanValue = (value) => {
          if (value === 'string' || value === 'String') return '';
          return value || '';
        };
        setEditData({
          packageName: cleanValue(pkg?.packageName) || '',
          term: cleanValue(pkg?.term) || '',
          price: pkg?.price !== undefined && pkg?.price !== 'string' ? pkg.price : 0,
          description: cleanValue(pkg?.description) || ''
        });
        setEditPackageId(packageId);
        setEditOpen(true);
        setEditError(data?.message || 'Không thể tải chi tiết gói. Đang sử dụng dữ liệu từ danh sách.');
      }
    } catch (err) {
      console.error('Fetch package detail for edit error:', err);
      // Fallback to package data from list
      const cleanValue = (value) => {
        if (value === 'string' || value === 'String') return '';
        return value || '';
      };
      setEditData({
        packageName: cleanValue(pkg?.packageName) || '',
        term: cleanValue(pkg?.term) || '',
        price: pkg?.price !== undefined && pkg?.price !== 'string' ? pkg.price : 0,
        description: cleanValue(pkg?.description) || ''
      });
      setEditPackageId(packageId);
      setEditOpen(true);
      setEditError('Không thể tải chi tiết gói. Đang sử dụng dữ liệu từ danh sách.');
    } finally {
      setEditLoading(false);
    }
  };

  /**
   * Xử lý thay đổi input trong form edit
   * @param {Event} e - Event object từ input change
   */
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) || 0 : value
    }));
  };

  /**
   * Cập nhật thông tin package lên API
   * Validate dữ liệu trước khi gửi (tên, thời hạn, giá)
   * @param {number|string} packageId - ID của package cần cập nhật
   */
  const handleUpdatePackage = async (packageId) => {
    if (!packageId) {
      setEditError('Không tìm thấy ID gói thành viên.');
      return;
    }
    
    if (!editData.packageName || !editData.packageName.trim()) {
      setEditError('Tên gói không được để trống');
      return;
    }

    if (!editData.term || !editData.term.trim()) {
      setEditError('Thời hạn không được để trống');
      return;
    }

    // Validate price - phải là số và >= 0
    const price = Number(editData.price);
    if (isNaN(price) || price < 0) {
      setEditError('Giá phải là số và lớn hơn hoặc bằng 0');
      return;
    }

    setEditLoading(true);
    setEditError('');
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      setEditError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      setEditLoading(false);
      return;
    }

    try {
      // Chuẩn bị payload theo đúng format API
      const payload = {
        packageName: editData.packageName.trim(),
        term: (editData.term || '').trim(),
        price: price,
        description: (editData.description || '').trim()
      };

      console.log('Updating package:', { packageId, payload });

      const res = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      console.log('Update package response:', { status: res.status, data });

      if (res.status === 401) {
        setEditError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setEditLoading(false);
        return;
      }

      if (res.status === 500) {
        const errorMessage = data?.message || 'Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
        console.error('Server error (500):', { packageId, payload, response: data });
        setEditError(errorMessage);
        setEditLoading(false);
        return;
      }

      if (res.ok && (data.code === 1000 || data.code === 0)) {
        const updated = data.result || {};
        setPackages(prev =>
          prev.map(pkg =>
            (pkg.packageId || pkg.id) === (updated.packageId || updated.id || packageId)
              ? { ...pkg, ...updated }
              : pkg
          )
        );
        // also update detail if same package
        setDetail(prev =>
          prev && (prev.packageId === updated.packageId || prev.id === updated.id || prev.packageId === packageId)
            ? { ...prev, ...updated }
            : prev
        );
        setEditOpen(false);
        setEditError('');
      } else {
        const errorMessage = data?.message || data?.error || `Cập nhật gói không thành công (mã ${res.status}).`;
        console.error('Update package failed:', { status: res.status, data, packageId });
        setEditError(errorMessage);
      }
    } catch (err) {
      console.error('Update package error:', err);
      setEditError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.');
    } finally {
      setEditLoading(false);
    }
  };

  if (!club) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy thông tin club</h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light p-6">
        <h2 className="text-2xl font-bold text-white m-0 flex items-center gap-3">
          <span>💰</span>
          <span>Quản lý Phí tham gia & Thời hạn</span>
        </h2>
        <p className="text-white/90 text-base mt-2">Danh sách gói thành viên của câu lạc bộ</p>
      </div>

      <div className="p-8">
        {/* Highlight first package */}
        {packages.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-fpt-blue text-white px-6 py-4 flex items-center justify-between">
                <div className="text-lg font-semibold">
                  {packages[0].packageName || 'Gói thành viên'}
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${packages[0].isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                  {packages[0].isActive ? 'Hoạt động' : 'Ngưng'}
                </span>
              </div>
              <div className="px-6 py-5 space-y-3 text-gray-800">
                <p className="m-0 text-sm leading-6 text-gray-700">
                  {packages[0].description || 'Không có mô tả'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Thời hạn:</span>
                    <span>{packages[0].term || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Giá:</span>
                    <span>{packages[0].price ? `${packages[0].price.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Ngày tạo:</span>
                    <span>{packages[0].createdAt ? new Date(packages[0].createdAt).toLocaleDateString('vi-VN') : '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">CLB:</span>
                    <span>{packages[0].clubName || club?.name || '-'}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleViewDetail(packages[0].packageId || packages[0].id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white text-sm font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-70"
                    disabled={detailLoading}
                  >
                    {detailLoading ? 'Đang tải...' : 'Chi tiết gói'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(packages[0])}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all ml-3"
                  >
                    Cập nhật gói
                  </button>
                  {detailError && (
                    <p className="text-red-600 text-sm mt-2">{detailError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white px-6 py-4 flex items-center justify-between">
              <h3 className="m-0 text-xl font-semibold">
                {detail.packageName || 'Chi tiết gói thành viên'}
              </h3>
              <button
                className="text-white text-xl bg-transparent border-none cursor-pointer px-2 py-1"
                onClick={() => setDetail(null)}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-3 text-gray-800">
              <p className="text-sm text-gray-600">{detail.description || 'Không có mô tả'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><strong>CLB:</strong> {detail.clubName || '-'}</div>
                <div><strong>Thời hạn:</strong> {detail.term || '-'}</div>
                <div><strong>Giá:</strong> {detail.price ? `${detail.price.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}</div>
                <div><strong>Trạng thái:</strong> {detail.isActive ? 'Đang kích hoạt' : 'Ngưng'}</div>
                <div><strong>Ngày tạo:</strong> {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('vi-VN') : '-'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white px-6 py-4 flex items-center justify-between">
              <h3 className="m-0 text-xl font-semibold">Cập nhật gói</h3>
              <button
                className="text-white text-xl bg-transparent border-none cursor-pointer px-2 py-1"
                onClick={() => {
                  setEditOpen(false);
                  setEditError('');
                  setEditPackageId(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4 text-gray-800">
              {editLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-fpt-blue/30 border-t-fpt-blue rounded-full"></div>
                  <p className="text-sm text-gray-600 mt-2">Đang tải thông tin gói...</p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Tên gói *</label>
                <input
                  type="text"
                  name="packageName"
                  value={editData.packageName}
                  onChange={handleEditChange}
                  className="px-4 py-3 border-2 rounded-lg text-sm focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 border-gray-200"
                  placeholder="Nhập tên gói"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Thời hạn *</label>
                <input
                  type="text"
                  name="term"
                  value={editData.term}
                  onChange={handleEditChange}
                  className="px-4 py-3 border-2 rounded-lg text-sm focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 border-gray-200"
                  placeholder="VD: 1 năm, 6 tháng, 1 tháng"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Giá (VNĐ)</label>
                <input
                  type="number"
                  name="price"
                  value={editData.price}
                  onChange={handleEditChange}
                  min="0"
                  className="px-4 py-3 border-2 rounded-lg text-sm focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 border-gray-200"
                  placeholder="Nhập giá (0 = Miễn phí)"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Mô tả</label>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  rows="3"
                  className="px-4 py-3 border-2 rounded-lg text-sm focus:outline-none focus:border-fpt-blue focus:ring-4 focus:ring-fpt-blue/10 border-gray-200"
                  placeholder="Nhập mô tả gói"
                />
              </div>
              {editError && <p className="text-red-600 text-sm">{editError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditOpen(false);
                    setEditError('');
                    setEditPackageId(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition-all"
                  disabled={editLoading}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdatePackage(editPackageId)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white text-sm font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-70"
                  disabled={editLoading || !editPackageId}
                >
                  {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubFeeManagement;

