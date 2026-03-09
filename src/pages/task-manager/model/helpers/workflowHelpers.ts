import { DEFAULT_WORKFLOW } from "../constants";
import type {
  TaskManagerStore,
  TaskItem,
  TaskProject,
  WorkflowIssueType,
  WorkflowStatusCategory,
  WorkflowStatusItem,
  WorkflowTemplate,
  WorkflowTransitionItem,
} from "../types";

export function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function resolveProjectWorkflow(
  store: Pick<TaskManagerStore, "workflowTemplates" | "workflowIdByProject">,
  projectId: string,
) {
  const workflowTemplateId = store.workflowIdByProject[projectId];
  if (workflowTemplateId) {
    const assigned = store.workflowTemplates.find(
      (workflowTemplate) => workflowTemplate.id === workflowTemplateId,
    );
    if (assigned) {
      return assigned;
    }
  }
  return store.workflowTemplates[0] || null;
}

export function buildWorkflowByProjectMap(
  projects: TaskProject[],
  workflowTemplates: WorkflowTemplate[],
  workflowIdByProject: Record<string, string>,
) {
  return Object.fromEntries(
    projects.map((project) => {
      const workflowTemplate = resolveProjectWorkflow(
        { workflowTemplates, workflowIdByProject } as TaskManagerStore,
        project.id,
      );
      return [
        project.id,
        workflowTemplate?.statuses.map((statusItem) => statusItem.code) ||
          DEFAULT_WORKFLOW,
      ];
    }),
  );
}

export function createDefaultWorkflowTemplate(
  workflowId: string,
  statuses: string[],
  options?: {
    name?: string;
    description?: string;
    issueTypes?: WorkflowIssueType[];
  },
): WorkflowTemplate {
  const now = new Date().toISOString();
  const normalizedStatuses = statuses
    .map((status) => normalizeStatusCode(status))
    .filter(Boolean);
  const statusCodes =
    normalizedStatuses.length > 0 ? normalizedStatuses : DEFAULT_WORKFLOW;
  const statusItems = statusCodes.map((code, index) => ({
    id: `${workflowId}-status-${index + 1}`,
    code,
    name: code.replaceAll("_", " "),
    color: getDefaultStatusColor(code),
    category: getDefaultStatusCategory(code),
  }));

  return {
    id: workflowId,
    name: options?.name?.trim() || "Custom workflow",
    description: options?.description?.trim() || "",
    statuses: statusItems,
    transitions: createDefaultTransitions(
      statusItems.map((statusItem) => statusItem.code),
    ),
    issueTypes: options?.issueTypes?.length
      ? options.issueTypes
      : ["TASK", "BUG", "STORY"],
    createdAt: now,
    updatedAt: now,
  };
}

export function createDefaultTransitions(
  statuses: string[],
): WorkflowTransitionItem[] {
  const transitions: WorkflowTransitionItem[] = [];
  for (let index = 0; index < statuses.length - 1; index += 1) {
    transitions.push({
      id: `transition-${statuses[index]}-${statuses[index + 1]}`,
      fromStatusCode: statuses[index],
      toStatusCode: statuses[index + 1],
    });
  }
  return transitions;
}

export function buildLegacyWorkflowTemplates(
  projects: TaskProject[],
  legacyWorkflowByProject: Record<string, string[]> | undefined,
) {
  const templates: WorkflowTemplate[] = [];

  if (!legacyWorkflowByProject) {
    return templates;
  }

  for (const project of projects) {
    const statuses = legacyWorkflowByProject[project.id];
    if (!statuses?.length) {
      continue;
    }
    templates.push(
      createDefaultWorkflowTemplate(`workflow-${project.id}`, statuses, {
        name: `${project.key} workflow`,
        description: `Migrated workflow from project ${project.name}.`,
      }),
    );
  }

  return templates;
}

export function normalizeWorkflowTemplates(
  rawTemplates: WorkflowTemplate[],
): WorkflowTemplate[] {
  if (rawTemplates.length === 0) {
    return [
      createDefaultWorkflowTemplate("workflow-default", DEFAULT_WORKFLOW, {
        name: "Default workflow",
        description: "System default workflow.",
      }),
    ];
  }

  return rawTemplates.map((template, templateIndex) => {
    const statusItems = template.statuses
      .map((statusItem, statusIndex) => {
        const code = normalizeStatusCode(statusItem.code || statusItem.name);
        if (!code) {
          return null;
        }
        return {
          id:
            statusItem.id ||
            `${template.id || `workflow-${templateIndex + 1}`}-status-${statusIndex + 1}`,
          code,
          name: statusItem.name?.trim() || code,
          color: statusItem.color || getDefaultStatusColor(code),
          category: normalizeStatusCategory(statusItem.category, code),
        } satisfies WorkflowStatusItem;
      })
      .filter((item): item is WorkflowStatusItem => Boolean(item));

    const statuses =
      statusItems.length > 0
        ? deduplicateStatuses(statusItems)
        : createDefaultWorkflowTemplate(
            template.id || `workflow-${templateIndex + 1}`,
            DEFAULT_WORKFLOW,
          ).statuses;

    const allowedCodes = new Set(statuses.map((statusItem) => statusItem.code));
    const transitions = (template.transitions || [])
      .map((transition, transitionIndex) => ({
        id:
          transition.id ||
          `${template.id || `workflow-${templateIndex + 1}`}-transition-${transitionIndex + 1}`,
        fromStatusCode: normalizeStatusCode(transition.fromStatusCode) || "",
        toStatusCode: normalizeStatusCode(transition.toStatusCode) || "",
      }))
      .filter(
        (transition) =>
          transition.fromStatusCode &&
          transition.toStatusCode &&
          transition.fromStatusCode !== transition.toStatusCode &&
          allowedCodes.has(transition.fromStatusCode) &&
          allowedCodes.has(transition.toStatusCode),
      );

    const issueTypes = template.issueTypes?.length
      ? template.issueTypes
      : (["TASK", "BUG", "STORY"] as WorkflowIssueType[]);

    return {
      id: template.id || `workflow-${templateIndex + 1}`,
      name: template.name?.trim() || `Workflow ${templateIndex + 1}`,
      description: template.description?.trim() || "",
      statuses,
      transitions:
        transitions.length > 0
          ? transitions
          : createDefaultTransitions(statuses.map((item) => item.code)),
      issueTypes,
      createdAt: template.createdAt || new Date().toISOString(),
      updatedAt: template.updatedAt || new Date().toISOString(),
    };
  });
}

