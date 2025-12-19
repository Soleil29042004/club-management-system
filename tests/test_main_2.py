import re
from playwright.sync_api import sync_playwright


def run(playwright):
    # slow_mo=500: chèn delay 500ms giữa mỗi action để quan sát rõ & chờ UI/data load kịp
    browser = playwright.chromium.launch(headless=False, slow_mo=500)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:3000/")
    page.get_by_role("banner").get_by_role("button", name="Đăng nhập").click()
    page.get_by_role("textbox", name="Email").click()
    page.get_by_role("textbox", name="Email").fill("sgalehandro@gmail.com")
    page.get_by_role("textbox", name="Mật khẩu").click()
    page.get_by_role("textbox", name="Mật khẩu").fill("123456")
    page.get_by_role("button", name="Đăng nhập").click()
    page.get_by_role("button", name="➕ Đăng ký mở Club").click()
    page.get_by_role("textbox", name="Tên câu lạc bộ *").click()
    page.get_by_role("textbox", name="Tên câu lạc bộ *").fill("Football Club")
    page.get_by_role("textbox", name="Email liên hệ *").click()
    page.get_by_role("textbox", name="Email liên hệ *").fill("football@gmail.com")
    page.get_by_label("Danh mục *").select_option("TheThao")
    page.get_by_role("textbox", name="Mô tả câu lạc bộ *").click()
    page.get_by_role("textbox", name="Mô tả câu lạc bộ *").fill("Football Club là nơi quy tụ những sinh viên có chung niềm đam mê với trái bóng tròn. CLB không chỉ là sân chơi rèn luyện thể lực sau giờ học căng thẳng mà còn là đội tuyển nòng cốt đại diện trường tham gia các giải đấu sinh viên khu vực (VUG, Futsal HSSV). ")
    page.get_by_role("textbox", name="Địa điểm hoạt động *").click()
    page.get_by_role("textbox", name="Địa điểm hoạt động *").fill("Sân vận động")
    page.get_by_role("spinbutton", name="Phí tham gia (VNĐ)").click()
    page.get_by_role("spinbutton", name="Phí tham gia (VNĐ)").fill("10000")
    page.get_by_role("textbox", name="Mục tiêu hoạt động *").click()
    page.get_by_role("textbox", name="Mục tiêu hoạt động *").fill("1. Tổ chức lịch tập luyện cố định 2 buổi/tuần (Thứ 3 & 5) để nâng cao thể lực và kỹ chiến thuật cho thành viên.\n2. Tuyển chọn và đào tạo đội tuyển trường tham dự tối thiểu 2 giải đấu lớn/năm.\n3. Tạo môi trường giao lưu lành mạnh, hạn chế tệ nạn xã hội và gắn kết sinh viên các khoá.\n")
    page.get_by_role("button", name="Gửi yêu cầu", exact=True).click()
    page.get_by_role("button", name="🚪 Đăng xuất").click()
    page.get_by_role("banner").get_by_role("button", name="Đăng nhập").click()
    page.get_by_role("textbox", name="Email").click()
    page.get_by_role("textbox", name="Email").fill("admin@gmail.com")
    page.get_by_role("textbox", name="Mật khẩu").click()
    page.get_by_role("textbox", name="Mật khẩu").fill("123456")
    page.get_by_role("button", name="Đăng nhập").click()
    page.get_by_role("textbox", name="Mật khẩu").click()
    page.get_by_role("textbox", name="Mật khẩu").fill("admin123")
    page.get_by_role("button", name="Đăng nhập").click()
    page.get_by_role("button", name="📝 Duyệt yêu cầu CLB").click()
    page.get_by_role("button", name="☰").click()
    page.get_by_role("button", name="✅ Duyệt").click()
    page.get_by_role("textbox", name="Ví dụ: Yêu cầu hợp lệ, đáp ứ").click()
    page.get_by_role("textbox", name="Ví dụ: Yêu cầu hợp lệ, đáp ứ").fill("yêu cầu hợp lý và đầy đủ thông tin để tạo clb")
    page.get_by_role("button", name="Xác nhận duyệt").click()
    page.get_by_role("button", name="☰").click()
    page.get_by_role("button", name="🚪 Đăng xuất").click()
    page.get_by_role("banner").get_by_role("button", name="Đăng nhập").click()
    page.get_by_role("textbox", name="Email").click()
    page.get_by_role("textbox", name="Email").fill("sgalehandro@gmail.com")
    page.get_by_role("textbox", name="Mật khẩu").click()
    page.get_by_role("textbox", name="Mật khẩu").fill("123456")
    page.get_by_role("button", name="Đăng nhập").click()

    # ---------------------
    context.close()
    browser.close()


def test_main_2():
    with sync_playwright() as p:
        run(p)
    # Test passed if no exception is raised
    assert True
