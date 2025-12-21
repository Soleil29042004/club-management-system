/**
 * Registration Service
 * 
 * Service layer cho registration APIs:
 * - Create join request
 * - Get my registrations
 * - Get registration detail
 * - Approve/Reject registration
 * - Confirm payment
 * - Leave club
 * - Renew subscription
 * - Cancel registration
 */

import { apiRequest, API_BASE_URL } from './apiClient';

/**
 * Create join request
 * @param {Object} registrationData - { clubId, packageId, joinReason, ... }
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Created registration
 */
export const createJoinRequest = async (registrationData, token) => {
  return apiRequest('/registers', {
    method: 'POST',
    body: registrationData,
    token
  });
};

/**
 * Get my registrations
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Registrations list
 */
export const getMyRegistrations = async (token) => {
  return apiRequest('/registers/my-registrations', {
    method: 'GET',
    token
  });
};

/**
 * Get registration detail by ID
 * @param {string|number} subscriptionId - Subscription ID
 * @param {string} token - Auth token (optional, có thể retry không có token)
 * @returns {Promise<Object>} - Registration detail
 */
export const getRegistrationDetail = async (subscriptionId, token) => {
  return apiRequest(`/registers/${subscriptionId}`, {
    method: 'GET',
    token
  });
};

/**
 * Get club registrations (leader)
 * @param {string|number} clubId - Club ID
 * @param {string} status - Filter by status (optional)
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Registrations list
 */
export const getClubRegistrations = async (clubId, status = null, token) => {
  const endpoint = status 
    ? `/registrations/club/${clubId}/status/${status}`
    : `/registrations/club/${clubId}`;
  
  return apiRequest(endpoint, {
    method: 'GET',
    token
  });
};

/**
 * Approve registration
 * @param {string|number} subscriptionId - Subscription ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Updated registration
 */
export const approveRegistration = async (subscriptionId, token) => {
  return apiRequest('/registrations/approve', {
    method: 'PUT',
    body: {
      subscriptionId,
      status: 'DaDuyet'
    },
    token
  });
};

/**
 * Reject registration
 * @param {string|number} subscriptionId - Subscription ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Updated registration
 */
export const rejectRegistration = async (subscriptionId, token) => {
  return apiRequest('/registrations/approve', {
    method: 'PUT',
    body: {
      subscriptionId,
      status: 'TuChoi'
    },
    token
  });
};

/**
 * Confirm payment
 * @param {string|number} subscriptionId - Subscription ID
 * @param {string} paymentMethod - Payment method ('Offline' or 'Online')
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Updated registration
 */
export const confirmPayment = async (subscriptionId, paymentMethod = 'Offline', token) => {
  return apiRequest('/registrations/confirm-payment', {
    method: 'PUT',
    body: {
      subscriptionId,
      paymentMethod
    },
    token
  });
};

/**
 * Leave club
 * @param {string|number} clubId - Club ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Response
 */
export const leaveClub = async (clubId, token) => {
  return apiRequest(`/registers/${clubId}/leave`, {
    method: 'POST',
    token
  });
};

/**
 * Renew subscription
 * @param {string|number} subscriptionId - Subscription ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Updated registration
 */
export const renewSubscription = async (subscriptionId, token) => {
  return apiRequest(`/registers/${subscriptionId}/renew`, {
    method: 'POST',
    token
  });
};

/**
 * Cancel registration
 * @param {string|number} subscriptionId - Subscription ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Response
 */
export const cancelRegistration = async (subscriptionId, token) => {
  return apiRequest(`/registers/${subscriptionId}`, {
    method: 'DELETE',
    token
  });
};

/**
 * Update member role
 * @param {string|number} clubId - Club ID
 * @param {string|number} userId - User ID
 * @param {string} role - New role
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Updated member
 */
export const updateMemberRole = async (clubId, userId, role, token) => {
  return apiRequest(`/registrations/club/${clubId}/user/${userId}/role`, {
    method: 'PUT',
    body: { role },
    token
  });
};

/**
 * Remove member from club
 * @param {string|number} clubId - Club ID
 * @param {string|number} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Response
 */
export const removeMember = async (clubId, userId, token) => {
  return apiRequest(`/registrations/club/${clubId}/user/${userId}`, {
    method: 'DELETE',
    token
  });
};



