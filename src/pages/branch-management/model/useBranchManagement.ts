import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBranch,
  getCurrentProfile,
  listBranchesByCompany,
  updateBranch,
  updateBranchStatus,
} from "./branchManagement.api";
import { BRANCH_FILTER_ALL, BRANCH_MANAGEMENT_QUERY_KEYS } from "./constants";
import type {
  BranchItem,
  BranchStatus,
  BranchStatusFilter,
  CreateBranchPayload,
  UpdateBranchPayload,
} from "./types";

export function useBranchManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<BranchStatusFilter>(BRANCH_FILTER_ALL);

  const myProfileQuery = useQuery({
    queryKey: [BRANCH_MANAGEMENT_QUERY_KEYS.me],
    queryFn: getCurrentProfile,
  });

  const companyId = myProfileQuery.data?.companyId || null;

  const branchesQuery = useQuery({
    queryKey: [BRANCH_MANAGEMENT_QUERY_KEYS.list, companyId],
    queryFn: () => listBranchesByCompany(companyId as string),
    enabled: Boolean(companyId),
  });

  const createBranchMutation = useMutation({
    mutationFn: (payload: CreateBranchPayload) =>
      createBranch(companyId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [BRANCH_MANAGEMENT_QUERY_KEYS.list],
      });
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: (args: { branchId: string; payload: UpdateBranchPayload }) =>
      updateBranch(args.branchId, args.payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [BRANCH_MANAGEMENT_QUERY_KEYS.list],
      });
    },
  });

  const updateBranchStatusMutation = useMutation({
    mutationFn: (args: { branchId: string; status: BranchStatus }) =>
      updateBranchStatus(args.branchId, args.status),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [BRANCH_MANAGEMENT_QUERY_KEYS.list],
      });
    },
  });

  const filteredBranches = useMemo(() => {
    const branches = branchesQuery.data || [];
    const normalizedSearch = search.trim().toLowerCase();

    return branches.filter((branch: BranchItem) => {
      if (
        statusFilter !== BRANCH_FILTER_ALL &&
        branch.status !== statusFilter
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableValues = [
        branch.name,
        branch.address || "",
        branch.agentId || "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableValues.includes(normalizedSearch);
    });
  }, [branchesQuery.data, search, statusFilter]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter(BRANCH_FILTER_ALL);
  };

  return {
    companyId,
    myProfileQuery,
    branchesQuery,
    branches: filteredBranches,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    resetFilters,
    createBranchMutation,
    updateBranchMutation,
    updateBranchStatusMutation,
  };
}
