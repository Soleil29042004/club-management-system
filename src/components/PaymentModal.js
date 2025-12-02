import React, { useState } from 'react';
import { useToast } from './Toast';
import './PaymentModal.css';

const PaymentModal = ({ club, onClose, onSubmit }) => {
  const { showToast } = useToast();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  if (!club) return null;

  const handleSubmit = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showToast('Vui lòng nhập số tiền hợp lệ!', 'error');
      return;
    }
    onSubmit({
      amount: parseFloat(paymentAmount),
      note: paymentNote
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nộp phí vào {club.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Số tiền (VNĐ)</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Nhập số tiền"
              min="0"
              step="1000"
            />
          </div>
          <div className="form-group">
            <label>Ghi chú (tùy chọn)</label>
            <textarea
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="Nhập ghi chú..."
              rows="3"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-submit" onClick={handleSubmit}>
            Xác nhận nộp phí
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

