// Mock data cho hệ thống quản lý câu lạc bộ

export const mockClubs = [
  {
    id: 1,
    name: "Club Lập trình",
    description: "Câu lạc bộ dành cho những người đam mê lập trình và công nghệ",
    category: "Công nghệ",
    foundedDate: "2020-01-15",
    president: "Nguyễn Văn A",
    memberCount: 45,
    status: "Hoạt động",
    email: "programming@club.com",
    location: "Phòng A301",
    participationFee: 50000,
    activities: [
      {
        id: 1,
        title: "Workshop React.js",
        description: "Học cách xây dựng ứng dụng web với React.js",
        date: "2024-12-15",
        location: "Phòng A301"
      },
      {
        id: 2,
        title: "Hackathon 2024",
        description: "Cuộc thi lập trình 24 giờ",
        date: "2024-12-20",
        location: "Phòng Lab"
      }
    ]
  },
  {
    id: 2,
    name: "Club Tiếng Anh",
    description: "Nơi rèn luyện và nâng cao kỹ năng tiếng Anh",
    category: "Ngoại ngữ",
    foundedDate: "2019-09-01",
    president: "Trần Thị B",
    memberCount: 60,
    status: "Hoạt động",
    email: "english@club.com",
    location: "Phòng B205",
    participationFee: 30000,
    activities: [
      {
        id: 1,
        title: "Speaking Club",
        description: "Luyện nói tiếng Anh với người bản xứ",
        date: "2024-12-10",
        location: "Phòng B205"
      }
    ]
  },
  {
    id: 3,
    name: "Club Thể thao",
    description: "Câu lạc bộ thể thao đa dạng với nhiều môn khác nhau",
    category: "Thể thao",
    foundedDate: "2018-03-20",
    president: "Lê Văn C",
    memberCount: 80,
    status: "Hoạt động",
    email: "sports@club.com",
    location: "Sân vận động",
    participationFee: 100000,
    activities: [
      {
        id: 1,
        title: "Giải bóng đá sinh viên",
        description: "Giải đấu bóng đá giữa các đội trong trường",
        date: "2024-12-18",
        location: "Sân vận động"
      }
    ]
  },
  {
    id: 4,
    name: "Club Nhiếp ảnh",
    description: "Khám phá nghệ thuật chụp ảnh và xử lý hình ảnh",
    category: "Nghệ thuật",
    foundedDate: "2021-05-10",
    president: "Phạm Thị D",
    memberCount: 35,
    status: "Hoạt động",
    email: "photo@club.com",
    location: "Phòng C102",
    participationFee: 75000,
    activities: []
  }
];

export const mockMembers = [
  {
    id: 1,
    studentId: "SE150001",
    fullName: "Nguyễn Văn An",
    email: "annguyenvan@student.com",
    phone: "0901234567",
    clubId: 1,
    clubName: "Club Lập trình",
    role: "Chủ tịch",
    joinDate: "2020-01-15",
    status: "Hoạt động",
    major: "Kỹ thuật phần mềm"
  },
  {
    id: 2,
    studentId: "SE150002",
    fullName: "Trần Thị Bình",
    email: "binhtran@student.com",
    phone: "0902345678",
    clubId: 1,
    clubName: "Club Lập trình",
    role: "Thành viên",
    joinDate: "2020-02-20",
    status: "Hoạt động",
    major: "Kỹ thuật phần mềm"
  },
  {
    id: 3,
    studentId: "BA150003",
    fullName: "Lê Văn Cường",
    email: "cuongle@student.com",
    phone: "0903456789",
    clubId: 2,
    clubName: "Club Tiếng Anh",
    role: "Phó chủ tịch",
    joinDate: "2019-09-01",
    status: "Hoạt động",
    major: "Quản trị kinh doanh"
  },
  {
    id: 4,
    studentId: "SE150004",
    fullName: "Phạm Thị Dung",
    email: "dungpham@student.com",
    phone: "0904567890",
    clubId: 2,
    clubName: "Club Tiếng Anh",
    role: "Thành viên",
    joinDate: "2019-10-15",
    status: "Hoạt động",
    major: "Kỹ thuật phần mềm"
  },
  {
    id: 5,
    studentId: "SP150005",
    fullName: "Hoàng Văn Em",
    email: "emhoang@student.com",
    phone: "0905678901",
    clubId: 3,
    clubName: "Club Thể thao",
    role: "Thành viên",
    joinDate: "2020-03-01",
    status: "Hoạt động",
    major: "Giáo dục thể chất"
  },
  {
    id: 6,
    studentId: "GD150006",
    fullName: "Vũ Thị Phương",
    email: "phuongvu@student.com",
    phone: "0906789012",
    clubId: 4,
    clubName: "Club Nhiếp ảnh",
    role: "Thành viên",
    joinDate: "2021-05-15",
    status: "Hoạt động",
    major: "Thiết kế đồ họa"
  }
];

