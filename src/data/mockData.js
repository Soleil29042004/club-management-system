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
  },
  {
    id: 5,
    name: "Club Âm nhạc",
    description: "Câu lạc bộ dành cho những người yêu thích âm nhạc, học chơi nhạc cụ và biểu diễn",
    category: "Nghệ thuật",
    foundedDate: "2022-02-14",
    president: "Hoàng Văn Em",
    memberCount: 52,
    status: "Hoạt động",
    email: "music@club.com",
    location: "Phòng D401",
    participationFee: 60000,
    activities: [
      {
        id: 1,
        title: "Buổi biểu diễn tháng 12",
        description: "Chương trình biểu diễn âm nhạc của các thành viên",
        date: "2024-12-25",
        location: "Hội trường lớn"
      }
    ]
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
    status: "Hết hạn",
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

// Demo data cho join requests (yêu cầu tham gia club)
export const mockJoinRequests = [
  {
    id: 1,
    clubId: 1,
    clubName: "Club Lập trình",
    studentEmail: "student@gmail.com",
    studentName: "Nguyễn Văn A",
    phone: "0912345678",
    studentId: "SE150100",
    major: "Kỹ thuật phần mềm",
    reason: "Em muốn học hỏi và phát triển kỹ năng lập trình",
    status: "rejected",
    requestDate: "2024-11-25",
    message: "Yêu cầu tham gia Club Lập trình"
  },
  {
    id: 2,
    clubId: 2,
    clubName: "Club Tiếng Anh",
    studentEmail: "student@gmail.com",
    studentName: "Nguyễn Văn A",
    phone: "0912345678",
    studentId: "SE150100",
    major: "Kỹ thuật phần mềm",
    reason: "Em muốn cải thiện khả năng giao tiếp tiếng Anh",
    status: "approved",
    requestDate: "2024-11-20",
    message: "Yêu cầu tham gia Club Tiếng Anh"
  },
  {
    id: 5,
    clubId: 1,
    clubName: "Club Lập trình",
    studentEmail: "student2@example.com",
    studentName: "Lê Thị Mai",
    phone: "0923456789",
    studentId: "SE150200",
    major: "Kỹ thuật phần mềm",
    reason: "Em muốn tham gia các hoạt động lập trình và hackathon",
    startDate: "2024-12-01",
    endDate: "2025-06-01",
    status: "pending",
    requestDate: "2024-11-28",
    message: "Yêu cầu tham gia Club Lập trình"
  },
  {
    id: 6,
    clubId: 2,
    clubName: "Club Tiếng Anh",
    studentEmail: "student3@example.com",
    studentName: "Trần Văn Nam",
    phone: "0934567890",
    studentId: "BA150300",
    major: "Quản trị kinh doanh",
    reason: "Em cần cải thiện tiếng Anh để phục vụ công việc tương lai",
    startDate: "2024-12-01",
    endDate: "2025-06-01",
    status: "pending",
    requestDate: "2024-11-27",
    message: "Yêu cầu tham gia Club Tiếng Anh"
  },
];

// Demo data cho payments (thanh toán phí)
export const mockPayments = [
  {
    id: 1,
    clubId: 2,
    clubName: "Club Tiếng Anh",
    studentEmail: "student@gmail.com",
    studentName: "Nguyễn Văn A",
    amount: 30000,
    note: "Nộp phí tham gia Club Tiếng Anh",
    paymentDate: "2024-11-22",
    status: "completed"
  }
];

// Demo data cho club registration requests (yêu cầu đăng ký mở club)
export const mockClubRequests = [
  {
    id: 1,
    name: "Club Khiêu vũ",
    description: "Câu lạc bộ dành cho những người yêu thích khiêu vũ và nhảy múa. Tổ chức các lớp học khiêu vũ hiện đại, Latin, và các buổi biểu diễn.",
    category: "Nghệ thuật",
    email: "dance@club.com",
    location: "Phòng D301",
    participationFee: 80000,
    applicantName: "Nguyễn Thị Lan",
    applicantEmail: "lannguyen@student.com",
    reason: "Em muốn tạo một môi trường để các bạn sinh viên có thể học và thực hành khiêu vũ, giúp giải tỏa căng thẳng sau giờ học.",
    goals: "Tổ chức các lớp học khiêu vũ hàng tuần, tham gia các cuộc thi khiêu vũ trong và ngoài trường, tổ chức các buổi biểu diễn định kỳ.",
    requestDate: "2024-11-20",
    status: "pending"
  },
  {
    id: 2,
    name: "Club Robotics",
    description: "Câu lạc bộ nghiên cứu và phát triển robot, IoT, và các công nghệ tự động hóa. Tổ chức các workshop và cuộc thi robot.",
    category: "Công nghệ",
    email: "robotics@club.com",
    location: "Phòng Lab A",
    participationFee: 120000,
    applicantName: "Phạm Văn Hùng",
    applicantEmail: "hungpham@student.com",
    reason: "Em muốn tạo một cộng đồng cho những người đam mê robot và tự động hóa, nơi mọi người có thể học hỏi và phát triển dự án.",
    goals: "Tổ chức các workshop về lập trình robot, tham gia các cuộc thi robot quốc gia và quốc tế, phát triển các dự án IoT thực tế.",
    requestDate: "2024-11-15",
    status: "approved",
    approvedDate: "2024-11-18"
  },
  {
    id: 3,
    name: "Club Đọc sách",
    description: "Câu lạc bộ đọc sách và thảo luận về các tác phẩm văn học, khoa học, và triết học. Tổ chức các buổi thảo luận sách hàng tuần.",
    category: "Văn hóa",
    email: "reading@club.com",
    location: "Thư viện - Phòng đọc",
    participationFee: 0,
    applicantName: "Lê Thị Hoa",
    applicantEmail: "hoale@student.com",
    reason: "Em muốn tạo một không gian để các bạn sinh viên có thể chia sẻ và thảo luận về sách, phát triển văn hóa đọc.",
    goals: "Tổ chức các buổi thảo luận sách hàng tuần, mời các tác giả đến chia sẻ, tổ chức các cuộc thi review sách.",
    requestDate: "2024-11-10",
    status: "rejected",
    rejectedDate: "2024-11-12",
    rejectionReason: "Đã có quá nhiều câu lạc bộ văn hóa trong hệ thống. Vui lòng tham gia các câu lạc bộ hiện có."
  },
  {
    id: 4,
    name: "Club Khởi nghiệp",
    description: "Câu lạc bộ dành cho những người có ý tưởng khởi nghiệp. Tổ chức các workshop về kinh doanh, pitch ý tưởng, và kết nối với các nhà đầu tư.",
    category: "Xã hội",
    email: "startup@club.com",
    location: "Phòng E205",
    participationFee: 50000,
    applicantName: "Vũ Văn Đức",
    applicantEmail: "ducvu@student.com",
    reason: "Em muốn tạo một môi trường để các bạn sinh viên có thể học hỏi về khởi nghiệp và phát triển các dự án kinh doanh của mình.",
    goals: "Tổ chức các workshop về khởi nghiệp, kết nối với các mentor và nhà đầu tư, hỗ trợ các dự án khởi nghiệp của sinh viên.",
    requestDate: "2024-11-25",
    status: "pending"
  }
];

// Hàm khởi tạo dữ liệu demo vào localStorage
export const initializeDemoData = () => {
  // Luôn reset joinRequests từ mockData để đảm bảo dữ liệu demo mới nhất
  // Merge với requests hiện có (giữ lại các requests mới mà user đã tạo)
  const existingRequests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
  const mockRequestIds = mockJoinRequests.map(r => r.id);
  
  // Giữ lại các requests mới mà user đã tạo (không có trong mockData)
  const userCreatedRequests = existingRequests.filter(r => !mockRequestIds.includes(r.id));
  
  // Kết hợp: mockData requests + user created requests
  localStorage.setItem('joinRequests', JSON.stringify([...mockJoinRequests, ...userCreatedRequests]));
  
  // Reset payments: chỉ giữ payments từ mockData để đảm bảo demo đúng
  // Merge với payments mới mà user đã tạo (có id >= 1000 để tránh conflict với mockData)
  const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
  // Giữ lại các payments mới mà user đã tạo (id >= 1000)
  const userCreatedPayments = existingPayments.filter(p => p.id >= 1000);
  // Kết hợp: mockPayments + user created payments
  localStorage.setItem('payments', JSON.stringify([...mockPayments, ...userCreatedPayments]));
  
  // Merge clubRequests: giữ lại requests cũ và thêm requests mới từ mockData nếu chưa có
  const existingClubRequests = JSON.parse(localStorage.getItem('clubRequests') || '[]');
  const existingClubRequestIds = existingClubRequests.map(r => r.id);
  const newClubRequests = mockClubRequests.filter(r => !existingClubRequestIds.includes(r.id));
  localStorage.setItem('clubRequests', JSON.stringify([...existingClubRequests, ...newClubRequests]));
  
  // Khởi tạo registeredUsers nếu chưa có, hoặc merge thêm users mới
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const existingUserEmails = existingUsers.map(u => u.email);
  const demoUsers = [
    {
      email: "student2@example.com",
      password: "123456",
      name: "Lê Thị Mai",
      role: "student"
    },
    {
      email: "student3@example.com",
      password: "123456",
      name: "Trần Văn Nam",
      role: "student"
    },
    {
      email: "lannguyen@student.com",
      password: "123456",
      name: "Nguyễn Thị Lan",
      role: "student"
    },
    {
      email: "hungpham@student.com",
      password: "123456",
      name: "Phạm Văn Hùng",
      role: "student"
    }
  ];
  const newUsers = demoUsers.filter(u => !existingUserEmails.includes(u.email));
  localStorage.setItem('registeredUsers', JSON.stringify([...existingUsers, ...newUsers]));
};

