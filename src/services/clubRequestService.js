/**
 * Club Request Service
 * 
 * Service layer cho club request APIs:
 * - Create club request
 * - List club requests
 * - Review club request
 */

import { apiRequest, API_BASE_URL } from './apiClient';

/**
 * Create club request
 * @param {Object} requestData - { clubName, description, category, reason }
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Created request
 */
export const createClubRequest = async (requestData, token) => {
  return apiRequest('/club-requests', {
    method: 'POST',
    body: requestData,
    token
  });
};

/**
 * List club requests
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Club requests list
 */
export const listClubRequests = async (token) => {
  return apiRequest('/club-requests', {
    method: 'GET',
    token
  });
};

/**
 * Review club request (approve/reject)
 * @param {string|number} requestId - Request ID
 * @param {Object} reviewData - { status, reviewComment }
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Updated request
 */
export const reviewClubRequest = async (requestId, reviewData, token) => {
  return apiRequest(`/club-requests/${requestId}/review`, {
    method: 'PUT',
    body: reviewData,
    token
  });
};



