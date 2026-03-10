import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_WORKFLOW,
  TASK_MANAGER_STORAGE_KEY,
} from "./constants";
import type {
  CreateWorkflowPayload,
  CreateWorkflowStatusPayload,
  CreateProjectPayload,
  CreateSprintPayload,
  CreateTaskPayload,
  ProjectMemberRole,
  SprintStatus,
  TaskManagerStore,
  TaskPriority,
  UpdateWorkflowPayload,
  UpdateWorkflowStatusPayload,
  UpdateProjectPayload,
  UpdateSprintPayload,
  UpdateTaskPayload,
  CreateTaskPriorityPayload,
  UpdateTaskPriorityPayload,
  WorkflowStatusItem,
  WorkflowTransitionItem,
} from "./types";
import { getInitialStore } from "./helpers/storeHelpers";
import { buildNextMemberRoles, getNextBacklogOrder } from "./helpers/taskHelpers";
import {
  buildWorkflowByProjectMap,
  createDefaultWorkflowTemplate,
  isWorkflowTransitionAllowed,
  normalizeStatusCode,
  resolveProjectWorkflow,
  sanitizeTaskStatus,
} from "./helpers/workflowHelpers";
import { generateId } from "./helpers/workflowHelpers";

export function useTaskManagerState() {
  const [store, setStore] = useState<TaskManagerStore>(getInitialStore);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      TASK_MANAGER_STORAGE_KEY,
      JSON.stringify(store),
    );
  }, [store]);

  // ─── Derived state ───────────────────────────────────────────────────────────

  const selectedProject = useMemo(
    () =>
      store.projects.find(
        (project) => project.id === store.selectedProjectId,
      ) || null,
    [store.projects, store.selectedProjectId],
  );

  const selectedProjectId = selectedProject?.id || null;

  const projectTasks = useMemo(
    () =>
      selectedProjectId
        ? store.tasks.filter((task) => task.projectId === selectedProjectId)
        : store.tasks,
    [selectedProjectId, store.tasks],
  );

  const members = useMemo(
    () => selectedProject?.members || [],
    [selectedProject],
  );

  const selectedWorkflowTemplate = useMemo(() => {
    if (!selectedProjectId) {
      return store.workflowTemplates[0] || null;
    }
    return resolveProjectWorkflow(store, selectedProjectId);
  }, [selectedProjectId, store]);

  const workflow = useMemo(() => {
    if (!selectedWorkflowTemplate) {
      return DEFAULT_WORKFLOW;
    }
    return selectedWorkflowTemplate.statuses.map((status) => status.code);
  }, [selectedWorkflowTemplate]);

  // ─── Project actions ─────────────────────────────────────────────────────────

  const setSelectedProjectId = (projectId: string) => {
    setStore((previous) => ({
      ...previous,
      selectedProjectId: projectId,
    }));
  };

  const createProject = (payload: CreateProjectPayload) => {
    const owner = payload.owner.trim();
    const members = (payload.members?.filter(Boolean) || []).filter(
      (member) => member !== owner,
    );
    const nextProject = {
      id: generateId("project"),
      name: payload.name.trim(),
      key: payload.key.trim().toUpperCase(),
      description: payload.description.trim(),
      owner,
      members,
      type: payload.type,
    };

    setStore((previous) => {
      const fallbackWorkflow =
        previous.workflowTemplates[0] ||
        createDefaultWorkflowTemplate(generateId("workflow"), DEFAULT_WORKFLOW);
      const workflowTemplates =
        previous.workflowTemplates.length > 0
          ? previous.workflowTemplates
          : [fallbackWorkflow];
      const workflowIdByProject = {
        ...previous.workflowIdByProject,
        [nextProject.id]: fallbackWorkflow.id,
      };

      return {
        ...previous,
        workflowTemplates,
        projects: [nextProject, ...previous.projects],
        selectedProjectId: nextProject.id,
        workflowIdByProject,
        workflowByProject: buildWorkflowByProjectMap(
          [nextProject, ...previous.projects],
          workflowTemplates,
          workflowIdByProject,
        ),
        memberRolesByProject: {
          ...previous.memberRolesByProject,
          [nextProject.id]: buildNextMemberRoles(
            nextProject.owner,
            nextProject.members,
            {},
          ),
        },
      };
    });
  };

  const updateProject = (projectId: string, payload: UpdateProjectPayload) => {
    setStore((previous) => {
      const owner = payload.owner.trim();
      const members = payload.members
        .filter(Boolean)
        .filter((member) => member !== owner);
      const nextProjects = previous.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              ...payload,
              name: payload.name.trim(),
              key: payload.key.trim().toUpperCase(),
              description: payload.description.trim(),
              owner,
              members,
            }
          : project,
      );
      const isScrum = payload.type === "SCRUM";
      const nextSprints = isScrum
        ? previous.sprints
        : previous.sprints.filter((sprint) => sprint.projectId !== projectId);
      const nextTasks = isScrum
        ? previous.tasks
        : previous.tasks.map((task) =>
            task.projectId === projectId
              ? { ...task, sprintId: null, updatedAt: new Date().toISOString() }
              : task,
          );

      return {
        ...previous,
        projects: nextProjects,
        tasks: nextTasks,
        sprints: nextSprints,
        memberRolesByProject: {
          ...previous.memberRolesByProject,
          [projectId]: buildNextMemberRoles(
            owner,
            members,
            previous.memberRolesByProject[projectId] || {},
          ),
        },
      };
    });
  };

  const deleteProject = (projectId: string) => {
    setStore((previous) => {
      const nextProjects = previous.projects.filter(
        (project) => project.id !== projectId,
      );
      const nextWorkflowIdByProject = { ...previous.workflowIdByProject };
      const nextMemberRolesByProject = { ...previous.memberRolesByProject };
      delete nextWorkflowIdByProject[projectId];
      delete nextMemberRolesByProject[projectId];
      const nextSelectedProjectId =
        previous.selectedProjectId === projectId
          ? nextProjects[0]?.id || null
          : previous.selectedProjectId;

      return {
        ...previous,
        projects: nextProjects,
        tasks: previous.tasks.filter((task) => task.projectId !== projectId),
        sprints: previous.sprints.filter(
          (sprint) => sprint.projectId !== projectId,
        ),
        workflowIdByProject: nextWorkflowIdByProject,
        workflowByProject: buildWorkflowByProjectMap(
          nextProjects,
          previous.workflowTemplates,
          nextWorkflowIdByProject,
        ),
        memberRolesByProject: nextMemberRolesByProject,
        selectedProjectId: nextSelectedProjectId,
      };
    });
  };

  // ─── Member actions ──────────────────────────────────────────────────────────

  const addMember = (projectId: string, memberName: string) => {
    const trimmed = memberName.trim();
    if (!trimmed) return;
    setStore((previous) => ({
      ...previous,
      projects: previous.projects.map((project) => {
        if (project.id !== projectId) return project;
        const existed = project.members.some(
          (member) => member.toLowerCase() === trimmed.toLowerCase(),
        );
        if (existed) return project;
        return { ...project, members: [...project.members, trimmed] };
      }),
      memberRolesByProject: {
        ...previous.memberRolesByProject,
        [projectId]: {
          ...(previous.memberRolesByProject[projectId] || {}),
          [trimmed]: "MEMBER",
        },
      },
    }));
  };

  const removeMember = (projectId: string, memberName: string) => {
    setStore((previous) => ({
      ...previous,
      projects: previous.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              members: project.members.filter((member) => member !== memberName),
            }
          : project,
      ),
      tasks: previous.tasks.map((task) =>
        task.projectId === projectId && task.assignee === memberName
          ? { ...task, assignee: null, updatedAt: new Date().toISOString() }
          : task,
      ),
      memberRolesByProject: {
        ...previous.memberRolesByProject,
        [projectId]: Object.fromEntries(
          Object.entries(previous.memberRolesByProject[projectId] || {}).filter(
            ([member]) => member !== memberName,
          ),
        ),
      },
    }));
  };

  const updateMemberRole = (
    projectId: string,
    memberName: string,
    role: ProjectMemberRole,
  ) => {
    setStore((previous) => ({
      ...previous,
      memberRolesByProject: {
        ...previous.memberRolesByProject,
        [projectId]: {
          ...(previous.memberRolesByProject[projectId] || {}),
          [memberName]: role,
        },
      },
    }));
  };

  // ─── Task actions ─────────────────────────────────────────────────────────────

  const createTask = (payload: CreateTaskPayload) => {
    setStore((previous) => {
      const normalizedStatus = sanitizeStatusCodeForProject(
        payload.status,
        payload.projectId,
        previous,
      );
      return {
        ...previous,
        tasks: [
          {
            id: generateId("task"),
            ...payload,
            status: normalizedStatus,
            title: payload.title.trim(),
            description: payload.description.trim(),
            sprintId: payload.sprintId ?? null,
            backlogOrder:
              payload.backlogOrder ||
              getNextBacklogOrder(previous.tasks, payload.projectId),
            updatedAt: new Date().toISOString(),
          },
          ...previous.tasks,
        ],
      };
    });
  };

  const updateTask = (taskId: string, payload: UpdateTaskPayload) => {
    setStore((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...payload,
              status: sanitizeStatusCodeForProject(
                payload.status,
                payload.projectId,
                previous,
              ),
              title: payload.title.trim(),
              description: payload.description.trim(),
              sprintId: payload.sprintId ?? null,
              backlogOrder:
                payload.backlogOrder ||
                (payload.sprintId
                  ? task.backlogOrder
                  : getNextBacklogOrder(previous.tasks, payload.projectId)),
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    }));
  };

  const deleteTask = (taskId: string) => {
    setStore((previous) => ({
      ...previous,
      tasks: previous.tasks.filter((task) => task.id !== taskId),
    }));
  };

  const assignTask = (taskId: string, assignee: string | null) => {
    setStore((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) =>
        task.id === taskId
          ? { ...task, assignee, updatedAt: new Date().toISOString() }
          : task,
      ),
    }));
  };

  const changeTaskStatus = (taskId: string, status: string) => {
    let changed = false;
    setStore((previous) => {
      const task = previous.tasks.find((item) => item.id === taskId);
      if (!task) return previous;

      const workflowTemplate = resolveProjectWorkflow(previous, task.projectId);
      const statusSet = new Set(
        workflowTemplate?.statuses.map((item) => item.code) || DEFAULT_WORKFLOW,
      );
      if (!statusSet.has(status)) return previous;
      if (!isWorkflowTransitionAllowed(workflowTemplate, task.status, status))
        return previous;

      changed = true;
      return {
        ...previous,
        tasks: previous.tasks.map((item) =>
          item.id === taskId
            ? { ...item, status, updatedAt: new Date().toISOString() }
            : item,
        ),
      };
    });
    return changed;
  };

  const changeTaskPriority = (taskId: string, priority: TaskPriority) => {
    setStore((previous) => ({
      ...previous,
      tasks: previous.tasks.map((task) =>
        task.id === taskId
          ? { ...task, priority, updatedAt: new Date().toISOString() }
          : task,
      ),
    }));
  };

  const moveBacklogTask = (
    projectId: string,
    taskId: string,
    direction: "up" | "down",
  ) => {
    setStore((previous) => {
      const backlogTasks = previous.tasks
        .filter((task) => task.projectId === projectId && task.sprintId === null)
        .sort((a, b) => a.backlogOrder - b.backlogOrder);
      const index = backlogTasks.findIndex((task) => task.id === taskId);
      if (index === -1) return previous;

      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= backlogTasks.length) return previous;

      const reordered = [...backlogTasks];
      [reordered[index], reordered[swapIndex]] = [
        reordered[swapIndex],
        reordered[index],
      ];

      const orderMap = new Map<string, number>();
      reordered.forEach((task, orderIndex) => {
        orderMap.set(task.id, orderIndex + 1);
      });

      return {
        ...previous,
        tasks: previous.tasks.map((task) => {
          const nextOrder = orderMap.get(task.id);
          if (!nextOrder) return task;
          return { ...task, backlogOrder: nextOrder, updatedAt: new Date().toISOString() };
        }),
      };
    });
  };

  // ─── Sprint actions ───────────────────────────────────────────────────────────

  const addIssueToSprint = (taskId: string, sprintId: string) => {
    setStore((previous) => {
      const sprint = previous.sprints.find((item) => item.id === sprintId);
      if (!sprint || sprint.status === "CLOSED") return previous;
      return {
        ...previous,
        tasks: previous.tasks.map((task) =>
          task.id === taskId
            ? { ...task, sprintId, updatedAt: new Date().toISOString() }
            : task,
        ),
      };
    });
  };

  const removeIssueFromSprint = (taskId: string) => {
    setStore((previous) => {
      const task = previous.tasks.find((item) => item.id === taskId);
      if (!task) return previous;
      let nextBacklogOrder = getNextBacklogOrder(previous.tasks, task.projectId);
      return {
        ...previous,
        tasks: previous.tasks.map((item) =>
          item.id === taskId
            ? {
                ...item,
                sprintId: null,
                backlogOrder: nextBacklogOrder++,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      };
    });
  };

  const createSprint = (payload: CreateSprintPayload) => {
    setStore((previous) => ({
      ...previous,
      sprints: [
        {
          id: generateId("sprint"),
          projectId: payload.projectId,
          name: payload.name.trim(),
          goal: payload.goal.trim(),
          startDate: payload.startDate,
          endDate: payload.endDate,
          status: "PLANNED",
          createdAt: new Date().toISOString(),
        },
        ...previous.sprints,
      ],
    }));
  };

  const updateSprint = (sprintId: string, payload: UpdateSprintPayload) => {
    setStore((previous) => ({
      ...previous,
      sprints: previous.sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              name: payload.name.trim(),
              goal: payload.goal.trim(),
              startDate: payload.startDate,
              endDate: payload.endDate,
            }
          : sprint,
      ),
    }));
  };

  const startSprint = (sprintId: string) => {
    setStore((previous) => {
      const target = previous.sprints.find((sprint) => sprint.id === sprintId);
      if (!target || target.status === "CLOSED") return previous;
      return {
        ...previous,
        sprints: previous.sprints.map((sprint) => {
          if (sprint.projectId !== target.projectId || sprint.status === "CLOSED")
            return sprint;
          if (sprint.id === sprintId)
            return { ...sprint, status: "ACTIVE" as SprintStatus };
          if (sprint.status === "ACTIVE")
            return { ...sprint, status: "PLANNED" as SprintStatus };
          return sprint;
        }),
      };
    });
  };

  const closeSprint = (sprintId: string) => {
    setStore((previous) => {
      const sprint = previous.sprints.find((item) => item.id === sprintId);
      if (!sprint || sprint.status === "CLOSED") return previous;
      let nextBacklogOrder = getNextBacklogOrder(previous.tasks, sprint.projectId);
      return {
        ...previous,
        sprints: previous.sprints.map((item) =>
          item.id === sprintId
            ? { ...item, status: "CLOSED" as SprintStatus }
            : item,
        ),
        tasks: previous.tasks.map((task) => {
          if (task.sprintId !== sprintId || task.status === "DONE") return task;
          return {
            ...task,
            sprintId: null,
            backlogOrder: nextBacklogOrder++,
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    });
  };

  // ─── Workflow template actions ────────────────────────────────────────────────

  const createWorkflowTemplate = (payload: CreateWorkflowPayload) => {
    setStore((previous) => {
      const workflowId = generateId("workflow");
      const nextWorkflow = createDefaultWorkflowTemplate(
        workflowId,
        DEFAULT_WORKFLOW,
        {
          name: payload.name,
          description: payload.description,
          issueTypes: payload.issueTypes,
        },
      );
      return {
        ...previous,
        workflowTemplates: [nextWorkflow, ...previous.workflowTemplates],
      };
    });
  };

  const updateWorkflowTemplate = (
    workflowId: string,
    payload: UpdateWorkflowPayload,
  ) => {
    setStore((previous) => ({
      ...previous,
      workflowTemplates: previous.workflowTemplates.map((wt) =>
        wt.id === workflowId
          ? {
              ...wt,
              name: payload.name.trim(),
              description: payload.description.trim(),
              issueTypes: payload.issueTypes,
              updatedAt: new Date().toISOString(),
            }
          : wt,
      ),
    }));
  };

  const deleteWorkflowTemplate = (workflowId: string) => {
    setStore((previous) => {
      if (previous.workflowTemplates.length <= 1) return previous;
      const nextWorkflowTemplates = previous.workflowTemplates.filter(
        (wt) => wt.id !== workflowId,
      );
      const fallbackWorkflowId = nextWorkflowTemplates[0]?.id;
      if (!fallbackWorkflowId) return previous;

      const nextWorkflowIdByProject = Object.fromEntries(
        previous.projects.map((project) => [
          project.id,
          previous.workflowIdByProject[project.id] === workflowId
            ? fallbackWorkflowId
            : previous.workflowIdByProject[project.id] || fallbackWorkflowId,
        ]),
      );

      return {
        ...previous,
        workflowTemplates: nextWorkflowTemplates,
        workflowIdByProject: nextWorkflowIdByProject,
        workflowByProject: buildWorkflowByProjectMap(
          previous.projects,
          nextWorkflowTemplates,
          nextWorkflowIdByProject,
        ),
        tasks: previous.tasks.map((task) =>
          sanitizeTaskStatus(
            task,
            task.projectId,
            nextWorkflowTemplates,
            nextWorkflowIdByProject,
          ),
        ),
      };
    });
  };

  const assignWorkflowToProjects = (
    workflowId: string,
    projectIds: string[],
  ) => {
    const projectIdSet = new Set(projectIds);
    setStore((previous) => {
      const hasWorkflow = previous.workflowTemplates.some(
        (wt) => wt.id === workflowId,
      );
      if (!hasWorkflow) return previous;

      const nextWorkflowIdByProject = { ...previous.workflowIdByProject };
      previous.projects.forEach((project) => {
        if (projectIdSet.has(project.id)) {
          nextWorkflowIdByProject[project.id] = workflowId;
        }
      });

      return {
        ...previous,
        workflowIdByProject: nextWorkflowIdByProject,
        workflowByProject: buildWorkflowByProjectMap(
          previous.projects,
          previous.workflowTemplates,
          nextWorkflowIdByProject,
        ),
        tasks: previous.tasks.map((task) =>
          sanitizeTaskStatus(
            task,
            task.projectId,
            previous.workflowTemplates,
            nextWorkflowIdByProject,
          ),
        ),
      };
    });
  };

  // ─── Workflow status actions ──────────────────────────────────────────────────

  const createWorkflowStatus = (
    workflowId: string,
    payload: CreateWorkflowStatusPayload,
  ) => {
    setStore((previous) => {
      const normalizedCode = normalizeStatusCode(payload.code);
      if (!normalizedCode) return previous;

      const nextWorkflowTemplates = previous.workflowTemplates.map((wt) => {
        if (wt.id !== workflowId) return wt;
        if (wt.statuses.some((s) => s.code === normalizedCode)) return wt;
        const nextStatus: WorkflowStatusItem = {
          id: generateId("workflow-status"),
          code: normalizedCode,
          name: payload.name.trim() || normalizedCode,
          color: payload.color,
          category: payload.category,
        };
        return {
          ...wt,
          statuses: [...wt.statuses, nextStatus],
          updatedAt: new Date().toISOString(),
        };
      });

      return {
        ...previous,
        workflowTemplates: nextWorkflowTemplates,
        workflowByProject: buildWorkflowByProjectMap(
          previous.projects,
          nextWorkflowTemplates,
          previous.workflowIdByProject,
        ),
      };
    });
  };

  const updateWorkflowStatus = (
    workflowId: string,
    statusId: string,
    payload: UpdateWorkflowStatusPayload,
  ) => {
    setStore((previous) => {
      const targetWorkflow = previous.workflowTemplates.find(
        (wt) => wt.id === workflowId,
      );
      if (!targetWorkflow) return previous;

      const targetStatus = targetWorkflow.statuses.find(
        (s) => s.id === statusId,
      );
      if (!targetStatus) return previous;

      const nextCode = normalizeStatusCode(payload.code);
      if (!nextCode) return previous;

      const duplicateCode = targetWorkflow.statuses.some(
        (s) => s.id !== statusId && s.code === nextCode,
      );
      if (duplicateCode) return previous;

      const nextWorkflowTemplates = previous.workflowTemplates.map((wt) => {
        if (wt.id !== workflowId) return wt;
        return {
          ...wt,
          statuses: wt.statuses.map((s) =>
            s.id === statusId
              ? {
                  ...s,
                  code: nextCode,
                  name: payload.name.trim() || nextCode,
                  color: payload.color,
                  category: payload.category,
                }
              : s,
          ),
          transitions: wt.transitions.map((t) => ({
            ...t,
            fromStatusCode:
              t.fromStatusCode === targetStatus.code ? nextCode : t.fromStatusCode,
            toStatusCode:
              t.toStatusCode === targetStatus.code ? nextCode : t.toStatusCode,
          })),
          updatedAt: new Date().toISOString(),
        };
      });

      const nextTasks = previous.tasks.map((task) => {
        if (task.status !== targetStatus.code) return task;
        if (previous.workflowIdByProject[task.projectId] !== workflowId)
          return task;
        return { ...task, status: nextCode, updatedAt: new Date().toISOString() };
      });

      return {
        ...previous,
        workflowTemplates: nextWorkflowTemplates,
        tasks: nextTasks,
        workflowByProject: buildWorkflowByProjectMap(
          previous.projects,
          nextWorkflowTemplates,
          previous.workflowIdByProject,
        ),
      };
    });
  };

  const deleteWorkflowStatus = (workflowId: string, statusId: string) => {
    setStore((previous) => {
      const wt = previous.workflowTemplates.find((w) => w.id === workflowId);
      if (!wt || wt.statuses.length <= 2) return previous;

      const targetStatus = wt.statuses.find((s) => s.id === statusId);
      if (!targetStatus) return previous;

      const fallbackStatusCode = wt.statuses.find(
        (s) => s.id !== statusId,
      )?.code;
      if (!fallbackStatusCode) return previous;

      const nextWorkflowTemplates = previous.workflowTemplates.map((item) => {
        if (item.id !== workflowId) return item;
        return {
          ...item,
          statuses: item.statuses.filter((s) => s.id !== statusId),
          transitions: item.transitions.filter(
            (t) =>
              t.fromStatusCode !== targetStatus.code &&
              t.toStatusCode !== targetStatus.code,
          ),
          updatedAt: new Date().toISOString(),
        };
      });

      return {
        ...previous,
        workflowTemplates: nextWorkflowTemplates,
        workflowByProject: buildWorkflowByProjectMap(
          previous.projects,
          nextWorkflowTemplates,
          previous.workflowIdByProject,
        ),
        tasks: previous.tasks.map((task) => {
          if (
            previous.workflowIdByProject[task.projectId] !== workflowId ||
            task.status !== targetStatus.code
          )
            return task;
          return {
            ...task,
            status: fallbackStatusCode,
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    });
  };

  const createWorkflowTransition = (
    workflowId: string,
    fromStatusCode: string,
    toStatusCode: string,
  ) => {
    setStore((previous) => {
      if (fromStatusCode === toStatusCode) return previous;

      const nextWorkflowTemplates = previous.workflowTemplates.map((wt) => {
        if (wt.id !== workflowId) return wt;
        const statusCodeSet = new Set(wt.statuses.map((s) => s.code));
        if (!statusCodeSet.has(fromStatusCode) || !statusCodeSet.has(toStatusCode))
          return wt;
        const exists = wt.transitions.some(
          (t) =>
            t.fromStatusCode === fromStatusCode &&
            t.toStatusCode === toStatusCode,
        );
        if (exists) return wt;
        const nextTransition: WorkflowTransitionItem = {
          id: generateId("workflow-transition"),
          fromStatusCode,
          toStatusCode,
        };
        return {
          ...wt,
          transitions: [...wt.transitions, nextTransition],
          updatedAt: new Date().toISOString(),
        };
      });

      return { ...previous, workflowTemplates: nextWorkflowTemplates };
    });
  };

  const deleteWorkflowTransition = (
    workflowId: string,
    transitionId: string,
  ) => {
    setStore((previous) => ({
      ...previous,
      workflowTemplates: previous.workflowTemplates.map((wt) =>
        wt.id === workflowId
          ? {
              ...wt,
              transitions: wt.transitions.filter((t) => t.id !== transitionId),
              updatedAt: new Date().toISOString(),
            }
          : wt,
      ),
    }));
  };

  // ─── Priority actions ─────────────────────────────────────────────────────────

  const createTaskPriority = (payload: CreateTaskPriorityPayload) => {
    setStore((previous) => ({
      ...previous,
      taskPriorities: [
        ...previous.taskPriorities,
        { id: generateId("priority"), ...payload },
      ].sort((a, b) => a.order - b.order),
    }));
  };

  const updateTaskPriority = (
    priorityId: string,
    payload: UpdateTaskPriorityPayload,
  ) => {
    setStore((previous) => {
      const oldPriority = previous.taskPriorities.find(
        (p) => p.id === priorityId,
      );
      if (!oldPriority) return previous;

      const nextPriorities = previous.taskPriorities
        .map((p) =>
          p.id === priorityId ? { ...p, ...payload, id: priorityId } : p,
        )
        .sort((a, b) => a.order - b.order);

      const nextTasks = previous.tasks.map((task) =>
        task.priority === oldPriority.code
          ? {
              ...task,
              priority: payload.code,
              updatedAt: new Date().toISOString(),
            }
          : task,
      );

      return {
        ...previous,
        taskPriorities: nextPriorities,
        tasks: nextTasks,
      };
    });
  };

  const deleteTaskPriority = (priorityId: string) => {
    setStore((previous) => {
      if (previous.taskPriorities.length <= 1) return previous;
      const priorityToDelete = previous.taskPriorities.find(
        (p) => p.id === priorityId,
      );
      if (!priorityToDelete) return previous;

      const nextPriorities = previous.taskPriorities.filter(
        (p) => p.id !== priorityId,
      );
      const fallbackPriority =
        nextPriorities.find((p) => p.code === "MEDIUM") || nextPriorities[0];

      const nextTasks = previous.tasks.map((task) =>
        task.priority === priorityToDelete.code
          ? {
              ...task,
              priority: fallbackPriority.code,
              updatedAt: new Date().toISOString(),
            }
          : task,
      );

      return {
        ...previous,
        taskPriorities: nextPriorities,
        tasks: nextTasks,
      };
    });
  };

  // ─── Return ───────────────────────────────────────────────────────────────────

  return {
    projects: store.projects,
    tasks: store.tasks,
    sprints: store.sprints,
    selectedProjectId,
    selectedProject,
    selectedWorkflowTemplate,
    projectTasks,
    members,
    workflow,
    workflowTemplates: store.workflowTemplates,
    workflowIdByProject: store.workflowIdByProject,
    workflowByProject: store.workflowByProject,
    memberRolesByProject: store.memberRolesByProject,
    taskPriorities: store.taskPriorities,
    setSelectedProjectId,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    updateMemberRole,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    changeTaskStatus,
    changeTaskPriority,
    moveBacklogTask,
    addIssueToSprint,
    removeIssueFromSprint,
    createSprint,
    updateSprint,
    startSprint,
    closeSprint,
    createWorkflowTemplate,
    updateWorkflowTemplate,
    deleteWorkflowTemplate,
    assignWorkflowToProjects,
    createWorkflowStatus,
    updateWorkflowStatus,
    deleteWorkflowStatus,
    createWorkflowTransition,
    deleteWorkflowTransition,
    createTaskPriority,
    updateTaskPriority,
    deleteTaskPriority,
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────
// These are thin wrappers used inside actions to avoid verbose imports

function sanitizeStatusCodeForProject(
  status: string,
  projectId: string,
  store: Pick<TaskManagerStore, "workflowTemplates" | "workflowIdByProject">,
) {
  const { workflowTemplates, workflowIdByProject } = store;
  const normalizedStatus = normalizeStatusCode(status);
  const workflowTemplate = resolveProjectWorkflow(
    { workflowTemplates, workflowIdByProject } as TaskManagerStore,
    projectId,
  );
  const fallbackStatus =
    workflowTemplate?.statuses[0]?.code || DEFAULT_WORKFLOW[0];
  if (!normalizedStatus) return fallbackStatus;
  const allowed = new Set(
    workflowTemplate?.statuses.map((s) => s.code) || DEFAULT_WORKFLOW,
  );
  return allowed.has(normalizedStatus) ? normalizedStatus : fallbackStatus;
}