// Helper functions
export const getNextClubId = (clubs) => {
  return clubs.length > 0 ? Math.max(...clubs.map(c => c.id)) + 1 : 1;
};

export const getNextMemberId = (members) => {
  return members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
};

export const clubCategories = [
  "Công nghệ",
  "Ngoại ngữ",
  "Thể thao",
  "Nghệ thuật",
  "Khoa học",
  "Văn hóa",
  "Xã hội",
  "Khác"
];

export const memberRoles = [
  "Chủ tịch",
  "Phó chủ tịch",
  "Thư ký",
  "Thủ quỹ",
  "Thành viên"
];

export const statusOptions = [
  "Hoạt động",
  "Tạm ngưng",
  "Ngừng hoạt động"
];

// Mock data cho join requests - để test chức năng duyệt request của leader
export const mockJoinRequests = [
  {
    id: 1,
    clubId: 1,
    clubName: "Club Lập trình",
    studentEmail: "student1@student.com",
    studentName: "Nguyễn Văn Học",
    phone: "0911111111",
    studentId: "SE150100",
    major: "Kỹ thuật phần mềm",
    reason: "Tôi muốn học hỏi và phát triển kỹ năng lập trình, đặc biệt là về React và Node.js",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    status: "pending",
    requestDate: "2024-11-25",
    message: "Yêu cầu tham gia Club Lập trình"
  },
  {
    id: 2,
    clubId: 1,
    clubName: "Club Lập trình",
    studentEmail: "student2@student.com",
    studentName: "Trần Thị Code",
    phone: "0922222222",
    studentId: "SE150101",
    major: "Kỹ thuật phần mềm",
    reason: "Đam mê lập trình và muốn tham gia các dự án thực tế",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    status: "pending",
    requestDate: "2024-11-26",
    message: "Yêu cầu tham gia Club Lập trình"
  },
  {
    id: 3,
    clubId: 2,
    clubName: "Club Tiếng Anh",
    studentEmail: "student3@student.com",
    studentName: "Lê Văn English",
    phone: "0933333333",
    studentId: "BA150200",
    major: "Quản trị kinh doanh",
    reason: "Muốn cải thiện khả năng giao tiếp tiếng Anh để phục vụ công việc sau này",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    status: "pending",
    requestDate: "2024-11-27",
    message: "Yêu cầu tham gia Club Tiếng Anh"
  },
  {
    id: 4,
    clubId: 2,
    clubName: "Club Tiếng Anh",
    studentEmail: "student4@student.com",
    studentName: "Phạm Thị Speaking",
    phone: "0944444444",
    studentId: "SE150201",
    major: "Kỹ thuật phần mềm",
    reason: "Cần luyện tập tiếng Anh để đọc tài liệu kỹ thuật",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    status: "pending",
    requestDate: "2024-11-28",
    message: "Yêu cầu tham gia Club Tiếng Anh"
  },
  {
    id: 5,
    clubId: 3,
    clubName: "Club Thể thao",
    studentEmail: "student5@student.com",
    studentName: "Hoàng Văn Sport",
    phone: "0955555555",
    studentId: "SP150300",
    major: "Giáo dục thể chất",
    reason: "Yêu thích bóng đá và muốn tham gia các giải đấu",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    status: "pending",
    requestDate: "2024-11-29",
    message: "Yêu cầu tham gia Club Thể thao"
  },
  {
    id: 6,
    clubId: 1,
    clubName: "Club Lập trình",
    studentEmail: "student6@student.com",
    studentName: "Vũ Thị Developer",
    phone: "0966666666",
    studentId: "SE150102",
    major: "Kỹ thuật phần mềm",
    reason: "Muốn học thêm về backend development",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    status: "approved",
    requestDate: "2024-11-20",
    message: "Yêu cầu tham gia Club Lập trình"
  },
  {
    id: 7,
    clubId: 2,
    clubName: "Club Tiếng Anh",
    studentEmail: "student7@student.com",
    studentName: "Đỗ Văn IELTS",
    phone: "0977777777",
    studentId: "BA150201",
    major: "Quản trị kinh doanh",
    reason: "Chuẩn bị thi IELTS",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    status: "approved",
    requestDate: "2024-11-21",
    message: "Yêu cầu tham gia Club Tiếng Anh"
  },
  {
    id: 8,
    clubId: 3,
    clubName: "Club Thể thao",
    studentEmail: "student8@student.com",
    studentName: "Bùi Thị Fitness",
    phone: "0988888888",
    studentId: "SP150301",
    major: "Giáo dục thể chất",
    reason: "Muốn rèn luyện sức khỏe",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    status: "approved",
    requestDate: "2024-11-22",
    message: "Yêu cầu tham gia Club Thể thao"
  },
  {
    id: 9,
    clubId: 4,
    clubName: "Club Nhiếp ảnh",
    studentEmail: "student9@student.com",
    studentName: "Ngô Văn Photo",
    phone: "0999999999",
    studentId: "GD150400",
    major: "Thiết kế đồ họa",
    reason: "Đam mê nhiếp ảnh và muốn học hỏi kỹ thuật chụp ảnh",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    status: "approved",
    requestDate: "2024-11-23",
    message: "Yêu cầu tham gia Club Nhiếp ảnh"
  },
  {
    id: 10,
    clubId: 1,
    clubName: "Club Lập trình",
    studentEmail: "student10@student.com",
    studentName: "Lý Thị Rejected",
    phone: "0900000000",
    studentId: "SE150103",
    major: "Kỹ thuật phần mềm",
    reason: "Muốn tham gia",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    status: "rejected",
    requestDate: "2024-11-15",
    message: "Yêu cầu tham gia Club Lập trình"
  },
  {
    id: 11,
    clubId: 4,
    clubName: "Club Nhiếp ảnh",
    studentEmail: "student@gmail.com",
    studentName: "Nguyễn Văn A",
    phone: "0911111111",
    studentId: "SE150200",
    major: "Kỹ thuật phần mềm",
    reason: "Muốn học nhiếp ảnh để bổ trợ cho công việc thiết kế",
    startDate: "2024-12-01",
    endDate: "2025-06-30",
    status: "approved",
    requestDate: "2024-11-24",
    message: "Yêu cầu tham gia Club Nhiếp ảnh"
  }
];

