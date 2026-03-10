import { API_ENDPOINTS } from "@/shared/api/endpoints";
import { apiClient } from "@/shared/api/http";
import {
  WORKFLOW_ISSUE_TYPE_VALUES,
  WORKFLOW_STATUS_CATEGORY_VALUES,
  type WorkflowIssueType,
  type WorkflowStatusCategory,
  type WorkflowStatusItem,
  type WorkflowTransitionItem,
} from "./types";
import type {
  CreateWorkflowRequest,
  CreateWorkflowStatusRequest,
  UpdateWorkflowRequest,
  UpdateWorkflowStatusRequest,
  WorkflowAssignedProject,
  WorkflowDetail,
  WorkflowListItem,
  WorkflowTransitionRequest,
} from "./workflowManagement.types";

type BackendWorkflowAssignedProject = {
  id: string;
  name: string;
  key: string;
};

type BackendWorkflowStatus = {
  id: string;
  code: string;
  name: string;
  color: string;
  category: string;
};

type BackendWorkflowTransition = {
  id: string;
  fromStatusCode: string;
  toStatusCode: string;
};

type BackendWorkflowListItem = {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  companyId: string;
  issueTypes: string[] | null;
  statusCount: number | null;
  transitionCount: number | null;
  assignedProjectCount: number | null;
  assignedProjects: BackendWorkflowAssignedProject[] | null;
  createdAt: string;
  updatedAt: string;
};

type BackendWorkflowListResponse = {
  items: BackendWorkflowListItem[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

type BackendWorkflowDetail = {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  companyId: string;
  issueTypes: string[] | null;
  statuses: BackendWorkflowStatus[] | null;
  transitions: BackendWorkflowTransition[] | null;
  assignedProjects: BackendWorkflowAssignedProject[] | null;
  createdAt: string;
  updatedAt: string;
};

type WorkflowListParams = {
  page?: number;
  size?: number;
  search?: string;
  issueType?: WorkflowIssueType | null;
  projectId?: string | null;
  sortBy?: "UPDATED_AT" | "NAME" | "CREATED_AT";
  sortDirection?: "ASC" | "DESC";
};

const FALLBACK_WORKFLOW_ISSUE_TYPES: WorkflowIssueType[] = ["TASK", "BUG", "STORY"];

export async function listWorkflows(
  params: WorkflowListParams = {},
): Promise<BackendWorkflowListResponse & { items: WorkflowListItem[] }> {
  const response = await apiClient.get<BackendWorkflowListResponse>(
    API_ENDPOINTS.taskManagement.workflows.list,
    {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 100,
        search: params.search?.trim() || undefined,
        issueType: params.issueType || undefined,
        projectId: params.projectId || undefined,
        sortBy: params.sortBy ?? "UPDATED_AT",
        sortDirection: params.sortDirection ?? "DESC",
      },
    },
  );

  return {
    ...response.data,
    items: response.data.items.map(mapWorkflowListItem),
  };
}

export async function getWorkflowDetail(
  workflowId: string,
): Promise<WorkflowDetail> {
  const response = await apiClient.get<BackendWorkflowDetail>(
    API_ENDPOINTS.taskManagement.workflows.byId(workflowId),
  );

  return mapWorkflowDetail(response.data);
}

export async function createWorkflow(
  payload: CreateWorkflowRequest,
): Promise<WorkflowDetail> {
  const response = await apiClient.post<BackendWorkflowDetail>(
    API_ENDPOINTS.taskManagement.workflows.list,
    {
      name: payload.name.trim(),
      description: payload.description.trim(),
      createdById: payload.createdById,
      companyId: payload.companyId,
      issueTypes:
        payload.issueTypes && payload.issueTypes.length > 0
          ? payload.issueTypes
          : FALLBACK_WORKFLOW_ISSUE_TYPES,
    },
  );

  return mapWorkflowDetail(response.data);
}

export async function updateWorkflow(
  workflowId: string,
  payload: UpdateWorkflowRequest,
): Promise<WorkflowDetail> {
  const response = await apiClient.put<BackendWorkflowDetail>(
    API_ENDPOINTS.taskManagement.workflows.byId(workflowId),
    {
      name: payload.name.trim(),
      description: payload.description.trim(),
      issueTypes: payload.issueTypes,
    },
  );

  return mapWorkflowDetail(response.data);
}

export async function deleteWorkflow(workflowId: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.taskManagement.workflows.byId(workflowId));
}

