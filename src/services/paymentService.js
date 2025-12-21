/**
 * Payment Service
 * 
 * Service layer cho payment APIs:
 * - Create payment link
 */

import { apiRequest, API_BASE_URL } from './apiClient';

/**
 * Create payment link for subscription
 * @param {string|number} subscriptionId - Subscription ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Payment link and QR code
 */
export const createPaymentLink = async (subscriptionId, token) => {
  return apiRequest('/payments/create-link', {
    method: 'POST',
    body: { subscriptionId },
    token
  });
};



