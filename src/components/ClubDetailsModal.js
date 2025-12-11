import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

const ClubDetailsModal = ({ club, onClose, onJoinRequest, getRequestStatus }) => {
  const { showToast } = useToast();
  const [clubDetail, setClubDetail] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!club || !club.id) {
      setLoading(false);
      return;
    }

    const fetchClubDetail = async () => {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('authToken');
      
      try {
        const response = await fetch(`${API_BASE_URL}/clubs/${club.id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data || data.code !== 1000) {
          const message = data?.message || 'Không thể tải thông tin CLB.';
          setError(message);
          // Fallback to passed club data if API fails
          setClubDetail(null);
        } else {
          // Map API response to local format
          const result = data.result || {};
          const clubId = result.clubId || club.id || club.clubId;
          setClubDetail({
            clubId: clubId,
            clubName: result.clubName || club.name,
            category: result.category || club.category,
            logo: result.logo,
            location: result.location || club.location,
            description: result.description || club.description,
            email: result.email || club.email,
            isActive: result.isActive !== undefined ? result.isActive : true,
            establishedDate: result.establishedDate || club.foundedDate,
            founderId: result.founderId,
            founderName: result.founderName || club.president,
            founderStudentCode: result.founderStudentCode,
            memberCount: result.memberCount || result.totalMembers || 0, // Số thành viên từ API
            activityTime: result.activityTime || club.activityTime
          });
          
          // Fetch packages for this club
          if (clubId) {
            try {
              const packagesRes = await fetch(`${API_BASE_URL}/packages/club/${clubId}`, {
                headers: { 'Content-Type': 'application/json' }
              });
              const packagesData = await packagesRes.json().catch(() => ({}));
              if (packagesRes.ok && (packagesData.code === 1000 || packagesData.code === 0)) {
                setPackages(Array.isArray(packagesData.result) ? packagesData.result : []);
              }
            } catch (err) {
              console.warn('Failed to fetch packages:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching club detail:', err);
        setError('Không thể tải thông tin CLB.');
        // Fallback to passed club data
        setClubDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetail();
  }, [club]);

  if (!club) return null;

  const normalizedClubId = club?.id || club?.clubId;
  const requestStatus = getRequestStatus ? getRequestStatus(normalizedClubId) : null;
  
  // Use API data if available, otherwise fallback to passed club data
  const displayClub = clubDetail || club;
  const joinableClub = { ...displayClub, id: displayClub.id || displayClub.clubId };

  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('hoạt động')) return 'bg-green-500 text-white';
    if (statusLower.includes('tạm ngưng')) return 'bg-orange-500 text-white';
    if (statusLower.includes('ngừng')) return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl my-5" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
          <h2 className="text-2xl font-bold m-0">Chi tiết câu lạc bộ</h2>
          <button 
            className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
            onClick={() => onClose && onClose()}
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-10 h-10 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin CLB...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <p className="text-sm text-gray-500 mt-2">Đang hiển thị thông tin từ cache...</p>
            </div>
          ) : null}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b-2 border-gray-200">
            <div className="flex items-center gap-4">
              {displayClub.logo && (
                <img 
                  src={displayClub.logo} 
                  alt={displayClub.clubName || displayClub.name} 
                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                />
              )}
              <h3 className="text-2xl font-bold text-gray-800 m-0">
                {displayClub.clubName || displayClub.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="opacity-70">Trạng thái:</span>
              <span className={`px-4 py-2 rounded-full text-xs font-semibold uppercase ${
                displayClub.isActive !== false 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {displayClub.isActive !== false ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Danh mục:</span>
                <span className="text-sm font-semibold text-gray-800">{displayClub.category || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Chủ tịch:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {displayClub.founderName || displayClub.president || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Số thành viên:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {displayClub.memberCount !== undefined
                    ? displayClub.memberCount
                    : (club.memberCount || club.totalMembers || 0)}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Địa điểm:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {displayClub.location || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Email:</span>
                <span className="text-sm font-semibold text-gray-800 break-all">
                  {displayClub.email || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Ngày thành lập:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {displayClub.establishedDate 
                    ? new Date(displayClub.establishedDate).toLocaleDateString('vi-VN') 
                    : (displayClub.foundedDate 
                      ? new Date(displayClub.foundedDate).toLocaleDateString('vi-VN') 
                      : 'N/A')}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Thời gian sinh hoạt:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {displayClub.activityTime || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 font-medium mb-1">Phí tham gia:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {packages.length > 0 ? (() => {
                    const activePackage = packages.find(pkg => pkg.isActive !== false) || packages[0];
                    const price = activePackage?.price || 0;
                    const term = activePackage?.term || '';
                    return price > 0 
                      ? `${price.toLocaleString('vi-VN')} VNĐ${term ? ` / ${term}` : ''}`
                      : `Miễn phí${term ? ` / ${term}` : ''}`;
                  })() : (club.participationFee && club.participationFee > 0
                    ? `${club.participationFee.toLocaleString('vi-VN')} VNĐ${club.packageTerm ? ` / ${club.packageTerm}` : (club.membershipDuration ? ` / ${club.membershipDuration} tháng` : '')}`
                    : `Miễn phí${club.packageTerm ? ` / ${club.packageTerm}` : (club.membershipDuration ? ` / ${club.membershipDuration} tháng` : ' / 6 tháng')}`)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Mô tả</h4>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-fpt-blue">
              {displayClub.description || 'Chưa có mô tả'}
            </p>
          </div>

        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t-2 border-gray-200 rounded-b-xl">
          {onJoinRequest && (
            <div className="flex gap-3">
              {requestStatus === 'pending' && (
                <span className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 text-white">
                  Đang chờ duyệt
                </span>
              )}
              {requestStatus === 'approved' && (
                <span className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-green-500 text-white">
                  Đã được chấp nhận
                </span>
              )}
              {requestStatus === 'rejected' && (
                <span className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white">
                  Đã bị từ chối
                </span>
              )}
              {!requestStatus && (
                <button 
                  className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl" 
                  onClick={() => {
                    if (onJoinRequest) {
                      onJoinRequest(joinableClub);
                      if (onClose) onClose({ keepSelected: true });
                    }
                  }}
                >
                  Tham gia
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubDetailsModal;

