/**
 * Club Service
 * 
 * Service layer cho club APIs:
 * - List clubs
 * - Get club detail
 * - Update club
 * - Get club members
 * - Get club stats
 * - Get user's joined clubs
 */

import { apiRequest, API_BASE_URL } from './apiClient';

/**
 * List all clubs
 * @param {string} token - Auth token (optional)
 * @returns {Promise<Object>} - Clubs list
 */
export const listClubs = async (token) => {
  return apiRequest('/clubs', {
    method: 'GET',
    token
  });
};

/**
 * Get club detail by ID
 * @param {string|number} clubId - Club ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Club data
 */
export const getClubDetail = async (clubId, token) => {
  return apiRequest(`/clubs/${clubId}`, {
    method: 'GET',
    token
  });
};

/**
 * Update club information
 * @param {string|number} clubId - Club ID
 * @param {Object} clubData - Club data to update
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Updated club data
 */
export const updateClub = async (clubId, clubData, token) => {
  return apiRequest(`/clubs/${clubId}`, {
    method: 'PUT',
    body: clubData,
    token
  });
};

/**
 * Get club members
 * @param {string|number} clubId - Club ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Members list
 */
export const getClubMembers = async (clubId, token) => {
  return apiRequest(`/clubs/${clubId}/members`, {
    method: 'GET',
    token
  });
};

/**
 * Get club statistics
 * @param {string|number} clubId - Club ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Club stats
 */
export const getClubStats = async (clubId, token) => {
  return apiRequest(`/clubs/${clubId}/stats`, {
    method: 'GET',
    token
  });
};

/**
 * Get user's joined clubs
 * @param {string|number} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Joined clubs list
 */
export const getUserJoinedClubs = async (userId, token) => {
  return apiRequest(`/clubs/user/${userId}/joined`, {
    method: 'GET',
    token
  });
};



