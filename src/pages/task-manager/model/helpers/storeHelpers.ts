import {
  DEFAULT_TASK_PRIORITIES,
  TASK_MANAGER_DEFAULT_STORE,
  TASK_MANAGER_STORAGE_KEY,
} from "../constants";
import type { TaskManagerStore } from "../types";
import {
  buildWorkflowByProjectMap,
  buildLegacyWorkflowTemplates,
  normalizeWorkflowTemplates,
  normalizeWorkflowMap,
  sanitizeTaskStatus,
} from "./workflowHelpers";
import { normalizeSprints, normalizeTasks } from "./taskHelpers";

export function normalizeStore(
  raw: Partial<TaskManagerStore> & {
    workflowByProject?: Record<string, string[]>;
  },
): TaskManagerStore {
  const taskPriorities = raw.taskPriorities || DEFAULT_TASK_PRIORITIES;
  const projects = raw.projects || [];
  const workflows = normalizeWorkflowTemplates(
    raw.workflowTemplates?.length
      ? raw.workflowTemplates
      : buildLegacyWorkflowTemplates(projects, raw.workflowByProject),
  );
  const workflowIdByProject = normalizeWorkflowMap(
    projects,
    workflows,
    raw.workflowIdByProject,
    raw.workflowByProject,
  );
  const workflowByProject = buildWorkflowByProjectMap(
    projects,
    workflows,
    workflowIdByProject,
  );
  const sprints = normalizeSprints(raw.sprints || []);
  const sprintIdSet = new Set(sprints.map((sprint) => sprint.id));
  const tasks = normalizeTasks(raw.tasks || [], taskPriorities)
    .map((task) =>
      task.sprintId && !sprintIdSet.has(task.sprintId)
        ? { ...task, sprintId: null }
        : task,
    )
    .map((task) =>
      sanitizeTaskStatus(task, task.projectId, workflows, workflowIdByProject),
    );
  const selectedProjectId = raw.selectedProjectId || projects[0]?.id || null;

  return {
    projects,
    tasks,
    sprints,
    workflowTemplates: workflows,
    workflowIdByProject,
    workflowByProject,
    memberRolesByProject: raw.memberRolesByProject || {},
    selectedProjectId,
    taskPriorities,
  };
}

export function getInitialStore(): TaskManagerStore {
  if (typeof window === "undefined") {
    return TASK_MANAGER_DEFAULT_STORE;
  }

  const raw = window.localStorage.getItem(TASK_MANAGER_STORAGE_KEY);
  if (!raw) {
    return TASK_MANAGER_DEFAULT_STORE;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<TaskManagerStore>;
    return normalizeStore(parsed);
  } catch {
    return TASK_MANAGER_DEFAULT_STORE;
  }
}
