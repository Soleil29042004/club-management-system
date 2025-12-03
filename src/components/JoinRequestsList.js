import React from 'react';
import './JoinRequestsList.css';

const JoinRequestsList = ({ requests, onApprove, onReject }) => {
  if (requests.length === 0) {
    return (
      <div className="requests-section">
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h2>Không có yêu cầu nào đang chờ duyệt</h2>
          <p>Tất cả các yêu cầu đã được xử lý.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="requests-section">
      <div className="requests-list">
        {requests.map((request) => (
          <div key={request.id} className="request-card">
            <div className="request-card-header">
              <div className="request-student-info">
                <h3>{request.studentName}</h3>
                <span className="request-email">{request.studentEmail}</span>
              </div>
              <span className="request-status-badge pending">Đang chờ</span>
            </div>
            <div className="request-card-body">
              <div className="request-details">
                <div className="detail-item">
                  <span className="detail-label">Ngày gửi yêu cầu:</span>
                  <span className="detail-value">{request.requestDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Câu lạc bộ:</span>
                  <span className="detail-value">{request.clubName}</span>
                </div>
                {request.studentId && (
                  <div className="detail-item">
                    <span className="detail-label">Mã sinh viên:</span>
                    <span className="detail-value">{request.studentId}</span>
                  </div>
                )}
                {request.phone && (
                  <div className="detail-item">
                    <span className="detail-label">Số điện thoại:</span>
                    <span className="detail-value">{request.phone}</span>
                  </div>
                )}
                {request.major && (
                  <div className="detail-item">
                    <span className="detail-label">Chuyên ngành:</span>
                    <span className="detail-value">{request.major}</span>
                  </div>
                )}
                {request.startDate && request.endDate && (
                  <div className="detail-item">
                    <span className="detail-label">Thời gian tham gia:</span>
                    <span className="detail-value">
                      {request.startDate} - {request.endDate}
                    </span>
                  </div>
                )}
              </div>
              {request.reason && (
                <div className="request-reason">
                  <strong>Lý do gia nhập:</strong>
                  <p>{request.reason}</p>
                </div>
              )}
              {request.message && (
                <p className="request-message">{request.message}</p>
              )}
            </div>
            <div className="request-card-actions">
              <button
                onClick={() => onReject(request.id)}
                className="btn-reject"
              >
                ❌ Từ chối
              </button>
              <button
                onClick={() => onApprove(request.id)}
                className="btn-approve"
              >
                ✅ Chấp nhận
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinRequestsList;

