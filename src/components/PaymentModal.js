import React from 'react';
import { useToast } from './Toast';
import { QRCodeSVG } from 'qrcode.react';
import { clubCategoryLabels } from '../data/constants';

const PaymentModal = ({ club, onClose, onSubmit }) => {
  const { showToast } = useToast();

  if (!club) return null;

  // Tự động lấy phí tham gia từ club
  const paymentAmount = club.participationFee || 0;

  // Tạo nội dung QR code (có thể là URL hoặc text chứa thông tin thanh toán)
  const qrCodeValue = JSON.stringify({
    clubId: club.id,
    clubName: club.name,
    amount: paymentAmount,
    type: 'club_fee_payment'
  });

  const handleSubmit = () => {
    if (paymentAmount <= 0) {
      showToast('Phí tham gia không hợp lệ!', 'error');
      return;
    }
    onSubmit({
      amount: paymentAmount,
      note: `Nộp phí tham gia ${club.name}`
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto shadow-2xl my-5" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white p-6 flex justify-between items-center rounded-t-xl sticky top-0 z-10">
          <h2 className="text-2xl font-bold m-0">Nộp phí vào câu lạc bộ</h2>
          <button 
            className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/20" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-fpt-blue">
            <p className="m-0 mb-2 text-sm"><strong>Câu lạc bộ:</strong> {club.name}</p>
            <p className="m-0 mb-2 text-sm"><strong>Danh mục:</strong> {club.category ? (clubCategoryLabels[club.category] || club.category) : 'Chưa cập nhật'}</p>
            <p className="m-0 mb-2 text-sm"><strong>Chủ tịch:</strong> {club.president}</p>
            <p className="m-0 text-sm"><strong>Phí tham gia:</strong> <span className="text-fpt-blue font-bold">{paymentAmount.toLocaleString('vi-VN')} VNĐ</span></p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thanh toán qua QR Code</h3>
            
            {/* Thông tin số tiền */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Số tiền cần thanh toán</p>
                <p className="text-3xl font-bold text-fpt-blue">
                  {paymentAmount.toLocaleString('vi-VN')} VNĐ
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <QRCodeSVG
                  value={qrCodeValue}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            {/* Hướng dẫn */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 m-0">
                <strong>Hướng dẫn:</strong> Quét QR code bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán. 
                Sau khi thanh toán thành công, nhấn "Xác nhận đã thanh toán" để hoàn tất.
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
            <button 
              type="button" 
              className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gray-200 text-gray-600 hover:bg-gray-300" 
              onClick={onClose}
            >
              Hủy
            </button>
            <button 
              type="button" 
              className="px-8 py-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-all bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
              onClick={handleSubmit}
            >
              Xác nhận đã thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

