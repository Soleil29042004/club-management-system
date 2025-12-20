/**
 * StudentJoinedClubs Component
 * 
 * Component hiển thị danh sách CLB mà student đã tham gia:
 * - Hiển thị thông tin: tên CLB, danh mục, mô tả, vai trò, gói thành viên, ngày tham gia, ngày hết hạn
 * - Hiển thị trạng thái membership (Đang hiệu lực / Hết hạn)
 * - Gia hạn membership khi đã hết hạn (nếu canRenew = true)
 * - Rời khỏi CLB (chỉ thành viên đang hoạt động, không phải Chủ tịch)
 * - Resolve userId từ JWT token hoặc localStorage
 * 
 * @returns {JSX.Element} Component hiển thị danh sách CLB đã tham gia
 */
import React, { useEffect, useState } from 'react';
import { useToast } from './Toast';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

/**
 * Helper function để parse JWT token (best-effort)
 * @param {string} token - JWT token string
 * @returns {Object|null} - Decoded payload hoặc null nếu không parse được
 */
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
  const [leavingId, setLeavingId] = useState(null);
  const [renewLoadingId, setRenewLoadingId] = useState(null);

  /**
   * Resolve userId từ JWT token hoặc localStorage
   * Ưu tiên lấy từ token, fallback về localStorage
   * Chỉ trả về giá trị không phải email (không chứa @)
   * @returns {string|null} - userId hoặc null nếu không tìm thấy
   */
  const resolveUserId = () => {
    // Ưu tiên lấy userId từ token trước (đảm bảo là userId, không phải email)
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      const payload = parseJWT(token);
      const userIdFromToken = 
        payload?.sub ||
        payload?.nameid ||
        payload?.userId ||
        payload?.UserId ||
        payload?.id;
      
      // Chỉ dùng nếu không phải email (không chứa @)
      if (userIdFromToken && !userIdFromToken.includes('@')) {
        return userIdFromToken;
      }
    }
    
    // Fallback: lấy từ localStorage nhưng kiểm tra không phải email
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const userId = parsed.userId || parsed.id || parsed.userID || parsed.user?.id;
        // Chỉ dùng nếu không phải email
        if (userId && !userId.includes('@')) {
          return userId;
        }
      } catch (e) {
        console.warn('Cannot parse stored user', e);
      }
    }
    
    return null;
  };

  /**
   * Fetch danh sách CLB đã tham gia từ API
   * Retry nếu chưa có userId (fetch từ /users/my-info)
   */
  useEffect(() => {
    const fetchJoinedClubs = async (retryCount = 0) => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xem danh sách CLB đã tham gia.');
        setLoading(false);
        return;
      }

      let userId = resolveUserId();
      
      // Nếu chưa có userId, thử fetch từ API /users/my-info
      if (!userId) {
        try {
          // ========== API CALL: GET /users/my-info - Get User ID ==========
          // Mục đích: Lấy userId từ API nếu không có trong token/localStorage
          // Response: User object với userId
          const userInfoRes = await fetch(`${API_BASE_URL}/users/my-info`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });
          const userInfoData = await userInfoRes.json().catch(() => ({}));
          
          if (userInfoRes.ok && (userInfoData.code === 1000 || userInfoData.code === 0)) {
            const info = userInfoData.result || userInfoData.data || userInfoData;
            userId = info.userId;
            
            // Lưu vào localStorage để lần sau dùng
            if (userId) {
              const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
              storedUser.userId = userId;
              localStorage.setItem('user', JSON.stringify(storedUser));
            }
          }
        } catch (err) {
          console.warn('Failed to fetch user info:', err);
        }
      }
      
      // Nếu vẫn không có userId sau khi fetch, thử retry
      if (!userId && retryCount < 2) {
        setTimeout(() => {
          fetchJoinedClubs(retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }

      if (!userId) {
        setError('Không tìm thấy thông tin user. Vui lòng thử tải lại trang.');
        setLoading(false);
        return;
      }

      try {
        // ========== API CALL: GET /clubs/user/{userId}/joined - Get Joined Clubs ==========
        // Mục đích: Lấy danh sách CLB mà user đã tham gia (đã được duyệt và đã thanh toán)
        // Response: Array of club objects với clubRole, packageName, startDate, endDate, etc.
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

        const mapped = (data.result || []).map((item) => ({
          id: item.clubId || item.id,
          clubId: item.clubId || item.id,
          clubName: item.clubName || item.name || 'CLB',
          category: item.category || 'Khác',
          logo: item.logo,
          location: item.location,
          description: item.description,
          email: item.email,
          isActive: item.isActive !== undefined ? item.isActive : true,
          establishedDate: item.establishedDate,
          founderId: item.founderId,
          founderName: item.founderName,
          founderStudentCode: item.founderStudentCode,
          subscriptionId: item.subscriptionId,
          packageId: item.packageId,
          packageName: item.packageName,
          clubRole: item.clubRole,
          joinedAt: item.joinedAt,
          endDate: item.endDate,
          canRenew: item.canRenew,
          isExpired: item.isExpired,
          // giữ lại các field cũ nếu API bổ sung
          ...item
        }));

        // Ẩn các membership đã rời CLB (status = DaRoiCLB / DaRoi / tương tự)
        const filtered = mapped.filter((club) => {
          const rawStatus =
            club.status ||
            club.registerStatus ||
            club.registrationStatus ||
            club.membershipStatus;
          const s = (rawStatus || '').toString().trim().toLowerCase();
          return s !== 'daroi' && s !== 'daroi clb' && s !== 'daroiclb';
        });

        setClubs(filtered);
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

  /**
   * Render trạng thái membership (Đang hiệu lực / Hết hạn)
   * @param {Object} club - Club object
   * @returns {JSX.Element} Status badge
   */
  const renderStatus = (club) => {
    const now = new Date();
    const end = club.endDate ? new Date(club.endDate) : null;
    const expiredFlag = club.isExpired === true || (end && end < now);
    const active = club.isActive !== false && !expiredFlag && (!end || end >= now);
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

  /**
   * Normalize string về lowercase, trim
   * @param {any} value - Giá trị cần normalize
   * @returns {string} - Normalized string
   */
  const normalize = (value) => (value || '').toString().trim().toLowerCase();

  /**
   * Kiểm tra role có phải là Chủ tịch không
   * @param {string} role - Role cần kiểm tra
   * @returns {boolean} - true nếu là Chủ tịch
   */
  const isLeaderRole = (role) => normalize(role) === 'chutich';

  /**
   * Kiểm tra status có phải là đã duyệt không
   * @param {string} status - Status cần kiểm tra
   * @returns {boolean} - true nếu đã duyệt
   */
  const isApprovedStatus = (status) => {
    const normalized = normalize(status);
    return normalized === 'daduyet' || normalized === 'approved' || normalized === 'active';
  };

  /**
   * Kiểm tra membership đã thanh toán chưa
   * @param {Object} club - Club object
   * @returns {boolean} - true nếu đã thanh toán hoặc không có thông tin
   */
  const isPaidMembership = (club) => {
    if (club.isPaid === undefined || club.isPaid === null) return true;
    return !!club.isPaid;
  };

  /**
   * Kiểm tra membership còn hiệu lực không
   * @param {Object} club - Club object
   * @returns {boolean} - true nếu còn hiệu lực
   */
  const isActiveMembership = (club) => {
    const now = new Date();
    const end = club.endDate ? new Date(club.endDate) : null;
    const expiredFlag = club.isExpired === true || (end && end < now);
    const inTime = !end || end >= now;
    const apiActive = club.isActive !== false;
    return apiActive && !expiredFlag && inTime;
  };

  /**
   * Kiểm tra student có thể rời CLB không
   * Chỉ cho phép nếu: không phải Chủ tịch, đã duyệt, đã thanh toán, đang hoạt động hoặc đã hết hạn
   * @param {Object} club - Club object
   * @returns {boolean} - true nếu có thể rời
   */
  const canLeaveClub = (club) => {
    if (!club) return false;
    if (isLeaderRole(club.clubRole || club.role)) return false; // Chủ tịch không thể tự rời
    const statusValue = club.status || club.registerStatus || club.registrationStatus;
    const approved = statusValue ? isApprovedStatus(statusValue) : true; // Danh sách này thường chỉ có bản ghi đã duyệt
    const now = new Date();
    const end = club.endDate ? new Date(club.endDate) : null;
    const expiredFlag = club.isExpired === true || (end && end < now);
    // Cho phép rời nếu đang hoạt động và đã thanh toán, hoặc đã hết hạn (expired)
    return approved && isPaidMembership(club) && (isActiveMembership(club) || expiredFlag);
  };

  /**
   * Xử lý rời khỏi CLB
   * Gọi API để đánh dấu status = DaRoiCLB
   * @param {Object} club - Club object cần rời
   */
  const handleLeaveClub = async (club) => {
    if (!club) return;
    if (!canLeaveClub(club)) {
      showToast('Chỉ thành viên đang hoạt động (đã duyệt & đã thanh toán) mới có thể rời CLB.', 'error');
      return;
    }

    const confirmLeave = window.confirm(`Bạn chắc chắn muốn rời khỏi ${club.clubName || 'CLB này'}?`);
    if (!confirmLeave) return;

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Vui lòng đăng nhập để thực hiện thao tác.', 'error');
      return;
    }

    try {
      // ========== API CALL: POST /registers/{clubId}/leave - Leave Club ==========
      // Mục đích: Sinh viên rời khỏi CLB mà mình đang tham gia
      // Điều kiện: Phải là thành viên active (DaDuyet + đã thanh toán), không phải ChuTich
      // Response: { code, message, result }
      setLeavingId(club.clubId);
      const res = await fetch(`${API_BASE_URL}/registers/${club.clubId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.code !== 0 && data.code !== 1000)) {
        throw new Error(data?.message || 'Không thể rời khỏi CLB. Vui lòng thử lại.');
      }

      showToast(data.message || 'Bạn đã rời khỏi CLB thành công.', 'success');
      setClubs((prev) => prev.filter((c) => String(c.clubId) !== String(club.clubId)));
    } catch (err) {
      console.error('Leave club error:', err);
      showToast(err.message || 'Đã xảy ra lỗi khi rời CLB.', 'error');
    } finally {
      setLeavingId(null);
    }
  };

  /**
   * Gia hạn membership cho CLB đã hết hạn
   * Gửi yêu cầu gia hạn, trạng thái chuyển về chờ duyệt, cần thanh toán lại
   * @param {Object} club - Club object cần gia hạn
   */
  const handleRenewClub = async (club) => {
    if (!club?.subscriptionId) {
      showToast('Không tìm thấy subscription để gia hạn.', 'error');
      return;
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      showToast('Vui lòng đăng nhập để gia hạn.', 'error');
      return;
    }

    try {
      // ========== API CALL: POST /registers/{subscriptionId}/renew - Renew Subscription ==========
      // Mục đích: Gia hạn membership của CLB
      // Request body: {} (không truyền packageId để giữ nguyên gói hiện tại)
      // Response: Updated registration object
      setRenewLoadingId(club.subscriptionId);
      const res = await fetch(`${API_BASE_URL}/registers/${club.subscriptionId}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        // Không truyền packageId để giữ nguyên gói hiện tại theo API
        body: JSON.stringify({})
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.code !== 0 && data.code !== 1000)) {
        throw new Error(data?.message || 'Không thể gia hạn gói thành viên.');
      }

      const updated = data.result || {};
      showToast(data.message || 'Đã gửi yêu cầu gia hạn. Trạng thái chuyển về chờ duyệt, vui lòng thanh toán lại.', 'success');

      // Cập nhật thẻ CLB với dữ liệu mới
      setClubs((prev) =>
        prev.map((c) => {
          if (String(c.clubId) !== String(club.clubId)) return c;
          return {
            ...c,
            status: updated.status || 'ChoDuyet',
            isPaid: updated.isPaid ?? false,
            packageId: updated.packageId ?? c.packageId,
            packageName: updated.packageName ?? c.packageName,
            term: updated.term ?? c.term,
            price: updated.price ?? c.price,
            canRenew: updated.canRenew ?? c.canRenew,
            isExpired: updated.isExpired ?? c.isExpired,
            endDate: updated.endDate ?? c.endDate,
            joinedAt: updated.joinDate ?? updated.joinedAt ?? c.joinedAt
          };
        })
      );
    } catch (err) {
      console.error('Renew club error:', err);
      showToast(err.message || 'Không thể gia hạn gói thành viên.', 'error');
    } finally {
      setRenewLoadingId(null);
    }
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

            <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-gray-100 rounded-md">Liên hệ: {club.email || '—'}</span>
                {club.location && <span className="px-2 py-1 bg-gray-100 rounded-md">Địa điểm: {club.location}</span>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {club.canRenew && (club.isExpired || (club.endDate && new Date(club.endDate) < new Date())) && (
                  <button
                    onClick={() => handleRenewClub(club)}
                    disabled={renewLoadingId === club.subscriptionId}
                    className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold hover:bg-blue-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {renewLoadingId === club.subscriptionId ? 'Đang gia hạn...' : 'Gia hạn'}
                  </button>
                )}

                {canLeaveClub(club) ? (
                  <button
                    onClick={() => handleLeaveClub(club)}
                    disabled={leavingId === club.clubId}
                    className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {leavingId === club.clubId ? 'Đang xử lý...' : 'Rời CLB'}
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-400">
                    Chỉ thành viên đang hoạt động (không phải Chủ tịch) có thể rời
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentJoinedClubs;

