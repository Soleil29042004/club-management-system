import React, { useEffect, useState } from 'react';
import { useToast } from './Toast';
import { clubCategoryLabels } from '../data/mockData';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

const statusMap = {
  DangCho: { text: 'Đang chờ', color: 'bg-amber-100 text-amber-700' },
  DaDuyet: { text: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
  TuChoi: { text: 'Từ chối', color: 'bg-red-100 text-red-700' }
};

const StudentMyClubRequests = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true; // Flag để tránh setState sau khi component unmount
    
    const fetchMyRequests = async () => {
      // Lấy token từ cả authToken và token
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        if (isMounted) {
          setError('Vui lòng đăng nhập để xem đơn đã gửi.');
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/club-requests/my-requests`, {
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
        
        // Kiểm tra response code: API này trả về code 1000 khi thành công
        if (!response.ok || !data || data.code !== 1000) {
          const message = data?.message || data?.error || 'Không thể tải danh sách đơn.';
          if (isMounted) {
            setError(message);
            setLoading(false);
          }
          return;
        }

        // Lấy danh sách requests từ result
        const rawRequests = data.result || [];
        
        // Loại bỏ duplicate dựa trên requestId (đảm bảo không có requestId trùng)
        const uniqueById = rawRequests.reduce((acc, req) => {
          const requestId = req.requestId || req.id;
          if (requestId && !acc.find(r => (r.requestId || r.id) === requestId)) {
            acc.push(req);
          }
          return acc;
        }, []);

        // Group theo tên CLB và chỉ lấy đơn mới nhất của mỗi tên
        // Nếu có nhiều đơn cùng tên, chỉ hiển thị đơn mới nhất
        const groupedByName = uniqueById.reduce((acc, req) => {
          const name = req.proposedName?.trim();
          if (!name) return acc;
          
          const existing = acc.find(r => r.proposedName?.trim() === name);
          if (!existing) {
            acc.push(req);
          } else {
            // So sánh ngày tạo, giữ lại đơn mới hơn
            const existingDate = existing.createdAt ? new Date(existing.createdAt).getTime() : 0;
            const currentDate = req.createdAt ? new Date(req.createdAt).getTime() : 0;
            if (currentDate > existingDate) {
              // Thay thế bằng đơn mới hơn
              const index = acc.indexOf(existing);
              acc[index] = req;
            }
          }
          return acc;
        }, []);

        // Sắp xếp theo ngày tạo (mới nhất trước)
        groupedByName.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        if (isMounted) {
          setRequests(groupedByName);
          setLoading(false);
        }
      } catch (err) {
        console.error('Fetch my club requests error:', err);
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

    fetchMyRequests();
    
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

  if (!requests.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-600">
        <div className="text-5xl mb-4">📭</div>
        <p className="m-0 text-lg">Bạn chưa gửi yêu cầu mở câu lạc bộ nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-fpt-blue/10">
        <h2 className="text-2xl font-bold text-fpt-blue m-0">Lịch sử đơn đã gửi</h2>
        <p className="text-gray-600 mt-2 mb-0">Theo dõi trạng thái các yêu cầu mở câu lạc bộ của bạn</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Tên CLB</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Danh mục</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Ngày gửi</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Mục đích</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.requestId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{req.proposedName}</div>
                    <div className="text-sm text-gray-500">{req.email || req.creatorEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {clubCategoryLabels[req.category] || req.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {renderStatus(req.status)}
                  </td>
                  <td className="px-6 py-4 text-gray-700 max-w-xs">
                    <div className="line-clamp-2">{req.purpose || req.description}</div>
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

