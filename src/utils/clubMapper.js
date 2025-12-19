/**
 * Club Data Mapper Utilities
 * 
 * Các hàm để map dữ liệu club từ API format sang format của component
 */

import { clubCategoryLabels } from '../data/constants';

/**
 * Map dữ liệu club từ API format sang format của component
 * @param {Object} apiClub - Club object từ API
 * @returns {Object} - Club object cho component
 */
export const mapApiClubToComponent = (apiClub) => {
  if (!apiClub) return null;
  
  return {
    id: apiClub?.clubId || apiClub?.id,
    clubId: apiClub?.clubId || apiClub?.id,
    name: apiClub?.clubName || apiClub?.name || '',
    description: apiClub?.description || '',
    category: clubCategoryLabels[apiClub?.category] || apiClub?.category || '',
    categoryCode: apiClub?.category, // Giữ lại category code gốc để gửi API
    foundedDate: apiClub?.establishedDate || apiClub?.foundedDate || '',
    president: apiClub?.founderName || apiClub?.presidentName || apiClub?.president || '',
    memberCount: apiClub?.totalMembers || apiClub?.memberCount || apiClub?.members?.length || 0,
    status: apiClub?.isActive ? 'Hoạt động' : 'Ngừng hoạt động',
    email: apiClub?.email || '',
    location: apiClub?.location || '',
    logo: apiClub?.logo || apiClub?.clubLogo || null,
    activityTime: apiClub?.activityTime || '',
    founderId: apiClub?.founderId,
    founderStudentCode: apiClub?.founderStudentCode,
    raw: apiClub // Giữ lại raw data để reference nếu cần
  };
};

/**
 * Map mảng clubs từ API
 * @param {Array} apiClubs - Mảng club objects từ API
 * @returns {Array} - Mảng club objects cho component
 */
export const mapApiClubsToComponent = (apiClubs) => {
  if (!Array.isArray(apiClubs)) return [];
  return apiClubs.map(mapApiClubToComponent).filter(club => club !== null);
};

