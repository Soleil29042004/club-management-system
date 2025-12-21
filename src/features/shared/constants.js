/**
 * Constants - Hằng số cho hệ thống quản lý CLB
 * 
 * File này chứa các constants được sử dụng trong toàn bộ ứng dụng:
 * - Club categories và labels
 * - Member roles
 * - Status options
 */

/**
 * Danh sách các danh mục club (category codes)
 * Được sử dụng trong API và database
 */
export const clubCategories = [
  "HocThuat",   // Học thuật (IT, English, Science...)
  "TheThao",    // Thể thao (Soccer, Badminton...)
  "NgheThuat",  // Nghệ thuật (Music, Dance, Art...)
  "TinhNguyen", // Tình nguyện (Volunteer, Social work...)
  "Khac"        // Khác (Other)
];

/**
 * Mapping category codes sang tên hiển thị tiếng Việt
 * Sử dụng để hiển thị tên đẹp cho user thay vì code
 */
export const clubCategoryLabels = {
  "HocThuat": "Học thuật",
  "TheThao": "Thể thao",
  "NgheThuat": "Nghệ thuật",
  "TinhNguyen": "Tình nguyện",
  "Khac": "Khác"
};

/**
 * Danh sách các vai trò thành viên trong club
 * Được sử dụng trong UI và validation
 */
export const memberRoles = [
  "Chủ tịch",
  "Phó chủ tịch",
  "Thư ký",
  "Thành viên"
];

/**
 * Danh sách các trạng thái hoạt động
 * Được sử dụng cho clubs và members
 */
export const statusOptions = [
  "Hoạt động",
  "Tạm ngưng",
  "Ngừng hoạt động"
];