// Mock data cho payments - để test chức năng trả phí của student
export const mockPayments = [
  {
    id: 1,
    clubId: 1,
    clubName: "Club Lập trình",
    studentEmail: "student6@student.com",
    studentName: "Vũ Thị Developer",
    amount: 50000,
    note: "Nộp phí tham gia Club Lập trình",
    paymentDate: "2024-11-25",
    status: "completed"
  },
  {
    id: 2,
    clubId: 2,
    clubName: "Club Tiếng Anh",
    studentEmail: "student7@student.com",
    studentName: "Đỗ Văn IELTS",
    amount: 30000,
    note: "Nộp phí tham gia Club Tiếng Anh",
    paymentDate: "2024-11-26",
    status: "completed"
  }
  // Lưu ý: student8 và student9 đã được approved nhưng chưa nộp phí
  // Điều này tạo ra unpaid fees để test chức năng trả phí
];

// Hàm khởi tạo mock data vào localStorage (nếu chưa có)
export const initializeMockData = () => {
  // Khởi tạo join requests nếu chưa có hoặc rỗng
  const existingRequests = localStorage.getItem('joinRequests');
  if (!existingRequests || existingRequests === '[]' || JSON.parse(existingRequests).length === 0) {
    localStorage.setItem('joinRequests', JSON.stringify(mockJoinRequests));
  } else {
    // Merge mock data với dữ liệu hiện có (tránh trùng lặp)
    const currentRequests = JSON.parse(existingRequests);
    const currentRequestIds = new Set(currentRequests.map(r => r.id));
    const newRequests = mockJoinRequests.filter(r => !currentRequestIds.has(r.id));
    if (newRequests.length > 0) {
      localStorage.setItem('joinRequests', JSON.stringify([...currentRequests, ...newRequests]));
    }
  }
  
  // Khởi tạo payments nếu chưa có hoặc rỗng
  const existingPayments = localStorage.getItem('payments');
  if (!existingPayments || existingPayments === '[]' || JSON.parse(existingPayments).length === 0) {
    localStorage.setItem('payments', JSON.stringify(mockPayments));
  } else {
    // Merge mock data với dữ liệu hiện có (tránh trùng lặp)
    const currentPayments = JSON.parse(existingPayments);
    const currentPaymentIds = new Set(currentPayments.map(p => p.id));
    const newPayments = mockPayments.filter(p => !currentPaymentIds.has(p.id));
    if (newPayments.length > 0) {
      localStorage.setItem('payments', JSON.stringify([...currentPayments, ...newPayments]));
    }
  }
};

// Hàm reset mock data (xóa và load lại từ đầu)
export const resetMockData = () => {
  localStorage.setItem('joinRequests', JSON.stringify(mockJoinRequests));
  localStorage.setItem('payments', JSON.stringify(mockPayments));
};

