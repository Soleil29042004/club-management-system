/**
 * Home Page Component
 * 
 * Component trang chủ hiển thị landing page:
 * - Hero section với giới thiệu về ClubHub
 * - Features section giới thiệu tính năng
 * - Benefits section giải thích lợi ích
 * - CTA section kêu gọi đăng ký/đăng nhập
 * - Footer với thông tin liên hệ
 * 
 * @param {Object} props
 * @param {Function} props.onNavigateToLogin - Callback để chuyển đến trang đăng nhập
 * @param {Function} props.onNavigateToRegister - Callback để chuyển đến trang đăng ký
 */

import React from 'react';

const Home = ({ onNavigateToLogin, onNavigateToRegister }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎓</div>
              <div>
                <h1 className="text-2xl font-bold text-fpt-blue m-0">ClubHub</h1>
                <p className="text-xs text-gray-600 m-0">Hệ thống quản lý Câu lạc bộ</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateToLogin}
                className="px-6 py-2.5 text-fpt-blue font-semibold rounded-lg hover:bg-blue-50 transition-all"
              >
                Đăng nhập
              </button>
              <button
                onClick={onNavigateToRegister}
                className="px-6 py-2.5 bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="text-8xl mb-6 animate-bounce">🎓</div>
          <h2 className="text-5xl md:text-6xl font-bold text-fpt-blue mb-6">
            Chào mừng đến với <span className="text-fpt-orange">ClubHub</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Hệ thống quản lý Câu lạc bộ Sinh viên hiện đại, giúp kết nối sinh viên với các câu lạc bộ và quản lý hoạt động một cách hiệu quả.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={onNavigateToRegister}
              className="px-8 py-4 bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg"
            >
              Bắt đầu ngay
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-8 py-4 bg-white text-fpt-blue font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg border-2 border-fpt-blue"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Tính năng nổi bật
        </h3>
        <div>
          {/* First row - 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏛️</div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">Quản lý Câu lạc bộ</h4>
              <p className="text-gray-600 leading-relaxed">
                Tạo và quản lý thông tin câu lạc bộ một cách dễ dàng. Theo dõi số lượng thành viên, hoạt động và thông tin liên hệ.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">Quản lý Thành viên</h4>
              <p className="text-gray-600 leading-relaxed">
                Duyệt yêu cầu tham gia, quản lý danh sách thành viên và phân quyền vai trò trong câu lạc bộ.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📋</div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">Duyệt Yêu cầu</h4>
              <p className="text-gray-600 leading-relaxed">
                Hệ thống duyệt yêu cầu tham gia và đăng ký mở câu lạc bộ mới một cách nhanh chóng và minh bạch.
              </p>
            </div>
          </div>

          {/* Second row - 2 cards centered */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💰</div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">Quản lý Phí</h4>
              <p className="text-gray-600 leading-relaxed">
                Theo dõi và quản lý phí tham gia câu lạc bộ, thời hạn thành viên và các khoản thanh toán.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">Thống kê</h4>
              <p className="text-gray-600 leading-relaxed">
                Xem thống kê tổng quan về câu lạc bộ, thành viên và các hoạt động đang diễn ra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-12">
            Tại sao chọn ClubHub?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-bold mb-2">Nhanh chóng</h4>
              <p className="text-white/90">Xử lý yêu cầu và quản lý thông tin một cách nhanh chóng</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="text-xl font-bold mb-2">An toàn</h4>
              <p className="text-white/90">Bảo mật thông tin và dữ liệu của người dùng</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-xl font-bold mb-2">Dễ sử dụng</h4>
              <p className="text-white/90">Giao diện thân thiện, dễ dàng sử dụng cho mọi người</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h4 className="text-xl font-bold mb-2">Hiện đại</h4>
              <p className="text-white/90">Công nghệ tiên tiến, cập nhật liên tục</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-12 text-center border-2 border-fpt-blue/20">
          <h3 className="text-4xl font-bold text-gray-800 mb-4">
            Sẵn sàng bắt đầu?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tham gia ngay để khám phá và kết nối với các câu lạc bộ trong trường học của bạn!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={onNavigateToRegister}
              className="px-10 py-4 bg-gradient-to-r from-fpt-blue to-fpt-blue-light text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg"
            >
              Đăng ký ngay
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-10 py-4 bg-white text-fpt-blue font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg border-2 border-fpt-blue"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🎓</div>
                <div>
                  <h4 className="text-xl font-bold m-0">ClubHub</h4>
                  <p className="text-sm text-gray-400 m-0">Hệ thống quản lý CLB</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Nền tảng quản lý câu lạc bộ sinh viên hiện đại và hiệu quả.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Liên kết nhanh</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button
                    onClick={onNavigateToLogin}
                    className="hover:text-white transition-colors"
                  >
                    Đăng nhập
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateToRegister}
                    className="hover:text-white transition-colors"
                  >
                    Đăng ký
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Thông tin</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Hệ thống quản lý Câu lạc bộ</li>
                <li>Dành cho sinh viên và quản lý</li>
                <li>© 2025 ClubHub</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p className="m-0">© 2025 ClubHub - Hệ thống quản lý Câu lạc bộ Sinh viên. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