export async function createWorkflowStatus(
  workflowId: string,
  payload: CreateWorkflowStatusRequest,
): Promise<WorkflowStatusItem> {
  const response = await apiClient.post<BackendWorkflowStatus>(
    API_ENDPOINTS.taskManagement.workflows.statuses(workflowId),
    {
      code: payload.code.trim(),
      name: payload.name.trim(),
      color: payload.color,
      category: payload.category,
    },
  );

  return mapWorkflowStatus(response.data);
}

export async function updateWorkflowStatus(
  workflowId: string,
  statusId: string,
  payload: UpdateWorkflowStatusRequest,
): Promise<WorkflowStatusItem> {
  const response = await apiClient.put<BackendWorkflowStatus>(
    API_ENDPOINTS.taskManagement.workflows.statusById(workflowId, statusId),
    {
      code: payload.code.trim(),
      name: payload.name.trim(),
      color: payload.color,
      category: payload.category,
    },
  );

  return mapWorkflowStatus(response.data);
}

export async function deleteWorkflowStatus(
  workflowId: string,
  statusId: string,
): Promise<void> {
  await apiClient.delete(
    API_ENDPOINTS.taskManagement.workflows.statusById(workflowId, statusId),
  );
}

export async function createWorkflowTransition(
  workflowId: string,
  payload: WorkflowTransitionRequest,
): Promise<WorkflowTransitionItem> {
  const response = await apiClient.post<BackendWorkflowTransition>(
    API_ENDPOINTS.taskManagement.workflows.transitions(workflowId),
    payload,
  );

  return mapWorkflowTransition(response.data);
}

export async function deleteWorkflowTransition(
  workflowId: string,
  transitionId: string,
): Promise<void> {
  await apiClient.delete(
    API_ENDPOINTS.taskManagement.workflows.transitionById(
      workflowId,
      transitionId,
    ),
  );
}

export async function assignWorkflowProjects(
  workflowId: string,
  projectIds: string[],
): Promise<void> {
  await apiClient.put(API_ENDPOINTS.taskManagement.workflows.projects(workflowId), {
    projectIds,
  });
}

function mapWorkflowListItem(item: BackendWorkflowListItem): WorkflowListItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description || "",
    createdById: item.createdById,
    companyId: item.companyId,
    issueTypes: normalizeIssueTypes(item.issueTypes),
    statusCount: item.statusCount ?? 0,
    transitionCount: item.transitionCount ?? 0,
    assignedProjectCount:
      item.assignedProjectCount ?? item.assignedProjects?.length ?? 0,
    assignedProjects: (item.assignedProjects || []).map(mapAssignedProject),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function mapWorkflowDetail(item: BackendWorkflowDetail): WorkflowDetail {
  return {
    id: item.id,
    name: item.name,
    description: item.description || "",
    createdById: item.createdById,
    companyId: item.companyId,
    issueTypes: normalizeIssueTypes(item.issueTypes),
    statuses: (item.statuses || []).map(mapWorkflowStatus),
    transitions: (item.transitions || []).map(mapWorkflowTransition),
    assignedProjects: (item.assignedProjects || []).map(mapAssignedProject),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function mapWorkflowStatus(item: BackendWorkflowStatus): WorkflowStatusItem {
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    color: item.color,
    category: normalizeStatusCategory(item.category),
  };
}

function mapWorkflowTransition(
  item: BackendWorkflowTransition,
): WorkflowTransitionItem {
  return {
    id: item.id,
    fromStatusCode: item.fromStatusCode,
    toStatusCode: item.toStatusCode,
  };
}

function mapAssignedProject(
  item: BackendWorkflowAssignedProject,
): WorkflowAssignedProject {
  return {
    id: item.id,
    name: item.name,
    key: item.key,
  };
}

function normalizeIssueTypes(
  issueTypes: string[] | null | undefined,
): WorkflowIssueType[] {
  const validTypes = new Set(WORKFLOW_ISSUE_TYPE_VALUES);
  const normalized = (issueTypes || []).filter(
    (issueType): issueType is WorkflowIssueType =>
      validTypes.has(issueType as WorkflowIssueType),
  );

  return normalized.length > 0 ? normalized : FALLBACK_WORKFLOW_ISSUE_TYPES;
}

function normalizeStatusCategory(category: string): WorkflowStatusCategory {
  const validCategories = new Set(WORKFLOW_STATUS_CATEGORY_VALUES);
  if (validCategories.has(category as WorkflowStatusCategory)) {
    return category as WorkflowStatusCategory;
  }
  return "TODO";
}
