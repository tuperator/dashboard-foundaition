export const BRANCH_STATUS_VALUES = ["ACTIVE", "INACTIVE", "DELETED"] as const;
export type BranchStatus = (typeof BRANCH_STATUS_VALUES)[number];

export const BRANCH_FILTER_ALL_VALUE = "ALL" as const;
export type BranchFilterAll = typeof BRANCH_FILTER_ALL_VALUE;
export type BranchStatusFilter = BranchFilterAll | BranchStatus;

export type BranchItem = {
  id: string;
  name: string;
  address: string | null;
  companyId: string | null;
  status: BranchStatus;
  agentId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type BranchListFilters = {
  search: string;
  status: BranchStatusFilter;
};

export type CreateBranchPayload = {
  name: string;
  address: string | null;
  status: BranchStatus;
  agentId: string | null;
};

export type UpdateBranchPayload = {
  name: string;
  address: string | null;
  agentId: string | null;
};
