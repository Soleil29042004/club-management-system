/**
 * API Client - Centralized API request handler
 * 
 * Base client cho tất cả API calls với:
 * - Authentication handling
 * - Error handling
 * - Request/Response interceptors
 */

export const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

/**
 * Tạo headers cho API request với authentication token
 */
export const createAuthHeaders = (options = {}) => {
  const { token, contentType = 'application/json' } = options;
  
  const authToken = token || localStorage.getItem('authToken') || localStorage.getItem('token');
  
  const headers = {
    'Content-Type': contentType
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

/**
 * Xử lý response từ API
 */
export const handleApiResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const error = new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  // Kiểm tra code response (API có thể trả về code: 1000 hoặc 0 cho success)
  if (data.code !== undefined && data.code !== 1000 && data.code !== 0) {
    const error = new Error(data.message || 'API request failed');
    error.code = data.code;
    error.data = data;
    throw error;
  }
  
  return data;
};

/**
 * Gọi API với error handling tự động
 */
export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body,
    token,
    signal,
    ...restOptions
  } = options;
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const config = {
    method,
    headers: createAuthHeaders({ token }),
    signal,
    ...restOptions
  };
  
  if (body && method !== 'GET') {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, config);
    return await handleApiResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error(`API request failed [${method} ${endpoint}]:`, error);
    throw error;
  }
};

/**
 * Extract token từ API response
 */
export const extractTokenFromResponse = (data) => {
  return (
    data?.token ||
    data?.accessToken ||
    data?.access_token ||
    data?.jwt ||
    data?.jwtToken ||
    data?.data?.token ||
    data?.data?.accessToken ||
    data?.result?.token ||
    data?.result?.accessToken ||
    data?.result?.access_token ||
    null
  );
};



