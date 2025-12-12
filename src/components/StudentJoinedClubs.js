import React, { useEffect, useState } from 'react';
import { useToast } from './Toast';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

// Helper to parse JWT (best-effort)
const parseJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(payload);
    return JSON.parse(json);
  } catch (err) {
    console.warn('Cannot parse token', err);
    return null;
  }
};

const StudentJoinedClubs = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clubs, setClubs] = useState([]);

  const resolveUserId = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed.userId || parsed.id || parsed.userID || parsed.user?.id;
      } catch (e) {
        console.warn('Cannot parse stored user', e);
      }
    }
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      const payload = parseJWT(token);
      return (
        payload?.sub ||
        payload?.nameid ||
        payload?.userId ||
        payload?.UserId ||
        payload?.id
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchJoinedClubs = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xem danh sách CLB đã tham gia.');
        setLoading(false);
        return;
      }

      const userId = resolveUserId();
      if (!userId) {
        setError('Không tìm thấy thông tin người dùng.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/clubs/user/${userId}/joined`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || (data.code !== 1000 && data.code !== 0)) {
          throw new Error(data?.message || 'Không thể tải danh sách CLB đã tham gia.');
        }

        setClubs(data.result || []);
      } catch (err) {
        console.error('Fetch joined clubs error:', err);
        const message = err.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderStatus = (club) => {
    const now = new Date();
    const end = club.endDate ? new Date(club.endDate) : null;
    const active = club.isActive !== false && (!end || end >= now);
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {active ? 'Đang hiệu lực' : 'Hết hạn'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full mb-4"></div>
        <p className="m-0 text-base">Đang tải danh sách CLB đã tham gia...</p>
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

  if (!clubs.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-600">
        <div className="text-5xl mb-4">🙌</div>
        <p className="m-0 text-lg">Bạn chưa tham gia câu lạc bộ nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-fpt-blue/10">
        <h2 className="text-2xl font-bold text-fpt-blue m-0">CLB đã tham gia</h2>
        <p className="text-gray-600 mt-2 mb-0">Danh sách các CLB bạn đã được duyệt và đã đóng phí</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clubs.map((club) => (
          <div key={club.clubId} className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={club.clubName}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-fpt-blue/10 text-fpt-blue flex items-center justify-center font-semibold">
                  {club.clubName?.charAt(0) || 'C'}
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-base">{club.clubName}</div>
                <div className="text-xs text-gray-500">{club.category || 'Khác'}</div>
              </div>
              {renderStatus(club)}
            </div>

            <div className="text-sm text-gray-700 leading-relaxed">{club.description || 'Chưa có mô tả'}</div>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <div className="text-xs text-gray-500">Vai trò</div>
                <div className="font-semibold">{club.clubRole || 'Thành viên'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Gói</div>
                <div className="font-semibold">{club.packageName || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Ngày tham gia</div>
                <div className="font-semibold">
                  {club.joinedAt ? new Date(club.joinedAt).toLocaleDateString('vi-VN') : '—'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Ngày hết hạn</div>
                <div className="font-semibold">
                  {club.endDate ? new Date(club.endDate).toLocaleDateString('vi-VN') : '—'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded-md">Liên hệ: {club.email || '—'}</span>
              {club.location && <span className="px-2 py-1 bg-gray-100 rounded-md">Địa điểm: {club.location}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentJoinedClubs;

