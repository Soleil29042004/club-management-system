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
    location: "Phòng A301"
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
    location: "Phòng B205"
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
    location: "Sân vận động"
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
    location: "Phòng C102"
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






