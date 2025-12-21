/**
 * Package Service
 * 
 * Service layer cho package APIs:
 * - Get club packages
 * - Get package detail
 * - Update package
 */

import { apiRequest, API_BASE_URL } from './apiClient';

/**
 * Get packages for a club
 * @param {string|number} clubId - Club ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Packages list
 */
export const getClubPackages = async (clubId, token) => {
  return apiRequest(`/packages/club/${clubId}`, {
    method: 'GET',
    token
  });
};

/**
 * Get package detail by ID
 * @param {string|number} packageId - Package ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Package data
 */
export const getPackageDetail = async (packageId, token) => {
  return apiRequest(`/packages/${packageId}`, {
    method: 'GET',
    token
  });
};

/**
 * Update package
 * @param {string|number} packageId - Package ID
 * @param {Object} packageData - Package data to update
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Updated package
 */
export const updatePackage = async (packageId, packageData, token) => {
  return apiRequest(`/packages/${packageId}`, {
    method: 'PUT',
    body: packageData,
    token
  });
};



