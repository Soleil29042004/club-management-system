/**
 * Authentication Service
 * 
 * Service layer cho authentication APIs:
 * - Login
 * - Logout
 * - Forgot password
 */

import { apiRequest, API_BASE_URL } from './apiClient';

/**
 * Login - Đăng nhập user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Response với token và user data
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email.trim(),
      password: password
    })
  });

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok || (data.code !== 1000 && data.code !== 0)) {
    const error = new Error(data?.message || 'Đăng nhập thất bại');
    error.code = data?.code;
    error.status = response.status;
    throw error;
  }

  return data;
};

/**
 * Logout - Đăng xuất user
 * @param {string} token - Auth token
 * @returns {Promise<Object>} - Response
 */
export const logout = async (token) => {
  return apiRequest('/auth/logout', {
    method: 'POST',
    token
  });
};

/**
 * Forgot Password - Gửi email đặt lại mật khẩu
 * @param {string} email - User email
 * @returns {Promise<Object>} - Response
 */
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email.trim() })
  });

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok || (data.code !== 1000 && data.code !== 0)) {
    const error = new Error(data?.message || 'Không thể gửi email đặt lại mật khẩu');
    error.code = data?.code;
    throw error;
  }

  return data;
};



