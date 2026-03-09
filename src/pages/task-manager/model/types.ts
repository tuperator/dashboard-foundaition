export const PROJECT_TYPE_VALUES = ["SCRUM", "KANBAN"] as const;
export type ProjectType = (typeof PROJECT_TYPE_VALUES)[number];

export const PROJECT_MEMBER_ROLE_VALUES = [
  "OWNER",
  "ADMIN",
  "MEMBER",
  "VIEWER",
] as const;
export type ProjectMemberRole = (typeof PROJECT_MEMBER_ROLE_VALUES)[number];

export const TASK_STATUS_VALUES = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
] as const;
export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];

export const TASK_PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;
export type TaskPriority = (typeof TASK_PRIORITY_VALUES)[number];

export const SPRINT_STATUS_VALUES = ["PLANNED", "ACTIVE", "CLOSED"] as const;
export type SprintStatus = (typeof SPRINT_STATUS_VALUES)[number];

export const WORKFLOW_STATUS_CATEGORY_VALUES = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
] as const;
export type WorkflowStatusCategory =
  (typeof WORKFLOW_STATUS_CATEGORY_VALUES)[number];

export const WORKFLOW_ISSUE_TYPE_VALUES = [
  "TASK",
  "BUG",
  "STORY",
  "EPIC",
] as const;
export type WorkflowIssueType = (typeof WORKFLOW_ISSUE_TYPE_VALUES)[number];

export type TaskProject = {
  id: string;
  name: string;
  key: string;
  description: string;
  owner: string;
  members: string[];
  type: ProjectType;
};

export type TaskItem = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignee: string | null;
  status: string;
  priority: TaskPriority;
  sprintId: string | null;
  backlogOrder: number;
  updatedAt: string;
};

export type SprintItem = {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  createdAt: string;
};

export type WorkflowStatusItem = {
  id: string;
  code: string;
  name: string;
  color: string;
  category: WorkflowStatusCategory;
};

export type WorkflowTransitionItem = {
  id: string;
  fromStatusCode: string;
  toStatusCode: string;
};

export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  statuses: WorkflowStatusItem[];
  transitions: WorkflowTransitionItem[];
  issueTypes: WorkflowIssueType[];
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectPayload = Omit<TaskProject, "id" | "members"> & {
  members?: string[];
};

export type UpdateProjectPayload = Omit<TaskProject, "id">;

export type CreateTaskPayload = Omit<
  TaskItem,
  "id" | "updatedAt" | "backlogOrder" | "sprintId"
> & {
  sprintId?: string | null;
  backlogOrder?: number;
};
export type UpdateTaskPayload = Omit<
  TaskItem,
  "id" | "updatedAt" | "backlogOrder" | "sprintId"
> & {
  sprintId?: string | null;
  backlogOrder?: number;
};
export type CreateSprintPayload = Omit<
  SprintItem,
  "id" | "createdAt" | "status"
>;
export type UpdateSprintPayload = Pick<
  SprintItem,
  "name" | "goal" | "startDate" | "endDate"
>;

export type CreateWorkflowPayload = Pick<
  WorkflowTemplate,
  "name" | "description"
> & {
  issueTypes?: WorkflowIssueType[];
};

export type UpdateWorkflowPayload = Pick<
  WorkflowTemplate,
  "name" | "description" | "issueTypes"
>;

export type CreateWorkflowStatusPayload = Omit<WorkflowStatusItem, "id">;
export type UpdateWorkflowStatusPayload = Omit<WorkflowStatusItem, "id">;

export type TaskManagerStore = {
  projects: TaskProject[];
  tasks: TaskItem[];
  sprints: SprintItem[];
  workflowTemplates: WorkflowTemplate[];
  workflowIdByProject: Record<string, string>;
  workflowByProject: Record<string, string[]>;
  memberRolesByProject: Record<string, Record<string, ProjectMemberRole>>;
  selectedProjectId: string | null;
};
