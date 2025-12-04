import React from 'react';

const Dashboard = ({ clubs, members }) => {
  const activeClubs = clubs.filter(club => club.status === 'Hoạt động').length;
  const totalMembers = members.length;
  const activeMembers = members.filter(member => member.status === 'Hoạt động').length;
  
  const clubsByCategory = clubs.reduce((acc, club) => {
    acc[club.category] = (acc[club.category] || 0) + 1;
    return acc;
  }, {});

  const membersByRole = members.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {});

  const topClubs = clubs
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 5);

  return (
    <div className="max-w-[1400px] mx-auto p-5">
      <div className="bg-gradient-to-br from-white to-blue-50 p-9 rounded-2xl shadow-lg mb-9 border border-fpt-blue/10">
        <h1 className="m-0 mb-2.5 text-fpt-blue text-[34px] font-bold tracking-tight">Tổng quan hệ thống</h1>
        <p className="text-gray-600 text-base">Thống kê và báo cáo hoạt động câu lạc bộ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-white to-blue-50 p-7 rounded-2xl shadow-md flex items-center gap-5 transition-all hover:-translate-y-1.5 hover:shadow-xl border border-fpt-blue/8">
          <div className="text-5xl w-[70px] h-[70px] flex items-center justify-center rounded-xl bg-gradient-to-br from-fpt-blue to-fpt-blue-light">🏛️</div>
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-sm text-gray-600 font-medium uppercase tracking-wide">Tổng số câu lạc bộ</h3>
            <p className="m-0 mb-1 text-[34px] font-bold text-fpt-blue tracking-tight">{clubs.length}</p>
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
              {clubs.length > 0 ? Math.round(totalMembers / clubs.length) : 0}
            </p>
            <span className="text-xs text-gray-500">Người/câu lạc bộ</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-7 rounded-2xl shadow-md flex items-center gap-5 transition-all hover:-translate-y-1.5 hover:shadow-xl border border-fpt-blue/8">
          <div className="text-5xl w-[70px] h-[70px] flex items-center justify-center rounded-xl bg-gradient-to-br from-fpt-orange to-fpt-orange-light">📂</div>
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-sm text-gray-600 font-medium uppercase tracking-wide">Số danh mục</h3>
            <p className="m-0 mb-1 text-[34px] font-bold text-fpt-blue tracking-tight">{Object.keys(clubsByCategory).length}</p>
            <span className="text-xs text-gray-500">Danh mục hoạt động</span>
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
                    style={{ width: `${(count / clubs.length) * 100}%` }}
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
                  {((count / totalMembers) * 100).toFixed(1)}%
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
      </div>
    </div>
  );
};

export default Dashboard;

