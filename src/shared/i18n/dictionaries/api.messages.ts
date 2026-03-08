export const apiMessages = {
  vi: {
    "api.error.TOKEN_INVALID":
      "Thông tin xác thực không hợp lệ. Vui lòng đăng nhập lại.",
    "api.error.TOKEN_EXPIRED":
      "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    "api.error.TOKEN_NOT_YET_VALID":
      "Phiên đăng nhập chưa hợp lệ. Vui lòng đăng nhập lại.",
    "api.error.FORBIDDEN": "Bạn không có quyền thực hiện thao tác này.",
    "api.error.COMPANY_ACCESS_DENIED":
      "Bạn không có quyền truy cập dữ liệu của công ty này.",
    "api.error.USER_CREATION_FORBIDDEN":
      "Bạn không có quyền quản lý người dùng.",
    "api.error.USER_PROFILE_NOT_FOUND":
      "Không tìm thấy người dùng hoặc người dùng đã bị xóa.",
    "api.error.USER_ALREADY_EXISTS":
      "Email hoặc số điện thoại đã tồn tại trong hệ thống.",
    "api.error.BRANCH_NOT_FOUND":
      "Chi nhánh không hợp lệ hoặc đã ngừng hoạt động.",
    "api.error.BRANCH_MANAGEMENT_FORBIDDEN":
      "Bạn không có quyền quản lý chi nhánh.",
    "api.error.ROLE_NOT_FOUND": "Vai trò không hợp lệ.",
    "api.error.VALIDATION_ERROR":
      "Dữ liệu gửi lên chưa đúng định dạng. Vui lòng kiểm tra lại.",
    "api.error.REQUEST_BODY_INVALID":
      "Dữ liệu yêu cầu không hợp lệ. Vui lòng kiểm tra lại.",
    "api.error.BAD_REQUEST": "Yêu cầu không hợp lệ.",
    "api.error.INTERNAL_SERVER_ERROR":
      "Hệ thống đang bận. Vui lòng thử lại sau.",
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
    "api.error.status.400": "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.",
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
    "api.error.TOKEN_INVALID":
      "Authentication is invalid. Please sign in again.",
    "api.error.TOKEN_EXPIRED":
      "Your session has expired. Please sign in again.",
    "api.error.TOKEN_NOT_YET_VALID":
      "Your session is not valid yet. Please sign in again.",
    "api.error.FORBIDDEN":
      "You do not have permission to perform this action.",
    "api.error.COMPANY_ACCESS_DENIED":
      "You cannot access data from this company.",
    "api.error.USER_CREATION_FORBIDDEN":
      "You do not have permission to manage users.",
    "api.error.USER_PROFILE_NOT_FOUND":
      "User was not found or has been removed.",
    "api.error.USER_ALREADY_EXISTS":
      "Email or phone number already exists.",
    "api.error.BRANCH_NOT_FOUND":
      "Branch is invalid or no longer active.",
    "api.error.BRANCH_MANAGEMENT_FORBIDDEN":
      "You do not have permission to manage branches.",
    "api.error.ROLE_NOT_FOUND": "Role is invalid.",
    "api.error.VALIDATION_ERROR":
      "Submitted data format is invalid. Please review and try again.",
    "api.error.REQUEST_BODY_INVALID":
      "Request payload is invalid. Please review and try again.",
    "api.error.BAD_REQUEST": "Request is invalid.",
    "api.error.INTERNAL_SERVER_ERROR":
      "The system is busy. Please try again later.",
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
    "api.error.status.400":
      "Request is invalid. Please review and try again.",
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
