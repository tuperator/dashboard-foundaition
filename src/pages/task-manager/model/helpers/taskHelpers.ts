import type {
  ProjectMemberRole,
  SprintItem,
  SprintStatus,
  TaskItem,
  TaskPriorityItem,
} from "../types";

export function getNextBacklogOrder(tasks: TaskItem[], projectId: string) {
  const max = tasks
    .filter((task) => task.projectId === projectId && task.sprintId === null)
    .reduce((current, task) => Math.max(current, task.backlogOrder || 0), 0);
  return max + 1;
}

export function normalizeTasks(
  rawTasks: TaskItem[],
  taskPriorities: TaskPriorityItem[],
): TaskItem[] {
  const backlogCounterByProject: Record<string, number> = {};

  return rawTasks.map((task) => {
    const projectId = task.projectId || "";
    const nextOrder = (backlogCounterByProject[projectId] || 0) + 1;
    backlogCounterByProject[projectId] = nextOrder;

    return {
      ...task,
      status: task.status || "TODO",
      priority: normalizePriority(task.priority, taskPriorities),
      sprintId: typeof task.sprintId === "string" ? task.sprintId : null,
      backlogOrder:
        typeof task.backlogOrder === "number" && task.backlogOrder > 0
          ? task.backlogOrder
          : nextOrder,
      updatedAt: task.updatedAt || new Date().toISOString(),
    };
  });
}

export function normalizeSprints(rawSprints: SprintItem[]): SprintItem[] {
  return rawSprints.map((sprint) => ({
    ...sprint,
    name: sprint.name || "Sprint",
    goal: sprint.goal || "",
    status: normalizeSprintStatus(sprint.status),
    createdAt: sprint.createdAt || new Date().toISOString(),
  }));
}

export function normalizePriority(
  priority: string,
  taskPriorities: TaskPriorityItem[],
): string {
  const code = priority?.trim()?.toUpperCase() || "";
  if (taskPriorities.some((p) => p.code === code)) {
    return code;
  }
  return (
    taskPriorities[Math.floor(taskPriorities.length / 2)]?.code || "MEDIUM"
  );
}

export function normalizeSprintStatus(status: string): SprintStatus {
  if (status === "ACTIVE" || status === "CLOSED" || status === "PLANNED") {
    return status;
  }
  return "PLANNED";
}

export function buildNextMemberRoles(
  owner: string,
  members: string[],
  previousRoles: Record<string, ProjectMemberRole>,
): Record<string, ProjectMemberRole> {
  const nextRoles: Record<string, ProjectMemberRole> = {};

  if (owner) {
    nextRoles[owner] = "OWNER";
  }

  for (const member of members) {
    if (!member) {
      continue;
    }

    if (member === owner) {
      nextRoles[member] = "OWNER";
      continue;
    }

    nextRoles[member] = previousRoles[member] || "MEMBER";
  }

  return nextRoles;
}
