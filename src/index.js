/**
 * Entry Point của ứng dụng React
 * 
 * File này là điểm khởi đầu của ứng dụng:
 * - Khởi tạo React root và render App component
 * - Sử dụng React.StrictMode để phát hiện potential problems
 * - Import global CSS styles
 * - Setup web vitals reporting (optional)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Tạo root element và render App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Web Vitals: đo lường performance metrics của ứng dụng
// Có thể pass function để log results hoặc gửi đến analytics endpoint
// Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
