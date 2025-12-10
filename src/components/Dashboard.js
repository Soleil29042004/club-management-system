import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://clubmanage.azurewebsites.net/api';

const Dashboard = ({ clubs = [], members = [] }) => {
  const [dashboardData, setDashboardData] = useState({
    totalClubs: clubs.length,
    totalMembers: members.length,
    totalStudents: members.length,
    clubsByCategory: {},
    membersByRole: {},
    topClubs: [],
    newClubs: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError('Vui lòng đăng nhập lại để xem thống kê.');
      return () => controller.abort();
    }

    const fetchDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && (data.code === 1000 || data.code === 0) && data.result) {
          const result = data.result;
          setDashboardData({
            totalClubs: result.totalClubs ?? clubs.length,
            totalMembers: result.totalMembers ?? members.length,
            totalStudents: result.totalStudents ?? result.totalMembers ?? members.length,
            clubsByCategory: result.clubsByCategory || {},
            membersByRole: result.membersByRole || {},
            topClubs: (result.top5ClubsByMembers || []).map(item => ({
              id: item.clubId ?? item.clubID ?? item.id,
              name: item.clubName || 'Chưa có tên',
              category: item.category || 'Khác',
              memberCount: item.memberCount || 0,
              logo: item.clubLogo || item.logo || null
            })),
            newClubs: (result.newClubsThisMonth || []).map(item => ({
              id: item.clubId ?? item.clubID ?? item.id,
              name: item.clubName || 'Chưa có tên',
              category: item.category || 'Khác',
              establishedDate: item.establishedDate,
              isActive: item.isActive,
              location: item.location || '',
              description: item.description || '',
              founderName: item.founderName || '',
              founderStudentCode: item.founderStudentCode || '',
              email: item.email || '',
              logo: item.logo || item.clubLogo || null
            }))
          });
        } else {
          setError(data.message || 'Không thể tải dữ liệu dashboard.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Lỗi tải dashboard:', err);
          setError('Đã xảy ra lỗi khi tải dữ liệu dashboard.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    return () => controller.abort();
  }, [clubs.length, members.length]);

  const activeClubs = clubs.filter(club => club.status === 'Hoạt động').length;
  const activeMembers = members.filter(member => member.status === 'Hoạt động').length;

  const fallbackClubsByCategory = clubs.reduce((acc, club) => {
    if (!club.category) return acc;
    acc[club.category] = (acc[club.category] || 0) + 1;
    return acc;
  }, {});

  const fallbackMembersByRole = members.reduce((acc, member) => {
    if (!member.role) return acc;
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {});

  const fallbackTopClubs = [...clubs]
    .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
    .slice(0, 5)
    .map(club => ({
      id: club.id,
      name: club.name,
      category: club.category,
      memberCount: club.memberCount
    }));

  const totalClubs = dashboardData.totalClubs ?? clubs.length;
  const totalMembers = dashboardData.totalMembers ?? members.length;
  const totalStudents = dashboardData.totalStudents ?? totalMembers;
  const averageMembersPerClub = totalClubs > 0 ? Math.round(totalMembers / totalClubs) : 0;

  const clubsByCategory =
    Object.keys(dashboardData.clubsByCategory || {}).length > 0
      ? dashboardData.clubsByCategory
      : fallbackClubsByCategory;

  const membersByRole =
    Object.keys(dashboardData.membersByRole || {}).length > 0
      ? dashboardData.membersByRole
      : fallbackMembersByRole;

  const topClubs =
    dashboardData.topClubs && dashboardData.topClubs.length > 0
      ? dashboardData.topClubs
      : fallbackTopClubs;

  const newClubs = dashboardData.newClubs || [];
  const newClubsCount = newClubs.length;

  return (
    <div className="max-w-[1400px] mx-auto p-5">
      <div className="bg-gradient-to-br from-white to-blue-50 p-9 rounded-2xl shadow-lg mb-9 border border-fpt-blue/10">
        <h1 className="m-0 mb-2.5 text-fpt-blue text-[34px] font-bold tracking-tight">Tổng quan hệ thống</h1>
        <p className="text-gray-600 text-base">Thống kê và báo cáo hoạt động câu lạc bộ</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 text-fpt-blue px-4 py-3">
          Đang tải dữ liệu thống kê từ máy chủ...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <div className="bg-gradient-to-br from-white to-blue-50 p-7 rounded-2xl shadow-md flex items-center gap-5 transition-all hover:-translate-y-1.5 hover:shadow-xl border border-fpt-blue/8">
          <div className="text-5xl w-[70px] h-[70px] flex items-center justify-center rounded-xl bg-gradient-to-br from-fpt-blue to-fpt-blue-light">🏛️</div>
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-sm text-gray-600 font-medium uppercase tracking-wide">Tổng số câu lạc bộ</h3>
            <p className="m-0 mb-1 text-[34px] font-bold text-fpt-blue tracking-tight">{totalClubs}</p>
            <span className="text-xs text-gray-500">{activeClubs} đang hoạt động</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-7 rounded-2xl shadow-md flex items-center gap-5 transition-all hover:-translate-y-1.5 hover:shadow-xl border border-fpt-blue/8">
          <div className="text-5xl w-[70px] h-[70px] flex items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">👥</div>
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-sm text-gray-600 font-medium uppercase tracking-wide">Tổng số thành viên</h3>
            <p className="m-0 mb-1 text-[34px] font-bold text-fpt-blue tracking-tight">{totalMembers}</p>
            <span className="text-xs text-gray-500">{activeMembers} đang hoạt động</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-7 rounded-2xl shadow-md flex items-center gap-5 transition-all hover:-translate-y-1.5 hover:shadow-xl border border-fpt-blue/8">
          <div className="text-5xl w-[70px] h-[70px] flex items-center justify-center rounded-xl bg-gradient-to-br from-fpt-blue-light to-fpt-blue">📊</div>
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-sm text-gray-600 font-medium uppercase tracking-wide">Trung bình thành viên/CLB</h3>
            <p className="m-0 mb-1 text-[34px] font-bold text-fpt-blue tracking-tight">
              {averageMembersPerClub}
            </p>
            <span className="text-xs text-gray-500">Người/câu lạc bộ</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-7 rounded-2xl shadow-md flex items-center gap-5 transition-all hover:-translate-y-1.5 hover:shadow-xl border border-fpt-blue/8">
          <div className="text-5xl w-[70px] h-[70px] flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">🎓</div>
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-sm text-gray-600 font-medium uppercase tracking-wide">Tổng số sinh viên</h3>
            <p className="m-0 mb-1 text-[34px] font-bold text-fpt-blue tracking-tight">{totalStudents}</p>
            <span className="text-xs text-gray-500">Bao gồm tất cả vai trò</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-7 rounded-2xl shadow-md flex items-center gap-5 transition-all hover:-translate-y-1.5 hover:shadow-xl border border-fpt-blue/8">
          <div className="text-5xl w-[70px] h-[70px] flex items-center justify-center rounded-xl bg-gradient-to-br from-fpt-orange to-fpt-orange-light">📂</div>
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-sm text-gray-600 font-medium uppercase tracking-wide">CLB mới trong tháng</h3>
            <p className="m-0 mb-1 text-[34px] font-bold text-fpt-blue tracking-tight">{newClubsCount}</p>
            <span className="text-xs text-gray-500">Tăng trưởng gần đây</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-md border border-fpt-blue/8">
          <h2 className="m-0 mb-6 text-fpt-blue text-[22px] font-bold border-b-4 border-fpt-orange pb-3 tracking-tight">Câu lạc bộ theo danh mục</h2>
          <div className="flex flex-col gap-4">
            {Object.entries(clubsByCategory).map(([category, count]) => (
              <div key={category} className="grid grid-cols-[120px_1fr_80px] items-center gap-4">
                <span className="font-semibold text-gray-800">{category}</span>
                <div className="h-5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-fpt-blue to-fpt-blue-light rounded-full transition-all duration-500 shadow-md"
                    style={{ width: `${totalClubs > 0 ? (count / totalClubs) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-right font-semibold text-fpt-blue">{count} CLB</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-md border border-fpt-blue/8">
          <h2 className="m-0 mb-6 text-fpt-blue text-[22px] font-bold border-b-4 border-fpt-orange pb-3 tracking-tight">Thành viên theo vai trò</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(membersByRole).map(([role, count]) => (
              <div key={role} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl text-center border border-fpt-blue/10 transition-all hover:-translate-y-1 hover:shadow-lg">
                <h4 className="m-0 mb-3 text-fpt-blue text-sm font-semibold">{role}</h4>
                <p className="m-0 text-3xl font-bold text-fpt-blue tracking-tight">{count}</p>
                <span className="text-xs text-gray-500">
                  {(totalMembers > 0 ? ((count / totalMembers) * 100) : 0).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-md border border-fpt-blue/8 lg:col-span-2">
          <h2 className="m-0 mb-6 text-fpt-blue text-[22px] font-bold border-b-4 border-fpt-orange pb-3 tracking-tight">Top 5 câu lạc bộ có nhiều thành viên nhất</h2>
          <div className="flex flex-col gap-4">
            {topClubs.map((club, index) => (
              <div key={club.id} className="flex items-center gap-5 p-5 bg-gradient-to-r from-gray-50 to-blue-100 rounded-lg transition-all hover:translate-x-2.5">
                <div className="w-[52px] h-[52px] bg-gradient-to-br from-fpt-blue to-fpt-blue-light text-white flex items-center justify-center text-2xl font-bold rounded-full flex-shrink-0 shadow-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="m-0 mb-1 text-gray-800 text-lg">{club.name}</h4>
                  <p className="m-0 text-gray-600 text-sm">{club.category}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 px-6 py-2.5 rounded-full font-semibold text-fpt-blue text-sm border border-fpt-blue/15">
                  {club.memberCount} thành viên
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-md border border-fpt-blue/8 lg:col-span-2">
          <h2 className="m-0 mb-6 text-fpt-blue text-[22px] font-bold border-b-4 border-fpt-orange pb-3 tracking-tight">CLB mới trong tháng</h2>
          <div className="flex flex-col gap-4">
            {newClubs.length === 0 && (
              <div className="p-5 bg-white/70 rounded-lg text-gray-600 border border-dashed border-fpt-blue/20">
                Chưa có câu lạc bộ mới trong tháng này.
              </div>
            )}

            {newClubs.map(club => (
              <div key={club.id} className="p-5 bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg border border-fpt-orange/10 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h4 className="m-0 text-gray-900 text-lg font-semibold">{club.name}</h4>
                    <p className="m-0 text-gray-600 text-sm">{club.category}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {club.establishedDate ? `Thành lập: ${club.establishedDate}` : ''}
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-700 flex-wrap">
                  {club.location && <span>📍 {club.location}</span>}
                  {club.founderName && <span>👤 {club.founderName}</span>}
                  {club.email && <span>✉️ {club.email}</span>}
                </div>
                {club.description && (
                  <p className="m-0 text-gray-600 text-sm line-clamp-2">{club.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

