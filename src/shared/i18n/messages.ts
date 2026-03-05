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
  },
} as const;

export type TranslationKey = keyof (typeof TRANSLATIONS)["vi"];

export function isLocale(value: string): value is Locale {
  return value === "vi" || value === "en";
}

export function translate(locale: Locale, key: TranslationKey) {
  return TRANSLATIONS[locale][key] || TRANSLATIONS[DEFAULT_LOCALE][key];
}
