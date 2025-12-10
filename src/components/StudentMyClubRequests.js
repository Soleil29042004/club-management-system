import React, { useEffect, useState } from 'react';
import { useToast } from './Toast';
const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

const statusMap = {
  ChoDuyet: { text: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700' },
  DaDuyet: { text: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
  TuChoi: { text: 'Từ chối', color: 'bg-red-100 text-red-700' },
  DaRoiCLB: { text: 'Đã rời CLB', color: 'bg-gray-200 text-gray-700' }
};

const StudentMyClubRequests = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true; // Flag để tránh setState sau khi component unmount
    
    const fetchMyRegistrations = async () => {
      // Lấy token từ cả authToken và token
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        if (isMounted) {
          setError('Vui lòng đăng nhập để xem đăng ký của bạn.');
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/registers/my-registrations`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => null);
        
        // Xử lý lỗi 401 Unauthorized
        if (response.status === 401) {
          if (isMounted) {
            setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            setLoading(false);
            // Chỉ hiển thị toast một lần
            showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
          }
          return;
        }
        
        // Kiểm tra response code
        if (!response.ok || !data || data.code !== 1000) {
          const message = data?.message || data?.error || 'Không thể tải danh sách đăng ký.';
          if (isMounted) {
            setError(message);
            setLoading(false);
          }
          return;
        }

        // Lấy danh sách đăng ký
        const raw = data.result || [];
        // Sắp xếp mới nhất trước
        raw.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        if (isMounted) {
          setRegistrations(raw);
          setLoading(false);
        }
      } catch (err) {
        console.error('Fetch my registrations error:', err);
        if (isMounted) {
          const message = err.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
          setError(message);
          setLoading(false);
          // Chỉ hiển thị toast nếu không phải lỗi 401 (đã xử lý ở trên)
          if (!message.includes('hết hạn')) {
            showToast(message, 'error');
          }
        }
      }
    };

    fetchMyRegistrations();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi component mount, không phụ thuộc vào showToast

  const renderStatus = (status) => {
    const info = statusMap[status] || { text: status || 'Không xác định', color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${info.color}`}>
        {info.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full mb-4"></div>
        <p className="m-0 text-base">Đang tải danh sách đơn đã gửi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-red-600">
        <p className="m-0 text-base">{error}</p>
      </div>
    );
  }

  if (!registrations.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-600">
        <div className="text-5xl mb-4">📭</div>
        <p className="m-0 text-lg">Bạn chưa có đăng ký tham gia câu lạc bộ.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-fpt-blue/10">
        <h2 className="text-2xl font-bold text-fpt-blue m-0">Đăng ký tham gia CLB</h2>
        <p className="text-gray-600 mt-2 mb-0">Theo dõi trạng thái các đăng ký membership của bạn</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">CLB</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Gói</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Giá</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ngày đăng ký</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ngày tham gia</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Hiệu lực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registrations.map((reg) => (
                <tr key={reg.subscriptionId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{reg.clubName || '-'}</div>
                    <div className="text-xs text-gray-500">#{reg.subscriptionId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{reg.packageName || '-'}</div>
                    <div className="text-xs text-gray-500">{reg.term || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {reg.price ? `${reg.price.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}
                    <div className="text-xs text-gray-500">
                      {reg.isPaid ? `Đã thanh toán (${reg.paymentMethod || 'N/A'})` : 'Chưa thanh toán'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {renderStatus(reg.status)}
                    <div className="text-xs text-gray-500 mt-1">{reg.clubRole ? `Vai trò: ${reg.clubRole}` : ''}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {reg.createdAt ? new Date(reg.createdAt).toLocaleString('vi-VN') : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {reg.joinDate ? new Date(reg.joinDate).toLocaleString('vi-VN') : '—'}
                    <div className="text-xs text-gray-500">
                      {reg.paymentDate ? `Thanh toán: ${new Date(reg.paymentDate).toLocaleString('vi-VN')}` : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {reg.startDate && reg.endDate
                      ? `${new Date(reg.startDate).toLocaleDateString('vi-VN')} → ${new Date(reg.endDate).toLocaleDateString('vi-VN')}`
                      : '—'}
                    {reg.approverName && (
                      <div className="text-xs text-gray-500 mt-1">Duyệt: {reg.approverName}</div>
                    )}
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

export default StudentMyClubRequests;

