import { BRANCH_FILTER_ALL_VALUE, type BranchStatus } from "./types";

export const BRANCH_MANAGEMENT_QUERY_KEYS = {
  me: "branch-management-me",
  list: "branch-management-list",
} as const;

export const BRANCH_FILTER_ALL = BRANCH_FILTER_ALL_VALUE;
export const BRANCH_DEFAULT_STATUS: BranchStatus = "ACTIVE";
export const BRANCH_CREATE_STATUS_VALUES: BranchStatus[] = ["ACTIVE", "INACTIVE"];

export const BRANCH_ACTION_MENU_CLASS = "w-48 rounded-lg [zoom:var(--app-scale)]";
export const BRANCH_STATUS_SUB_MENU_CLASS = "w-40 rounded-lg [zoom:var(--app-scale)]";
export const BRANCH_TABLE_MIN_WIDTH_CLASS = "min-w-[940px]";
export const BRANCH_TABLE_COLUMN_COUNT = 7;
export const BRANCH_FORM_DIALOG_CLASS = "[zoom:var(--app-scale)] sm:max-w-lg";
