export const apiMessages = {
  vi: {
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
  },
  en: {
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
  },
} as const;
