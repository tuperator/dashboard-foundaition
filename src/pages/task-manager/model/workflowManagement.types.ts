import type {
  WorkflowIssueType,
  WorkflowStatusCategory,
  WorkflowTemplate,
} from "./types";

export type WorkflowAssignedProject = {
  id: string;
  name: string;
  key: string;
};

export type WorkflowListItem = {
  id: string;
  name: string;
  description: string;
  createdById: string;
  companyId: string;
  issueTypes: WorkflowIssueType[];
  statusCount: number;
  transitionCount: number;
  assignedProjectCount: number;
  assignedProjects: WorkflowAssignedProject[];
  createdAt: string;
  updatedAt: string;
};

export type WorkflowDetail = WorkflowTemplate & {
  createdById: string;
  companyId: string;
  assignedProjects: WorkflowAssignedProject[];
};

export type CreateWorkflowRequest = {
  name: string;
  description: string;
  createdById: string;
  companyId: string;
  issueTypes?: WorkflowIssueType[];
};

export type UpdateWorkflowRequest = {
  name: string;
  description: string;
  issueTypes: WorkflowIssueType[];
};

export type CreateWorkflowStatusRequest = {
  code: string;
  name: string;
  color: string;
  category: WorkflowStatusCategory;
};

export type UpdateWorkflowStatusRequest = CreateWorkflowStatusRequest;

export type WorkflowTransitionRequest = {
  fromStatusCode: string;
  toStatusCode: string;
};
