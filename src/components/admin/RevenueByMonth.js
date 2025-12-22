/**
 * RevenueByMonth Component (Admin)
 *
 * Trang admin xem doanh thu theo tháng trong khoảng thời gian.
 * - Cho phép chọn startDate, endDate (datetime)
 * - Gọi API: GET /payment-history/revenue/by-month/date-range
 *   Query: startDate, endDate (ISO date-time string)
 * - Hiển thị bảng doanh thu theo tháng, kèm tổng doanh thu và số giao dịch
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../shared/Toast';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

const RevenueByMonth = () => {
  const { showToast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);

  // Khởi tạo mặc định: từ đầu tháng hiện tại đến thời điểm hiện tại
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    setStartDate(firstDay.toISOString().slice(0, 16)); // yyyy-MM-ddTHH:mm
    setEndDate(now.toISOString().slice(0, 16));
  }, []);

  const fetchRevenue = async () => {
    if (!startDate || !endDate) {
      setError('Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      setError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
      return;
    }

    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      setError('Vui lòng đăng nhập lại để xem doanh thu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      });

      const url = `${API_BASE_URL}/payment-history/revenue/by-month/date-range?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const resData = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      if (!res.ok || (resData.code !== 1000 && resData.code !== 0)) {
        const message = resData?.message || 'Không thể tải doanh thu.';
        setError(message);
        showToast(message, 'error');
        return;
      }

      setData(Array.isArray(resData.result) ? resData.result : []);
    } catch (err) {
      console.error('Fetch revenue error:', err);
      const message = 'Không thể tải doanh thu.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Tự động fetch khi đã có default date
  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const totals = useMemo(() => {
    const totalRevenue = data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
    const totalTransactions = data.reduce((sum, item) => sum + (item.transactionCount || 0), 0);
    return { totalRevenue, totalTransactions };
  }, [data]);

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '—';
    return `${value.toLocaleString('vi-VN')} VNĐ`;
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('vi-VN');
  };

  const formatMonth = (start) => {
    if (!start) return '—';
    return new Date(start).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 m-0">Doanh thu theo tháng</h2>
            <p className="text-sm text-gray-500 m-0 mt-1">
              Tính doanh thu theo từng tháng trong khoảng thời gian
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 font-semibold mb-1">Ngày bắt đầu</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-fpt-blue"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 font-semibold mb-1">Ngày kết thúc</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-fpt-blue"
              />
            </div>
            <button
              type="button"
              onClick={fetchRevenue}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-fpt-blue text-white hover:bg-fpt-blue-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tải...' : 'Tính doanh thu'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
            <p className="text-xs text-green-700 font-semibold m-0 uppercase">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-green-800 m-0 mt-1">{formatCurrency(totals.totalRevenue)}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
            <p className="text-xs text-blue-700 font-semibold m-0 uppercase">Số giao dịch</p>
            <p className="text-2xl font-bold text-blue-800 m-0 mt-1">{totals.totalTransactions}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 m-0">Chi tiết theo tháng</h3>
          <span className="text-sm text-gray-500">
            {data.length} dòng
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-600">
            <div className="w-6 h-6 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full animate-spin mr-3" />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-gray-600 text-sm">
            Không có dữ liệu trong khoảng thời gian đã chọn.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Tháng</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Doanh thu</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Số giao dịch</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">CLB</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Gói</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Từ</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Đến</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item, idx) => (
                  <tr key={`${item.startDate || ''}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{formatMonth(item.startDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-800">{formatCurrency(item.totalRevenue)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.transactionCount ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.clubName || '—'}
                      {item.clubId ? ` (#${item.clubId})` : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.packageName || '—'}
                      {item.packageId ? ` (#${item.packageId})` : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(item.startDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(item.endDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueByMonth;

