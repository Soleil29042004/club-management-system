import React, { useState, useEffect } from 'react';
import { QRCode } from 'react-qr-code';
import { useToast } from './Toast';

const PaymentModal = ({ club, onClose, onSubmit }) => {
  const { showToast } = useToast();
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  
  // Số tiền mặc định là 20,000 VNĐ
  const defaultAmount = 20000;
  const paymentAmount = defaultAmount;

  if (!club) return null;

  // Tạo thông tin thanh toán cho QR code
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const paymentInfo = {
    clubId: club.id,
    clubName: club.name,
    studentEmail: user.email || '',
    studentName: user.name || '',
    amount: paymentAmount,
    timestamp: new Date().toISOString()
  };

  // Tạo chuỗi QR code (có thể là JSON string hoặc payment URL)
  const qrValue = JSON.stringify(paymentInfo);

  const handleConfirmPayment = () => {
    onSubmit({
      amount: paymentAmount,
      note: `Nộp phí tham gia ${club.name}`
    });
    setPaymentConfirmed(true);
    showToast('Đã xác nhận thanh toán!', 'success');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl my-5" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
          <h2 className="text-2xl font-bold m-0">Thanh toán phí tham gia {club.name}</h2>
          <button 
            className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="p-8 text-center">
          {!paymentConfirmed ? (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Quét mã QR để thanh toán</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Số tiền: <span className="font-bold text-fpt-blue text-lg">{paymentAmount.toLocaleString('vi-VN')} VNĐ</span>
                </p>
              </div>
              
              <div className="flex justify-center mb-6 p-4 bg-white rounded-lg border-2 border-gray-200">
                <QRCode
                  value={qrValue}
                  size={256}
                  level="H"
                  includeMargin={true}
                  fgColor="#003366"
                  bgColor="#ffffff"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Thông tin thanh toán:</strong>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Câu lạc bộ:</span> {club.name}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Số tiền:</span> {paymentAmount.toLocaleString('vi-VN')} VNĐ
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Người nộp:</span> {user.name || user.email}
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4 text-left">
                <p className="text-sm text-blue-800">
                  <strong>📱 Hướng dẫn:</strong> Mở ứng dụng ngân hàng trên điện thoại, quét mã QR và xác nhận thanh toán.
                </p>
              </div>
            </>
          ) : (
            <div className="py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Thanh toán thành công!</h3>
              <p className="text-gray-600">Cảm ơn bạn đã nộp phí tham gia.</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 justify-center p-6 pt-0 border-t-2 border-gray-200">
          {!paymentConfirmed && (
            <>
              <button 
                className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gray-200 text-gray-600 hover:bg-gray-300" 
                onClick={onClose}
              >
                Hủy
              </button>
              <button 
                className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl" 
                onClick={handleConfirmPayment}
              >
                Đã thanh toán xong
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