export function normalizeWorkflowMap(
  projects: TaskProject[],
  workflowTemplates: WorkflowTemplate[],
  workflowIdByProject: Record<string, string> | undefined,
  legacyWorkflowByProject: Record<string, string[]> | undefined,
) {
  const workflowIds = new Set(
    workflowTemplates.map((workflowTemplate) => workflowTemplate.id),
  );
  const normalizedMap: Record<string, string> = {};

  for (const project of projects) {
    const mappedWorkflowId = workflowIdByProject?.[project.id];
    if (mappedWorkflowId && workflowIds.has(mappedWorkflowId)) {
      normalizedMap[project.id] = mappedWorkflowId;
      continue;
    }

    const legacyStatuses = legacyWorkflowByProject?.[project.id] || [];
    const matchedWorkflow = workflowTemplates.find((workflowTemplate) =>
      arraysEqual(
        workflowTemplate.statuses.map((statusItem) => statusItem.code),
        legacyStatuses
          .map((status) => normalizeStatusCode(status))
          .filter(Boolean),
      ),
    );

    normalizedMap[project.id] =
      matchedWorkflow?.id || workflowTemplates[0]?.id || "";
  }

  return normalizedMap;
}

export function sanitizeStatusCodeForProject(
  status: string,
  projectId: string,
  workflowTemplates: WorkflowTemplate[],
  workflowIdByProject: Record<string, string>,
) {
  const normalizedStatus = normalizeStatusCode(status);
  const workflowTemplate = resolveProjectWorkflow(
    { workflowTemplates, workflowIdByProject } as TaskManagerStore,
    projectId,
  );
  const fallbackStatus =
    workflowTemplate?.statuses[0]?.code || DEFAULT_WORKFLOW[0];
  if (!normalizedStatus) {
    return fallbackStatus;
  }
  const allowedStatuses = new Set(
    workflowTemplate?.statuses.map((statusItem) => statusItem.code) ||
      DEFAULT_WORKFLOW,
  );
  return allowedStatuses.has(normalizedStatus)
    ? normalizedStatus
    : fallbackStatus;
}

export function sanitizeTaskStatus(
  task: TaskItem,
  projectId: string,
  workflowTemplates: WorkflowTemplate[],
  workflowIdByProject: Record<string, string>,
) {
  const nextStatus = sanitizeStatusCodeForProject(
    task.status,
    projectId,
    workflowTemplates,
    workflowIdByProject,
  );
  if (nextStatus === task.status) {
    return task;
  }
  return {
    ...task,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
}

export function isWorkflowTransitionAllowed(
  workflowTemplate: WorkflowTemplate | null,
  fromStatusCode: string,
  toStatusCode: string,
) {
  if (fromStatusCode === toStatusCode) {
    return true;
  }

  if (!workflowTemplate) {
    return true;
  }

  if (workflowTemplate.transitions.length === 0) {
    return true;
  }

  return workflowTemplate.transitions.some(
    (transition) =>
      transition.fromStatusCode === fromStatusCode &&
      transition.toStatusCode === toStatusCode,
  );
}

export function normalizeStatusCode(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  return value.trim().replaceAll(" ", "_").toUpperCase();
}

export function getDefaultStatusColor(code: string) {
  if (code.includes("DONE")) {
    return "#10B981";
  }
  if (code.includes("REJECT") || code.includes("BLOCK")) {
    return "#EF4444";
  }
  if (code.includes("REVIEW")) {
    return "#8B5CF6";
  }
  if (code.includes("TEST")) {
    return "#F59E0B";
  }
  if (code.includes("PROGRESS")) {
    return "#3B82F6";
  }
  return "#6B7280";
}

export function getDefaultStatusCategory(code: string): WorkflowStatusCategory {
  if (code.includes("DONE") || code.includes("REJECT")) {
    return "DONE";
  }
  if (
    code.includes("PROGRESS") ||
    code.includes("REVIEW") ||
    code.includes("TEST")
  ) {
    return "IN_PROGRESS";
  }
  return "TODO";
}

export function normalizeStatusCategory(
  category: WorkflowStatusCategory | undefined,
  code: string,
) {
  if (
    category === "TODO" ||
    category === "IN_PROGRESS" ||
    category === "DONE"
  ) {
    return category;
  }
  return getDefaultStatusCategory(code);
}

function deduplicateStatuses(statuses: WorkflowStatusItem[]) {
  const seen = new Set<string>();
  const next: WorkflowStatusItem[] = [];
  for (const statusItem of statuses) {
    if (seen.has(statusItem.code)) {
      continue;
    }
    seen.add(statusItem.code);
    next.push(statusItem);
  }
  return next;
}

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }
  return true;
}
