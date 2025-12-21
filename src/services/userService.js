/**
 * User Service
 * 
 * Service layer cho user APIs:
 * - Get user info
 * - Update profile
 * - Change password
 * - List users (admin)
 * - Delete user (admin)
 */

import { apiRequest, API_BASE_URL } from './apiClient';

/**
 * Get current user info
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - User data
 */
export const getMyInfo = async (token) => {
  return apiRequest('/users/my-info', {
    method: 'GET',
    token
  });
};

/**
 * Update user profile
 * @param {Object} userData - User data to update
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Updated user data
 */
export const updateProfile = async (userData, token) => {
  return apiRequest('/users/my-info', {
    method: 'PUT',
    body: userData,
    token
  });
};

/**
 * Change password
 * @param {Object} passwordData - { oldPassword, newPassword }
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Response
 */
export const changePassword = async (passwordData, token) => {
  return apiRequest('/users/change-password', {
    method: 'POST',
    body: passwordData,
    token
  });
};

/**
 * List users with pagination (admin only)
 * @param {Object} params - { page, size, sort }
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Users list
 */
export const listUsers = async (params = {}, token) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);
  if (params.sort) queryParams.append('sort', params.sort);
  
  const query = queryParams.toString();
  const endpoint = query ? `/users?${query}` : '/users';
  
  return apiRequest(endpoint, {
    method: 'GET',
    token
  });
};

/**
 * Delete user (admin only)
 * @param {string|number} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Response
 */
export const deleteUser = async (userId, token) => {
  return apiRequest(`/users/${userId}`, {
    method: 'DELETE',
    token
  });
};



