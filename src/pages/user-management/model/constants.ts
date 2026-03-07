import {
  USER_FILTER_ALL_VALUE,
  USER_UNASSIGNED_BRANCH_VALUE,
  type UserStatus,
} from "./types";

export const USER_MANAGEMENT_QUERY_KEYS = {
  me: "user-management-me",
  list: "user-management-list",
  roles: "user-management-roles",
  branches: "user-management-branches",
} as const;

export const USER_DEFAULT_PAGE = 1;
export const USER_DEFAULT_PAGE_SIZE = 15;
export const USER_PAGE_SIZE_OPTIONS = [10, 15, 20] as const;
export const USER_MAX_VISIBLE_PAGES = 7;
export const USER_ROLE_VISIBLE_BADGES = 2;
export const USER_TABLE_COLUMN_COUNT = 8;
export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_FORM_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USER_DEFAULT_CREATE_STATUS: UserStatus = "WORKING";

export const USER_FILTER_ALL = USER_FILTER_ALL_VALUE;
export const USER_UNASSIGNED_BRANCH = USER_UNASSIGNED_BRANCH_VALUE;

export const USER_SHEET_CONTENT_CLASS =
  "w-[520px] max-w-[95vw] [zoom:var(--app-scale)] sm:max-w-[520px]";
export const USER_TABLE_MIN_WIDTH_CLASS = "min-w-[980px]";
export const USER_ACTION_MENU_CLASS = "w-44 rounded-lg [zoom:var(--app-scale)]";
export const USER_ACTION_STATUS_SUB_MENU_CLASS =
  "w-40 rounded-lg [zoom:var(--app-scale)]";
