import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile } from "../../user-management/model/userManagement.api";
import {
  TASK_WORKFLOW_DEFAULT_PAGE,
  TASK_WORKFLOW_DEFAULT_PAGE_SIZE,
} from "./constants";
import {
  assignWorkflowProjects,
  createWorkflow,
  createWorkflowStatus,
  createWorkflowTransition,
  deleteWorkflow,
  deleteWorkflowStatus,
  deleteWorkflowTransition,
  getWorkflowDetail,
  listWorkflows,
  updateWorkflow,
  updateWorkflowStatus,
} from "./workflowManagement.api";
import type {
  CreateWorkflowRequest,
  CreateWorkflowStatusRequest,
  UpdateWorkflowRequest,
  UpdateWorkflowStatusRequest,
  WorkflowTransitionRequest,
} from "./workflowManagement.types";

export const WORKFLOW_MANAGEMENT_QUERY_KEYS = {
  profile: "task-workflow-profile",
  list: "task-workflows",
  detail: "task-workflow-detail",
} as const;

export function useWorkflowManagement(selectedWorkflowId: string | null) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(TASK_WORKFLOW_DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(TASK_WORKFLOW_DEFAULT_PAGE_SIZE);

  const filters = useMemo(
    () => ({
      page,
      size: pageSize,
    }),
    [page, pageSize],
  );

  const myProfileQuery = useQuery({
    queryKey: [WORKFLOW_MANAGEMENT_QUERY_KEYS.profile],
    queryFn: getMyProfile,
  });

  const workflowsQuery = useQuery({
    queryKey: [WORKFLOW_MANAGEMENT_QUERY_KEYS.list, filters],
    queryFn: () => listWorkflows(filters),
  });

  const workflowDetailQuery = useQuery({
    queryKey: [WORKFLOW_MANAGEMENT_QUERY_KEYS.detail, selectedWorkflowId],
    queryFn: () => getWorkflowDetail(selectedWorkflowId as string),
    enabled: Boolean(selectedWorkflowId),
  });

  const invalidateWorkflowQueries = async (workflowId?: string) => {
    await queryClient.invalidateQueries({
      queryKey: [WORKFLOW_MANAGEMENT_QUERY_KEYS.list],
    });

    if (workflowId) {
      await queryClient.invalidateQueries({
        queryKey: [WORKFLOW_MANAGEMENT_QUERY_KEYS.detail, workflowId],
      });
    }
  };

  const createWorkflowMutation = useMutation({
    mutationFn: async (
      payload: Omit<CreateWorkflowRequest, "createdById" | "companyId">,
    ) => {
      const profile = myProfileQuery.data;
      if (!profile?.id || !profile.companyId) {
        throw new Error("Current user profile is not ready.");
      }

      return createWorkflow({
        ...payload,
        createdById: profile.id,
        companyId: profile.companyId,
      });
    },
    onSuccess: async () => {
      await invalidateWorkflowQueries();
    },
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: (args: { workflowId: string; payload: UpdateWorkflowRequest }) =>
      updateWorkflow(args.workflowId, args.payload),
    onSuccess: async (_, variables) => {
      await invalidateWorkflowQueries(variables.workflowId);
    },
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: (workflowId: string) => deleteWorkflow(workflowId),
    onSuccess: async (_, workflowId) => {
      await invalidateWorkflowQueries(workflowId);
      queryClient.removeQueries({
        queryKey: [WORKFLOW_MANAGEMENT_QUERY_KEYS.detail, workflowId],
      });
    },
  });

  const assignProjectsMutation = useMutation({
    mutationFn: (args: { workflowId: string; projectIds: string[] }) =>
      assignWorkflowProjects(args.workflowId, args.projectIds),
    onSuccess: async (_, variables) => {
      await invalidateWorkflowQueries(variables.workflowId);
    },
  });

  const createStatusMutation = useMutation({
    mutationFn: (args: {
      workflowId: string;
      payload: CreateWorkflowStatusRequest;
    }) => createWorkflowStatus(args.workflowId, args.payload),
    onSuccess: async (_, variables) => {
      await invalidateWorkflowQueries(variables.workflowId);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (args: {
      workflowId: string;
      statusId: string;
      payload: UpdateWorkflowStatusRequest;
    }) => updateWorkflowStatus(args.workflowId, args.statusId, args.payload),
    onSuccess: async (_, variables) => {
      await invalidateWorkflowQueries(variables.workflowId);
    },
  });

  const deleteStatusMutation = useMutation({
    mutationFn: (args: { workflowId: string; statusId: string }) =>
      deleteWorkflowStatus(args.workflowId, args.statusId),
    onSuccess: async (_, variables) => {
      await invalidateWorkflowQueries(variables.workflowId);
    },
  });

  const createTransitionMutation = useMutation({
    mutationFn: (args: {
      workflowId: string;
      payload: WorkflowTransitionRequest;
    }) => createWorkflowTransition(args.workflowId, args.payload),
    onSuccess: async (_, variables) => {
      await invalidateWorkflowQueries(variables.workflowId);
    },
  });

  const deleteTransitionMutation = useMutation({
    mutationFn: (args: { workflowId: string; transitionId: string }) =>
      deleteWorkflowTransition(args.workflowId, args.transitionId),
    onSuccess: async (_, variables) => {
      await invalidateWorkflowQueries(variables.workflowId);
    },
  });

  const isMutating =
    createWorkflowMutation.isPending ||
    updateWorkflowMutation.isPending ||
    deleteWorkflowMutation.isPending ||
    assignProjectsMutation.isPending ||
    createStatusMutation.isPending ||
    updateStatusMutation.isPending ||
    deleteStatusMutation.isPending ||
    createTransitionMutation.isPending ||
    deleteTransitionMutation.isPending;

  return {
    myProfileQuery,
    workflowsQuery,
    workflowDetailQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    total: workflowsQuery.data?.total ?? 0,
    totalPages:
      workflowsQuery.data?.totalPages ??
      Math.max(1, Math.ceil((workflowsQuery.data?.total ?? 0) / pageSize)),
    createWorkflowMutation,
    updateWorkflowMutation,
    deleteWorkflowMutation,
    assignProjectsMutation,
    createStatusMutation,
    updateStatusMutation,
    deleteStatusMutation,
    createTransitionMutation,
    deleteTransitionMutation,
    isMutating,
  };
}
