/**
 * Authentication Utilities
 * 
 * Các hàm tiện ích liên quan đến xác thực người dùng:
 * - Parse JWT token để lấy thông tin user
 * - Map scope từ JWT thành role của ứng dụng
 * - Xử lý token và user data
 */

/**
 * Parse JWT token để lấy payload (thông tin user)
 * @param {string} token - JWT token string
 * @returns {Object|null} - Decoded payload hoặc null nếu lỗi
 */
export const parseJWTToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode payload (phần thứ 2 của JWT: header.payload.signature)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

/**
 * Map scope từ JWT token thành role của ứng dụng
 * @param {string} scopeRaw - Scope từ JWT token (có thể là 'QuanTriVien', 'SinhVien', etc.)
 * @returns {string} - Role của ứng dụng: 'admin', 'student', hoặc 'club_leader'
 */
export const mapScopeToRole = (scopeRaw) => {
  if (!scopeRaw) return 'student';
  
  const scope = String(scopeRaw).toLowerCase();
  
  // QuanTriVien -> admin
  if (scope === 'quantrivien' || scope === 'admin') {
    return 'admin';
  }
  
  // SinhVien -> student
  if (scope === 'sinhvien' || scope === 'student') {
    return 'student';
  }
  
  // Các scope khác (ClubLeader, etc.) -> club_leader
  return 'club_leader';
};

/**
 * Extract user ID từ JWT token payload
 * @param {Object} payload - Decoded JWT payload
 * @returns {string|null} - User ID hoặc null
 */
export const extractUserIdFromToken = (payload) => {
  if (!payload) return null;
  return payload.sub || payload.nameid || payload.userId || payload.UserId || null;
};

/**
 * Extract club IDs từ JWT token payload
 * @param {Object} payload - Decoded JWT payload
 * @returns {Array} - Mảng các club IDs
 */
export const extractClubIdsFromToken = (payload) => {
  if (!payload) return [];
  
  const clubIds = payload.clubIds || payload.clubIDs || payload.ClubIds || payload.ClubIDs;
  return Array.isArray(clubIds) ? clubIds : [];
};

/**
 * Extract club ID từ JWT token payload (lấy club ID đầu tiên nếu có nhiều)
 * @param {Object} payload - Decoded JWT payload
 * @returns {string|null} - Club ID hoặc null
 */
export const extractClubIdFromToken = (payload) => {
  if (!payload) return null;
  
  const clubId = payload.clubId || payload.clubID || payload.ClubId || payload.ClubID;
  if (clubId) return clubId;
  
  // Nếu không có clubId trực tiếp, thử lấy từ club object
  if (payload.club?.clubId) return payload.club.clubId;
  
  // Nếu không có, lấy từ mảng clubIds
  const clubIds = extractClubIdsFromToken(payload);
  return clubIds.length > 0 ? clubIds[0] : null;
};

/**
 * Extract scope/role từ JWT token payload
 * @param {Object} payload - Decoded JWT payload
 * @returns {string|null} - Scope hoặc null
 */
export const extractScopeFromToken = (payload) => {
  if (!payload) return null;
  return payload.scope || payload.role || payload.Roles || payload.roleName || null;
};

/**
 * Lấy thông tin user từ localStorage
 * @returns {Object|null} - User object hoặc null
 */
export const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from storage:', error);
    return null;
  }
};

/**
 * Lưu thông tin user vào localStorage
 * @param {Object} userData - User data object
 */
export const saveUserToStorage = (userData) => {
  try {
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
};

/**
 * Lấy auth token từ localStorage
 * @returns {string|null} - Token hoặc null
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

/**
 * Lưu auth token vào localStorage
 * @param {string} token - JWT token
 */
export const saveAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * Xóa tất cả dữ liệu authentication khỏi localStorage
 */
export const clearAuthData = () => {
  const keysToRemove = [
    'authToken',
    'token',
    'user',
    'role',
    'joinRequests',
    'payments',
    'clubRequests'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
};



