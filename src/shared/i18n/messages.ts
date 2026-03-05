export type Locale = "vi" | "en";

export const DEFAULT_LOCALE: Locale = "vi";
export const LOCALE_STORAGE_KEY = "app-locale";

export const TRANSLATIONS = {
  vi: {
    "common.search": "Tìm kiếm",
    "common.comingSoon": "Sắp ra mắt",
    "common.light": "Sáng",
    "common.dark": "Tối",
    "auth.checkingSession": "Đang kiểm tra phiên đăng nhập...",

    "auth.login.brand": "Tuperator",
    "auth.login.welcomeBack": "Chào mừng trở lại",
    "auth.login.subtitle":
      "Nhập email và mật khẩu để truy cập vào hệ thống.",
    "auth.login.email": "Email",
    "auth.login.emailPlaceholder": "sellostore@company.com",
    "auth.login.password": "Mật khẩu",
    "auth.login.passwordPlaceholder": "Nhập mật khẩu",
    "auth.login.showPassword": "Hiện",
    "auth.login.hidePassword": "Ẩn",
    "auth.login.rememberMe": "Ghi nhớ đăng nhập",
    "auth.login.forgotPassword": "Quên mật khẩu?",
    "auth.login.submit": "Đăng nhập",
    "auth.login.submitting": "Đang đăng nhập...",
    "auth.login.sso": "Đăng nhập bằng SSO",
    "auth.login.contactAdmin":
      "Cần quyền truy cập hệ thống? Vui lòng liên hệ quản trị viên.",
    "auth.login.copyright": "Bản quyền © 2026 Tuperator Enterprises LTD.",
    "auth.login.privacyPolicy": "Chính sách bảo mật",
    "auth.login.ssoPlan": "SSO sẽ được hỗ trợ ở bản phát hành tiếp theo.",

    "auth.hero.title": "Vận hành đội ngũ và doanh nghiệp hiệu quả.",
    "auth.hero.subtitle":
      "Đăng nhập để truy cập dashboard CRM và quản lý đội nhóm.",

    "auth.validation.emailRequired": "Vui lòng nhập email.",
    "auth.validation.emailInvalid": "Định dạng email chưa hợp lệ.",
    "auth.validation.passwordRequired": "Vui lòng nhập mật khẩu.",
    "auth.validation.passwordMin": "Mật khẩu tối thiểu 6 ký tự.",

    "api.error.AUTH_INVALID_CREDENTIALS":
      "Email hoặc mật khẩu chưa đúng. Vui lòng kiểm tra lại.",
    "api.error.AUTH_ACCESS_TOKEN_EXPIRED":
      "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    "api.error.AUTH_REFRESH_TOKEN_EXPIRED":
      "Phiên đăng nhập đã hết hạn lâu. Vui lòng đăng nhập lại.",
    "api.error.AUTH_INVALID_REFRESH_TOKEN":
      "Thông tin xác thực không còn hợp lệ. Vui lòng đăng nhập lại.",
    "api.error.AUTH_ACCOUNT_LOCKED":
      "Tài khoản đang bị khóa tạm thời. Vui lòng liên hệ quản trị viên.",
    "api.error.AUTH_ACCOUNT_INACTIVE":
      "Tài khoản chưa sẵn sàng sử dụng. Vui lòng liên hệ quản trị viên.",
    "api.error.AUTH_FORBIDDEN": "Bạn không có quyền thực hiện thao tác này.",
    "api.error.status.401":
      "Thông tin xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
    "api.error.status.403": "Bạn không có quyền truy cập tài nguyên này.",
    "api.error.status.404": "Không tìm thấy dữ liệu yêu cầu.",
    "api.error.status.409": "Dữ liệu đang xung đột. Vui lòng thử lại.",
    "api.error.status.422": "Dữ liệu gửi lên chưa hợp lệ. Vui lòng kiểm tra lại.",
    "api.error.status.5xx":
      "Hệ thống đang bận hoặc gặp sự cố. Vui lòng thử lại sau.",
    "api.error.default": "Có lỗi xảy ra. Vui lòng thử lại.",

    "app.header.breadcrumb.system": "Hệ thống",
    "app.header.breadcrumb.dashboards": "Dashboard",
    "app.header.breadcrumb.settings": "Cài đặt",
    "app.header.breadcrumb.default": "Mặc định",
    "app.header.breadcrumb.users": "Quản lý người dùng",
    "app.header.breadcrumb.tasks": "Quản lý công việc",
    "app.header.breadcrumb.roleGroups": "Nhóm quyền",
    "app.header.breadcrumb.branches": "Chi nhánh",
    "app.header.breadcrumb.company": "Thông tin công ty",
    "app.header.aria.toggleTheme": "Chuyển giao diện sáng/tối",
    "app.header.aria.openSettings": "Mở trang cài đặt",
    "app.header.aria.openUserAccount": "Mở tài khoản người dùng",
    "app.header.aria.toggleNotifications": "Bật/tắt bảng thông báo",

    "app.feed.time.justNow": "Vừa xong",
    "app.feed.time.59m": "59 phút trước",
    "app.feed.time.12h": "12 giờ trước",
    "app.feed.time.today1159": "Hôm nay, 11:59 SA",
    "app.feed.time.feb22026": "2 Thg 2, 2026",
    "app.feed.notification.fixedBug": "Bạn đã sửa một lỗi.",
    "app.feed.notification.newUserRegistered":
      "Một người dùng mới đã đăng ký.",
    "app.feed.activity.changedStyle": "Đã thay đổi giao diện.",
    "app.feed.activity.releasedVersion": "Đã phát hành phiên bản mới.",
    "app.feed.activity.submittedBug": "Đã gửi một lỗi.",
    "app.feed.activity.modifiedPage": "Đã chỉnh sửa 4 dữ liệu ở Trang X.",
    "app.feed.activity.deletedPage": "Đã xóa một trang trong Dự án X.",
    "app.notifications.title": "Thông báo",
    "app.notifications.description":
      "Danh sách thông báo, hoạt động và liên hệ gần đây.",
    "app.notifications.activities": "Hoạt động",
    "app.notifications.contacts": "Liên hệ",
    "app.userMenu.signedInAs": "Đăng nhập với",
    "app.userMenu.profileSettings": "Thông tin tài khoản",
    "app.userMenu.userManagement": "Quản lý người dùng",
    "app.userMenu.securitySettings": "Bảo mật tài khoản",
    "app.userMenu.appearanceSettings": "Tùy chỉnh giao diện",
    "app.userMenu.helpSupport": "Trợ giúp & hỗ trợ",
    "app.userMenu.logout": "Đăng xuất",
    "app.userMenu.guest": "Người dùng",
    "app.userMenu.logoutConfirmTitle": "Xác nhận đăng xuất",
    "app.userMenu.logoutConfirmDescription":
      "Bạn có chắc muốn đăng xuất khỏi hệ thống không?",
    "app.userMenu.logoutConfirmCancel": "Hủy",
    "app.userMenu.logoutConfirmAction": "Đăng xuất",

    "settings.header.title": "Cài đặt hệ thống",
    "settings.header.description":
      "Quản lý cấu hình chung: ngôn ngữ, bảo mật và giao diện làm việc.",
    "settings.header.autoSave": "Tự lưu local",
    "settings.header.backDashboard": "Quay lại dashboard",
    "settings.sidebar.title": "Danh mục",
    "settings.sidebar.description": "Nhóm cấu hình cơ bản",
    "settings.section.general": "Tổng quan",
    "settings.section.security": "Bảo mật & Chính sách",
    "settings.section.appearance": "Giao diện",
    "settings.general.title": "Cài đặt chung",
    "settings.general.description":
      "Cấu hình thông tin vận hành mặc định cho doanh nghiệp.",
    "settings.general.workspaceName": "Tên workspace",
    "settings.general.language": "Ngôn ngữ",
    "settings.general.languagePlaceholder": "Chọn ngôn ngữ",
    "settings.general.timezone": "Múi giờ",
    "settings.general.timezonePlaceholder": "Chọn múi giờ",
    "settings.security.title": "Bảo mật & Chính sách",
    "settings.security.description":
      "Thiết lập các lớp bảo vệ cơ bản cho người dùng và dữ liệu.",
    "settings.security.enforce2fa.title":
      "Bắt buộc 2FA cho tài khoản quản trị",
    "settings.security.enforce2fa.description":
      "Giảm rủi ro bị truy cập trái phép vào khu vực quản trị.",
    "settings.security.ipRestriction.title":
      "Giới hạn truy cập theo IP nội bộ",
    "settings.security.ipRestriction.description":
      "Chỉ cho phép đăng nhập từ danh sách IP được cấp quyền.",
    "settings.security.requirePolicy.title":
      "Bắt buộc người dùng chấp nhận chính sách mới",
    "settings.security.requirePolicy.description":
      "Hiển thị hộp xác nhận khi có cập nhật điều khoản sử dụng.",
    "settings.security.sessionTimeout": "Thời gian hết phiên",
    "settings.security.sessionTimeoutPlaceholder": "Chọn thời gian",
    "settings.appearance.title": "Giao diện",
    "settings.appearance.description":
      "Tùy chỉnh giao diện làm việc: theme, scale hiển thị và màu nhấn chính.",
    "settings.appearance.themeDefault": "Theme mặc định",
    "settings.appearance.viewScale": "Tỷ lệ hiển thị",
    "settings.appearance.accent": "Màu nhấn hệ thống (accent)",
    "settings.appearance.compactDensity.title": "Mật độ hiển thị gọn",
    "settings.appearance.compactDensity.description":
      "Giảm khoảng cách giữa các block để tăng mật độ hiển thị.",
    "settings.appearance.reset": "Khôi phục giao diện",

    "sidebar.mobile.title": "Menu điều hướng",
    "sidebar.mobile.description": "Duyệt các khu vực chính của hệ thống.",
    "sidebar.tabs.favorites": "Yêu thích",
    "sidebar.tabs.recently": "Gần đây",
    "sidebar.section.main": "Tổng quan",
    "sidebar.section.operations": "Nghiệp vụ",
    "sidebar.section.organization": "Tổ chức",
    "sidebar.section.system": "Hệ thống",
    "sidebar.item.overview": "Dashboard",
    "sidebar.item.taskManager": "Task manager",
    "sidebar.item.taskOverview": "Tổng quan task",
    "sidebar.item.taskBoard": "Task board",
    "sidebar.item.taskCalendar": "Lịch công việc",
    "sidebar.item.taskBacklog": "Backlog",
    "sidebar.item.userManagement": "Quản lý người dùng",
    "sidebar.item.roleGroups": "Quản lý nhóm quyền",
    "sidebar.item.branches": "Quản lý chi nhánh",
    "sidebar.item.companyInfo": "Thông tin công ty",
    "sidebar.item.settings": "Cài đặt",
    "sidebar.actions.open": "Mở",
    "sidebar.actions.share": "Chia sẻ",
    "sidebar.actions.edit": "Sửa",
    "sidebar.actions.delete": "Xóa",
    "sidebar.actions.openItemMenu": "Mở menu thao tác",

    "users.title": "Quản lý người dùng",
    "users.subtitle":
      "Quản lý thành viên, vai trò và quyền truy cập trong hệ thống.",
    "users.tab.table": "Bảng",
    "users.tab.board": "Board",
    "users.tab.list": "Danh sách",
    "users.action.export": "Xuất dữ liệu",
    "users.action.addUser": "Thêm user",
    "users.filter.searchPlaceholder":
      "Tìm theo tên, email hoặc số điện thoại...",
    "users.filter.role": "Vai trò",
    "users.filter.allRoles": "Tất cả vai trò",
    "users.filter.status": "Trạng thái",
    "users.filter.allStatus": "Tất cả trạng thái",
    "users.filter.twoFactor": "2FA",
    "users.filter.twoFactorAll": "2FA: Tất cả",
    "users.filter.twoFactorEnabled": "2FA: Đã bật",
    "users.filter.twoFactorDisabled": "2FA: Tắt",
    "users.filter.reset": "Đặt lại bộ lọc",
    "users.table.fullName": "Họ tên",
    "users.table.email": "Email",
    "users.table.roles": "Vai trò",
    "users.table.status": "Trạng thái",
    "users.table.joinedDate": "Ngày tham gia",
    "users.table.twoFactor": "2FA",
    "users.table.actions": "Thao tác",
    "users.table.loading": "Đang tải danh sách user...",
    "users.table.empty": "Không có user nào phù hợp với bộ lọc hiện tại.",
    "users.table.action.edit": "Sửa",
    "users.table.action.password": "Mật khẩu",
    "users.table.action.delete": "Xóa",
    "users.table.action.menu": "Thao tác",
    "users.table.action.changeStatus": "Đổi trạng thái",
    "users.rowsPerPage": "Số dòng mỗi trang",
    "users.rowsRange": "{start}-{end} trên {total} dòng",
    "users.status.working": "Đang làm",
    "users.status.onLeave": "Nghỉ phép",
    "users.status.resigned": "Nghỉ việc",
    "users.twoFactor.enabled": "Bật",
    "users.twoFactor.disabled": "Tắt",
    "users.profile.title": "Cập nhật hồ sơ người dùng",
    "users.profile.description":
      "Chỉnh sửa thông tin cá nhân, role và trạng thái tài khoản.",
    "users.profile.fullName": "Họ tên",
    "users.profile.email": "Email",
    "users.profile.phone": "Số điện thoại",
    "users.profile.address": "Địa chỉ",
    "users.profile.gender": "Giới tính",
    "users.profile.gender.unknown": "Chưa xác định",
    "users.profile.gender.male": "Nam",
    "users.profile.gender.female": "Nữ",
    "users.profile.gender.other": "Khác",
    "users.profile.status": "Trạng thái",
    "users.profile.roles": "Vai trò (chọn nhiều)",
    "users.profile.twoFactor.title": "Xác thực 2 lớp",
    "users.profile.twoFactor.description":
      "Bật xác thực hai lớp cho tài khoản người dùng.",
    "users.profile.save": "Lưu hồ sơ",
    "users.password.title": "Cập nhật mật khẩu",
    "users.password.description":
      "Thiết lập mật khẩu mới cho {name}.",
    "users.password.new": "Mật khẩu mới",
    "users.password.confirm": "Xác nhận mật khẩu",
    "users.password.placeholder.new": "Tối thiểu 8 ký tự",
    "users.password.placeholder.confirm": "Nhập lại mật khẩu mới",
    "users.password.error.min8": "Mật khẩu phải có ít nhất 8 ký tự.",
    "users.password.error.notMatch": "Mật khẩu xác nhận chưa khớp.",
    "users.password.submit": "Cập nhật mật khẩu",
    "users.delete.title": "Xóa tài khoản người dùng?",
    "users.delete.description":
      "Bạn sắp xóa {name}. Hành động này không thể hoàn tác.",
    "users.delete.confirm": "Xóa user",
    "users.common.cancel": "Hủy",
    "users.common.close": "Đóng",
    "users.common.unknownUser": "người dùng",
    "users.notice.profileUpdated.title": "\"{name}\" đã được cập nhật",
    "users.notice.profileUpdated.description":
      "Thông tin hồ sơ đã được lưu thành công.",
    "users.notice.passwordUpdated.title": "Cập nhật mật khẩu thành công",
    "users.notice.passwordUpdated.description":
      "Mật khẩu của \"{name}\" đã được thay đổi.",
    "users.notice.statusChanged.title": "Đã đổi trạng thái cho {name}",
    "users.notice.statusChanged.description":
      "Trạng thái mới: {status}.",
    "users.notice.userDeleted.title": "Đã xóa người dùng",
    "users.notice.userDeleted.description":
      "\"{name}\" đã được xóa khỏi hệ thống.",
    "users.notice.error.updateProfile": "Cập nhật hồ sơ thất bại",
    "users.notice.error.updatePassword": "Cập nhật mật khẩu thất bại",
    "users.notice.error.changeStatus": "Không thể đổi trạng thái",
    "users.notice.error.deleteUser": "Xóa user thất bại",
    "users.error.passwordPolicy":
      "Mật khẩu chưa đạt chính sách bảo mật (ít nhất 8 ký tự).",
    "users.error.notFound": "Người dùng không tồn tại hoặc đã bị xóa.",
    "users.error.unknown": "Có lỗi xảy ra. Vui lòng thử lại.",

    "tasks.title": "Task manager",
    "tasks.description":
      "Theo dõi công việc, tiến độ xử lý và phối hợp giữa các nhóm.",
    "tasks.board.title": "Task board",
    "tasks.board.description":
      "Quản lý task theo luồng Kanban và trạng thái thực thi.",
    "tasks.calendar.title": "Lịch công việc",
    "tasks.calendar.description":
      "Theo dõi deadline, lịch hẹn và milestone theo thời gian.",
    "tasks.backlog.title": "Backlog",
    "tasks.backlog.description":
      "Ưu tiên các hạng mục tồn đọng trước khi đưa vào sprint.",
    "roles.title": "Quản lý nhóm quyền",
    "roles.description":
      "Định nghĩa nhóm vai trò và phạm vi truy cập cho từng nghiệp vụ.",
    "branches.title": "Quản lý chi nhánh",
    "branches.description":
      "Cấu hình và theo dõi thông tin vận hành của từng chi nhánh.",
    "company.title": "Thông tin công ty",
    "company.description":
      "Quản lý hồ sơ pháp lý và thông tin tổng quan doanh nghiệp.",
  },
  en: {
    "common.search": "Search",
    "common.comingSoon": "Coming soon",
    "common.light": "Light",
    "common.dark": "Dark",
    "auth.checkingSession": "Checking session...",

    "auth.login.brand": "Tuperator",
    "auth.login.welcomeBack": "Welcome Back",
    "auth.login.subtitle":
      "Enter your email and password to access your account.",
    "auth.login.email": "Email",
    "auth.login.emailPlaceholder": "sellostore@company.com",
    "auth.login.password": "Password",
    "auth.login.passwordPlaceholder": "Enter your password",
    "auth.login.showPassword": "Show",
    "auth.login.hidePassword": "Hide",
    "auth.login.rememberMe": "Remember Me",
    "auth.login.forgotPassword": "Forgot your password?",
    "auth.login.submit": "Log In",
    "auth.login.submitting": "Logging in...",
    "auth.login.sso": "Login by SSO",
    "auth.login.contactAdmin":
      "Need access to the system? Please contact your administrator.",
    "auth.login.copyright": "Copyright © 2026 Tuperator Enterprises LTD.",
    "auth.login.privacyPolicy": "Privacy Policy",
    "auth.login.ssoPlan": "SSO options are planned in the next release.",

    "auth.hero.title": "Effortlessly manage your team and operations.",
    "auth.hero.subtitle":
      "Log in to access your CRM dashboard and manage your team.",

    "auth.validation.emailRequired": "Please enter your email.",
    "auth.validation.emailInvalid": "Email format is not valid.",
    "auth.validation.passwordRequired": "Please enter your password.",
    "auth.validation.passwordMin":
      "Password must have at least 6 characters.",

    "api.error.AUTH_INVALID_CREDENTIALS":
      "Email or password is invalid. Please try again.",
    "api.error.AUTH_ACCESS_TOKEN_EXPIRED":
      "Your session has expired. Please sign in again.",
    "api.error.AUTH_REFRESH_TOKEN_EXPIRED":
      "Your session has expired for too long. Please sign in again.",
    "api.error.AUTH_INVALID_REFRESH_TOKEN":
      "Authentication is no longer valid. Please sign in again.",
    "api.error.AUTH_ACCOUNT_LOCKED":
      "This account is temporarily locked. Please contact your administrator.",
    "api.error.AUTH_ACCOUNT_INACTIVE":
      "This account is inactive. Please contact your administrator.",
    "api.error.AUTH_FORBIDDEN":
      "You do not have permission to perform this action.",
    "api.error.status.401":
      "Authentication is invalid or expired. Please sign in again.",
    "api.error.status.403": "You do not have permission to access this resource.",
    "api.error.status.404": "The requested data was not found.",
    "api.error.status.409":
      "Data conflict detected. Please refresh and try again.",
    "api.error.status.422":
      "Submitted data is invalid. Please review and try again.",
    "api.error.status.5xx":
      "The system is busy or unavailable. Please try again later.",
    "api.error.default": "Something went wrong. Please try again.",

    "app.header.breadcrumb.system": "System",
    "app.header.breadcrumb.dashboards": "Dashboards",
    "app.header.breadcrumb.settings": "Settings",
    "app.header.breadcrumb.default": "Default",
    "app.header.breadcrumb.users": "User management",
    "app.header.breadcrumb.tasks": "Task manager",
    "app.header.breadcrumb.roleGroups": "Role groups",
    "app.header.breadcrumb.branches": "Branches",
    "app.header.breadcrumb.company": "Company info",
    "app.header.aria.toggleTheme": "Toggle light and dark theme",
    "app.header.aria.openSettings": "Open settings page",
    "app.header.aria.openUserAccount": "Open user account",
    "app.header.aria.toggleNotifications": "Toggle notifications sheet",

    "app.feed.time.justNow": "Just now",
    "app.feed.time.59m": "59 minutes ago",
    "app.feed.time.12h": "12 hours ago",
    "app.feed.time.today1159": "Today, 11:59 AM",
    "app.feed.time.feb22026": "Feb 2, 2026",
    "app.feed.notification.fixedBug": "You fixed a bug.",
    "app.feed.notification.newUserRegistered": "New user registered.",
    "app.feed.activity.changedStyle": "Changed the style.",
    "app.feed.activity.releasedVersion": "Released a new version.",
    "app.feed.activity.submittedBug": "Submitted a bug.",
    "app.feed.activity.modifiedPage": "Modified 4 data in Page X.",
    "app.feed.activity.deletedPage": "Deleted a page in Project X.",
    "app.notifications.title": "Notifications",
    "app.notifications.description":
      "Recent notifications, activities, and contacts.",
    "app.notifications.activities": "Activities",
    "app.notifications.contacts": "Contacts",
    "app.userMenu.signedInAs": "Signed in as",
    "app.userMenu.profileSettings": "Profile settings",
    "app.userMenu.userManagement": "User management",
    "app.userMenu.securitySettings": "Security settings",
    "app.userMenu.appearanceSettings": "Appearance settings",
    "app.userMenu.helpSupport": "Help & support",
    "app.userMenu.logout": "Log out",
    "app.userMenu.guest": "User",
    "app.userMenu.logoutConfirmTitle": "Confirm logout",
    "app.userMenu.logoutConfirmDescription":
      "Are you sure you want to log out of the system?",
    "app.userMenu.logoutConfirmCancel": "Cancel",
    "app.userMenu.logoutConfirmAction": "Log out",

    "settings.header.title": "System Settings",
    "settings.header.description":
      "Manage core configuration: language, security policies, and interface.",
    "settings.header.autoSave": "Auto-save local",
    "settings.header.backDashboard": "Back to dashboard",
    "settings.sidebar.title": "Categories",
    "settings.sidebar.description": "Basic configuration groups",
    "settings.section.general": "General",
    "settings.section.security": "Security & Policy",
    "settings.section.appearance": "Appearance",
    "settings.general.title": "General Settings",
    "settings.general.description":
      "Configure default operational information for your organization.",
    "settings.general.workspaceName": "Workspace name",
    "settings.general.language": "Language",
    "settings.general.languagePlaceholder": "Select language",
    "settings.general.timezone": "Timezone",
    "settings.general.timezonePlaceholder": "Select timezone",
    "settings.security.title": "Security & Policy",
    "settings.security.description":
      "Set up essential safeguards for users and business data.",
    "settings.security.enforce2fa.title": "Require 2FA for admin accounts",
    "settings.security.enforce2fa.description":
      "Reduce unauthorized access risk to the admin area.",
    "settings.security.ipRestriction.title": "Restrict access by internal IP",
    "settings.security.ipRestriction.description":
      "Allow sign-in only from whitelisted IP addresses.",
    "settings.security.requirePolicy.title":
      "Require users to accept updated policies",
    "settings.security.requirePolicy.description":
      "Show a confirmation prompt whenever policy terms are updated.",
    "settings.security.sessionTimeout": "Session timeout",
    "settings.security.sessionTimeoutPlaceholder": "Select timeout",
    "settings.appearance.title": "Appearance",
    "settings.appearance.description":
      "Customize workspace look and feel: theme, display scale, and accent color.",
    "settings.appearance.themeDefault": "Default theme",
    "settings.appearance.viewScale": "View scale",
    "settings.appearance.accent": "System accent color",
    "settings.appearance.compactDensity.title": "Compact density",
    "settings.appearance.compactDensity.description":
      "Reduce spacing between blocks to show more content.",
    "settings.appearance.reset": "Reset appearance",

    "sidebar.mobile.title": "Navigation menu",
    "sidebar.mobile.description": "Browse the main workspace modules.",
    "sidebar.tabs.favorites": "Favorites",
    "sidebar.tabs.recently": "Recently",
    "sidebar.section.main": "Main",
    "sidebar.section.operations": "Operations",
    "sidebar.section.organization": "Organization",
    "sidebar.section.system": "System",
    "sidebar.item.overview": "Dashboard",
    "sidebar.item.taskManager": "Task manager",
    "sidebar.item.taskOverview": "Task overview",
    "sidebar.item.taskBoard": "Task board",
    "sidebar.item.taskCalendar": "Task calendar",
    "sidebar.item.taskBacklog": "Backlog",
    "sidebar.item.userManagement": "User management",
    "sidebar.item.roleGroups": "Role groups",
    "sidebar.item.branches": "Branches",
    "sidebar.item.companyInfo": "Company info",
    "sidebar.item.settings": "Settings",
    "sidebar.actions.open": "Open",
    "sidebar.actions.share": "Share",
    "sidebar.actions.edit": "Edit",
    "sidebar.actions.delete": "Delete",
    "sidebar.actions.openItemMenu": "Open item actions",

    "users.title": "User management",
    "users.subtitle":
      "Manage team members, roles, and account access permissions.",
    "users.tab.table": "Table",
    "users.tab.board": "Board",
    "users.tab.list": "List",
    "users.action.export": "Export",
    "users.action.addUser": "Add user",
    "users.filter.searchPlaceholder": "Search by name, email or phone...",
    "users.filter.role": "Role",
    "users.filter.allRoles": "All roles",
    "users.filter.status": "Status",
    "users.filter.allStatus": "All status",
    "users.filter.twoFactor": "2FA",
    "users.filter.twoFactorAll": "2FA: All",
    "users.filter.twoFactorEnabled": "2FA: Enabled",
    "users.filter.twoFactorDisabled": "2FA: Disabled",
    "users.filter.reset": "Reset filters",
    "users.table.fullName": "Full name",
    "users.table.email": "Email",
    "users.table.roles": "Roles",
    "users.table.status": "Status",
    "users.table.joinedDate": "Joined date",
    "users.table.twoFactor": "2FA",
    "users.table.actions": "Actions",
    "users.table.loading": "Loading users...",
    "users.table.empty": "No users found with current filters.",
    "users.table.action.edit": "Edit",
    "users.table.action.password": "Password",
    "users.table.action.delete": "Delete",
    "users.table.action.menu": "Actions",
    "users.table.action.changeStatus": "Change status",
    "users.rowsPerPage": "Rows per page",
    "users.rowsRange": "{start}-{end} of {total} rows",
    "users.status.working": "Working",
    "users.status.onLeave": "On leave",
    "users.status.resigned": "Resigned",
    "users.twoFactor.enabled": "Enabled",
    "users.twoFactor.disabled": "Disabled",
    "users.profile.title": "Update user profile",
    "users.profile.description":
      "Update profile details, roles and account status.",
    "users.profile.fullName": "Full name",
    "users.profile.email": "Email",
    "users.profile.phone": "Phone",
    "users.profile.address": "Address",
    "users.profile.gender": "Gender",
    "users.profile.gender.unknown": "Unknown",
    "users.profile.gender.male": "Male",
    "users.profile.gender.female": "Female",
    "users.profile.gender.other": "Other",
    "users.profile.status": "Status",
    "users.profile.roles": "Roles (multi-select)",
    "users.profile.twoFactor.title": "2FA authentication",
    "users.profile.twoFactor.description":
      "Enable two-factor authentication for this account.",
    "users.profile.save": "Save profile",
    "users.password.title": "Update password",
    "users.password.description": "Set a new password for {name}.",
    "users.password.new": "New password",
    "users.password.confirm": "Confirm password",
    "users.password.placeholder.new": "At least 8 characters",
    "users.password.placeholder.confirm": "Re-enter new password",
    "users.password.error.min8": "Password must have at least 8 characters.",
    "users.password.error.notMatch": "Password confirmation does not match.",
    "users.password.submit": "Update password",
    "users.delete.title": "Delete user account?",
    "users.delete.description":
      "You are about to delete {name}. This action cannot be undone.",
    "users.delete.confirm": "Delete user",
    "users.common.cancel": "Cancel",
    "users.common.close": "Close",
    "users.common.unknownUser": "user",
    "users.notice.profileUpdated.title": "\"{name}\" updated",
    "users.notice.profileUpdated.description":
      "Profile details have been saved successfully.",
    "users.notice.passwordUpdated.title": "Password updated",
    "users.notice.passwordUpdated.description":
      "Password for \"{name}\" has been updated.",
    "users.notice.statusChanged.title": "{name} status changed",
    "users.notice.statusChanged.description":
      "Status updated to {status}.",
    "users.notice.userDeleted.title": "User deleted",
    "users.notice.userDeleted.description":
      "\"{name}\" has been removed from the system.",
    "users.notice.error.updateProfile": "Update profile failed",
    "users.notice.error.updatePassword": "Update password failed",
    "users.notice.error.changeStatus": "Cannot update status",
    "users.notice.error.deleteUser": "Delete user failed",
    "users.error.passwordPolicy":
      "Password does not meet policy (minimum 8 characters).",
    "users.error.notFound": "User not found or already removed.",
    "users.error.unknown": "Something went wrong. Please try again.",

    "tasks.title": "Task manager",
    "tasks.description":
      "Track work items, progress and cross-team collaboration.",
    "tasks.board.title": "Task board",
    "tasks.board.description":
      "Manage work items in a Kanban-style execution flow.",
    "tasks.calendar.title": "Task calendar",
    "tasks.calendar.description":
      "Monitor deadlines, schedules, and milestones over time.",
    "tasks.backlog.title": "Backlog",
    "tasks.backlog.description":
      "Prioritize pending items before moving them into a sprint.",
    "roles.title": "Role groups",
    "roles.description":
      "Define role bundles and permission scopes by business area.",
    "branches.title": "Branches",
    "branches.description":
      "Configure and track operational details for each branch.",
    "company.title": "Company info",
    "company.description":
      "Manage legal profile and core organizational information.",
  },
} as const;

export type TranslationKey = keyof (typeof TRANSLATIONS)["vi"];

export function isLocale(value: string): value is Locale {
  return value === "vi" || value === "en";
}

export function translate(locale: Locale, key: TranslationKey) {
  return TRANSLATIONS[locale][key] || TRANSLATIONS[DEFAULT_LOCALE][key];
}

export function translateWithParams(
  locale: Locale,
  key: TranslationKey,
  params: Record<string, string | number>,
) {
  let message = String(translate(locale, key));
  for (const [name, value] of Object.entries(params)) {
    message = message.replaceAll(`{${name}}`, String(value));
  }
  return message;
}
