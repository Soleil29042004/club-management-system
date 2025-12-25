import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

/**
 * ClubPaymentHistory
 * 
 * Trang hiển thị lịch sử các giao dịch thanh toán của một CLB cho club leader.
 * Gọi API: GET /payment-history/club/{clubId}
 * Query params: page, size, sortBy=paymentDate, sortDir=DESC
 * 
 * @param {Object} props
 * @param {Object} props.club - Club hiện tại (có clubId hoặc id)
 */
const ClubPaymentHistory = ({ club }) => {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clubId = club?.id || club?.clubId;

  // Fetch lịch sử giao dịch khi có clubId / đổi trang (page/size)
  useEffect(() => {
    if (!clubId) return;

    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    const fetchPayments = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({
          page: String(page),
          size: String(size),
          sortBy: 'paymentDate',
          sortDir: 'DESC'
        });

        const url = `${API_BASE_URL}/payment-history/club/${clubId}?${params.toString()}`;

        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          signal: controller.signal
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && (data.code === 1000 || data.code === 0)) {
          const result = data.result || {};
          const content = Array.isArray(result.content) ? result.content : [];
          setPayments(content);
          setTotalPages(typeof result.totalPages === 'number' ? result.totalPages : 0);
          setTotalElements(typeof result.totalElements === 'number' ? result.totalElements : content.length);
        } else {
          const message = data?.message || 'Không thể tải lịch sử giao dịch.';
          setError(message);
          setPayments([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch payment history error:', err);
          setError('Không thể tải lịch sử giao dịch.');
          setPayments([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();

    return () => controller.abort();
  }, [clubId, page, size]);

  const handlePrevPage = () => {
    setPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setPage(prev => (totalPages ? Math.min(totalPages - 1, prev + 1) : prev + 1));
  };

  if (!clubId) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <p className="text-gray-700 m-0">Không tìm thấy thông tin câu lạc bộ để tải lịch sử giao dịch.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 m-0">Lịch sử giao dịch</h2>
            <p className="text-sm text-gray-500 m-0 mt-1">
              Các giao dịch thanh toán của câu lạc bộ {club?.name || club?.clubName || ''}
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="m-0">
              Tổng giao dịch: <span className="font-semibold">{totalElements}</span>
            </p>
            <p className="m-0">
              Trang: <span className="font-semibold">{page + 1}</span>
              {totalPages ? ` / ${totalPages}` : ''}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-600">
            <div className="w-6 h-6 border-4 border-fpt-blue/30 border-t-fpt-blue rounded-full animate-spin mr-3" />
            <span>Đang tải lịch sử giao dịch...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-8 text-center text-gray-600 text-sm">
            Không có giao dịch nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Mã giao dịch</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Họ tên</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Gói</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Số tiền</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Phương thức</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Thời gian thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((p) => (
                  <tr key={p.paymentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">{p.paymentId}</td>
                    <td className="px-4 py-3">{p.userName || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.userEmail || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.packageName || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {typeof p.amount === 'number'
                        ? `${p.amount.toLocaleString('vi-VN')} VNĐ`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.paymentMethod || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.paymentDate
                        ? new Date(p.paymentDate).toLocaleString('vi-VN')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={loading || page === 0}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Trang trước
          </button>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={loading || (totalPages ? page >= totalPages - 1 : false)}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-fpt-blue text-white hover:bg-fpt-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Trang tiếp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubPaymentHistory;


