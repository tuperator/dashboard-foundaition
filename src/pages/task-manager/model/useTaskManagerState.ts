import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_WORKFLOW,
  TASK_MANAGER_DEFAULT_STORE,
  TASK_MANAGER_STORAGE_KEY,
} from "./constants";
import type {
  CreateWorkflowPayload,
  CreateWorkflowStatusPayload,
  CreateProjectPayload,
  CreateSprintPayload,
  CreateTaskPayload,
  ProjectMemberRole,
  SprintItem,
  SprintStatus,
  TaskItem,
  TaskManagerStore,
  TaskPriority,
  TaskProject,
  UpdateWorkflowPayload,
  UpdateWorkflowStatusPayload,
  UpdateProjectPayload,
  UpdateSprintPayload,
  UpdateTaskPayload,
  WorkflowIssueType,
  WorkflowStatusCategory,
  WorkflowStatusItem,
  WorkflowTemplate,
  WorkflowTransitionItem,
} from "./types";

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeStore(
  raw: Partial<TaskManagerStore> & {
    workflowByProject?: Record<string, string[]>;
  },
): TaskManagerStore {
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
  const tasks = normalizeTasks(raw.tasks || [])
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
  };
}

function getInitialStore(): TaskManagerStore {
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

  const setSelectedProjectId = (projectId: string) => {
    setStore((previous) => ({
      ...previous,
      selectedProjectId: projectId,
    }));
  };

  const createProject = (payload: CreateProjectPayload) => {
    const nextProject: TaskProject = {
      id: generateId("project"),
      name: payload.name.trim(),
      key: payload.key.trim().toUpperCase(),
      description: payload.description.trim(),
      owner: payload.owner.trim(),
      members: payload.members?.filter(Boolean) || [],
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
          [nextProject.id]: {
            [nextProject.owner]: "OWNER",
            ...Object.fromEntries(
              nextProject.members.map((member) => [member, "MEMBER"]),
            ),
          },
        },
      };
    });
  };

  const updateProject = (projectId: string, payload: UpdateProjectPayload) => {
    setStore((previous) => {
      const nextProjects = previous.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              ...payload,
              name: payload.name.trim(),
              key: payload.key.trim().toUpperCase(),
              description: payload.description.trim(),
              owner: payload.owner.trim(),
              members: payload.members.filter(Boolean),
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
            payload.owner.trim(),
            payload.members.filter(Boolean),
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

  const addMember = (projectId: string, memberName: string) => {
    const trimmed = memberName.trim();
    if (!trimmed) {
      return;
    }

    setStore((previous) => ({
      ...previous,
      projects: previous.projects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        const existed = project.members.some(
          (member) => member.toLowerCase() === trimmed.toLowerCase(),
        );
        if (existed) {
          return project;
        }

        return {
          ...project,
          members: [...project.members, trimmed],
        };
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
              members: project.members.filter(
                (member) => member !== memberName,
              ),
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

  const createTask = (payload: CreateTaskPayload) => {
    setStore((previous) => {
      const normalizedStatus = sanitizeStatusCodeForProject(
        payload.status,
        payload.projectId,
        previous.workflowTemplates,
        previous.workflowIdByProject,
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
                previous.workflowTemplates,
                previous.workflowIdByProject,
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
          ? {
              ...task,
              assignee,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    }));
  };

  const changeTaskStatus = (taskId: string, status: string) => {
    let changed = false;
    setStore((previous) => {
      const task = previous.tasks.find((item) => item.id === taskId);
      if (!task) {
        return previous;
      }

      const workflowTemplate = resolveProjectWorkflow(previous, task.projectId);
      const statusSet = new Set(
        workflowTemplate?.statuses.map((item) => item.code) || DEFAULT_WORKFLOW,
      );
      if (!statusSet.has(status)) {
        return previous;
      }

      if (!isWorkflowTransitionAllowed(workflowTemplate, task.status, status)) {
        return previous;
      }

      changed = true;

      return {
        ...previous,
        tasks: previous.tasks.map((item) =>
          item.id === taskId
            ? {
                ...item,
                status,
                updatedAt: new Date().toISOString(),
              }
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
          ? {
              ...task,
              priority,
              updatedAt: new Date().toISOString(),
            }
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
        .filter(
          (task) => task.projectId === projectId && task.sprintId === null,
        )
        .sort((a, b) => a.backlogOrder - b.backlogOrder);
      const index = backlogTasks.findIndex((task) => task.id === taskId);
      if (index === -1) {
        return previous;
      }

      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= backlogTasks.length) {
        return previous;
      }

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
          if (!nextOrder) {
            return task;
          }

          return {
            ...task,
            backlogOrder: nextOrder,
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    });
  };

  const addIssueToSprint = (taskId: string, sprintId: string) => {
    setStore((previous) => {
      const sprint = previous.sprints.find((item) => item.id === sprintId);
      if (!sprint || sprint.status === "CLOSED") {
        return previous;
      }

      return {
        ...previous,
        tasks: previous.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                sprintId,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      };
    });
  };

  const removeIssueFromSprint = (taskId: string) => {
    setStore((previous) => {
      const task = previous.tasks.find((item) => item.id === taskId);
      if (!task) {
        return previous;
      }

      let nextBacklogOrder = getNextBacklogOrder(
        previous.tasks,
        task.projectId,
      );

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
      if (!target || target.status === "CLOSED") {
        return previous;
      }

      return {
        ...previous,
        sprints: previous.sprints.map((sprint) => {
          if (
            sprint.projectId !== target.projectId ||
            sprint.status === "CLOSED"
          ) {
            return sprint;
          }
          if (sprint.id === sprintId) {
            return { ...sprint, status: "ACTIVE" as SprintStatus };
          }
          if (sprint.status === "ACTIVE") {
            return { ...sprint, status: "PLANNED" as SprintStatus };
          }
          return sprint;
        }),
      };
    });
  };

  const closeSprint = (sprintId: string) => {
    setStore((previous) => {
      const sprint = previous.sprints.find((item) => item.id === sprintId);
      if (!sprint || sprint.status === "CLOSED") {
        return previous;
      }

      let nextBacklogOrder = getNextBacklogOrder(
        previous.tasks,
        sprint.projectId,
      );

      return {
        ...previous,
        sprints: previous.sprints.map((item) =>
          item.id === sprintId
            ? { ...item, status: "CLOSED" as SprintStatus }
            : item,
        ),
        tasks: previous.tasks.map((task) => {
          if (task.sprintId !== sprintId) {
            return task;
          }

          if (task.status === "DONE") {
            return task;
          }

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
      workflowTemplates: previous.workflowTemplates.map((workflowTemplate) =>
        workflowTemplate.id === workflowId
          ? {
              ...workflowTemplate,
              name: payload.name.trim(),
              description: payload.description.trim(),
              issueTypes: payload.issueTypes,
              updatedAt: new Date().toISOString(),
            }
          : workflowTemplate,
      ),
    }));
  };

  const deleteWorkflowTemplate = (workflowId: string) => {
    setStore((previous) => {
      if (previous.workflowTemplates.length <= 1) {
        return previous;
      }

      const nextWorkflowTemplates = previous.workflowTemplates.filter(
        (workflowTemplate) => workflowTemplate.id !== workflowId,
      );
      const fallbackWorkflowId = nextWorkflowTemplates[0]?.id;
      if (!fallbackWorkflowId) {
        return previous;
      }

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
        (workflowTemplate) => workflowTemplate.id === workflowId,
      );
      if (!hasWorkflow) {
        return previous;
      }

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

  const createWorkflowStatus = (
    workflowId: string,
    payload: CreateWorkflowStatusPayload,
  ) => {
    setStore((previous) => {
      const normalizedCode = normalizeStatusCode(payload.code);
      if (!normalizedCode) {
        return previous;
      }

      const nextWorkflowTemplates = previous.workflowTemplates.map(
        (workflowTemplate) => {
          if (workflowTemplate.id !== workflowId) {
            return workflowTemplate;
          }

          if (
            workflowTemplate.statuses.some(
              (statusItem) => statusItem.code === normalizedCode,
            )
          ) {
            return workflowTemplate;
          }

          const nextStatus: WorkflowStatusItem = {
            id: generateId("workflow-status"),
            code: normalizedCode,
            name: payload.name.trim() || normalizedCode,
            color: payload.color,
            category: payload.category,
          };

          return {
            ...workflowTemplate,
            statuses: [...workflowTemplate.statuses, nextStatus],
            updatedAt: new Date().toISOString(),
          };
        },
      );

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
        (workflowTemplate) => workflowTemplate.id === workflowId,
      );
      if (!targetWorkflow) {
        return previous;
      }

      const targetStatus = targetWorkflow.statuses.find(
        (statusItem) => statusItem.id === statusId,
      );
      if (!targetStatus) {
        return previous;
      }

      const nextCode = normalizeStatusCode(payload.code);
      if (!nextCode) {
        return previous;
      }

      const duplicateCode = targetWorkflow.statuses.some(
        (statusItem) =>
          statusItem.id !== statusId && statusItem.code === nextCode,
      );
      if (duplicateCode) {
        return previous;
      }

      const nextWorkflowTemplates = previous.workflowTemplates.map(
        (workflowTemplate) => {
          if (workflowTemplate.id !== workflowId) {
            return workflowTemplate;
          }

          return {
            ...workflowTemplate,
            statuses: workflowTemplate.statuses.map((statusItem) =>
              statusItem.id === statusId
                ? {
                    ...statusItem,
                    code: nextCode,
                    name: payload.name.trim() || nextCode,
                    color: payload.color,
                    category: payload.category,
                  }
                : statusItem,
            ),
            transitions: workflowTemplate.transitions.map((transition) => ({
              ...transition,
              fromStatusCode:
                transition.fromStatusCode === targetStatus.code
                  ? nextCode
                  : transition.fromStatusCode,
              toStatusCode:
                transition.toStatusCode === targetStatus.code
                  ? nextCode
                  : transition.toStatusCode,
            })),
            updatedAt: new Date().toISOString(),
          };
        },
      );

      const nextTasks = previous.tasks.map((task) => {
        if (task.status !== targetStatus.code) {
          return task;
        }
        const assignedWorkflowId = previous.workflowIdByProject[task.projectId];
        if (assignedWorkflowId !== workflowId) {
          return task;
        }
        return {
          ...task,
          status: nextCode,
          updatedAt: new Date().toISOString(),
        };
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
      const workflowTemplate = previous.workflowTemplates.find(
        (item) => item.id === workflowId,
      );
      if (!workflowTemplate || workflowTemplate.statuses.length <= 2) {
        return previous;
      }

      const targetStatus = workflowTemplate.statuses.find(
        (item) => item.id === statusId,
      );
      if (!targetStatus) {
        return previous;
      }

      const fallbackStatusCode = workflowTemplate.statuses.find(
        (item) => item.id !== statusId,
      )?.code;
      if (!fallbackStatusCode) {
        return previous;
      }

      const nextWorkflowTemplates = previous.workflowTemplates.map((item) => {
        if (item.id !== workflowId) {
          return item;
        }
        return {
          ...item,
          statuses: item.statuses.filter(
            (statusItem) => statusItem.id !== statusId,
          ),
          transitions: item.transitions.filter(
            (transition) =>
              transition.fromStatusCode !== targetStatus.code &&
              transition.toStatusCode !== targetStatus.code,
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
          const assignedWorkflowId =
            previous.workflowIdByProject[task.projectId];
          if (
            assignedWorkflowId !== workflowId ||
            task.status !== targetStatus.code
          ) {
            return task;
          }
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
      if (fromStatusCode === toStatusCode) {
        return previous;
      }

      const nextWorkflowTemplates = previous.workflowTemplates.map(
        (workflowTemplate) => {
          if (workflowTemplate.id !== workflowId) {
            return workflowTemplate;
          }

          const statusCodeSet = new Set(
            workflowTemplate.statuses.map((statusItem) => statusItem.code),
          );
          if (
            !statusCodeSet.has(fromStatusCode) ||
            !statusCodeSet.has(toStatusCode)
          ) {
            return workflowTemplate;
          }

          const exists = workflowTemplate.transitions.some(
            (transition) =>
              transition.fromStatusCode === fromStatusCode &&
              transition.toStatusCode === toStatusCode,
          );
          if (exists) {
            return workflowTemplate;
          }

          const nextTransition: WorkflowTransitionItem = {
            id: generateId("workflow-transition"),
            fromStatusCode,
            toStatusCode,
          };

          return {
            ...workflowTemplate,
            transitions: [...workflowTemplate.transitions, nextTransition],
            updatedAt: new Date().toISOString(),
          };
        },
      );

      return {
        ...previous,
        workflowTemplates: nextWorkflowTemplates,
      };
    });
  };

  const deleteWorkflowTransition = (
    workflowId: string,
    transitionId: string,
  ) => {
    setStore((previous) => ({
      ...previous,
      workflowTemplates: previous.workflowTemplates.map((workflowTemplate) =>
        workflowTemplate.id === workflowId
          ? {
              ...workflowTemplate,
              transitions: workflowTemplate.transitions.filter(
                (transition) => transition.id !== transitionId,
              ),
              updatedAt: new Date().toISOString(),
            }
          : workflowTemplate,
      ),
    }));
  };

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
  };
}

function buildNextMemberRoles(
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

function getNextBacklogOrder(tasks: TaskItem[], projectId: string) {
  const max = tasks
    .filter((task) => task.projectId === projectId && task.sprintId === null)
    .reduce((current, task) => Math.max(current, task.backlogOrder || 0), 0);
  return max + 1;
}

function createDefaultWorkflowTemplate(
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

function createDefaultTransitions(
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

function buildLegacyWorkflowTemplates(
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

function normalizeWorkflowTemplates(
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

function normalizeWorkflowMap(
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

function buildWorkflowByProjectMap(
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

function resolveProjectWorkflow(
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

function sanitizeStatusCodeForProject(
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

function sanitizeTaskStatus(
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

function isWorkflowTransitionAllowed(
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

function normalizeStatusCode(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  return value.trim().replaceAll(" ", "_").toUpperCase();
}

function getDefaultStatusColor(code: string) {
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

function getDefaultStatusCategory(code: string): WorkflowStatusCategory {
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

function normalizeStatusCategory(
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

function normalizeTasks(rawTasks: TaskItem[]): TaskItem[] {
  const backlogCounterByProject: Record<string, number> = {};

  return rawTasks.map((task) => {
    const projectId = task.projectId || "";
    const nextOrder = (backlogCounterByProject[projectId] || 0) + 1;
    backlogCounterByProject[projectId] = nextOrder;

    return {
      ...task,
      status: task.status || "TODO",
      priority: normalizePriority(task.priority),
      sprintId: typeof task.sprintId === "string" ? task.sprintId : null,
      backlogOrder:
        typeof task.backlogOrder === "number" && task.backlogOrder > 0
          ? task.backlogOrder
          : nextOrder,
      updatedAt: task.updatedAt || new Date().toISOString(),
    };
  });
}

function normalizeSprints(rawSprints: SprintItem[]): SprintItem[] {
  return rawSprints.map((sprint) => ({
    ...sprint,
    name: sprint.name || "Sprint",
    goal: sprint.goal || "",
    status: normalizeSprintStatus(sprint.status),
    createdAt: sprint.createdAt || new Date().toISOString(),
  }));
}

function normalizePriority(priority: string): TaskPriority {
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    return priority;
  }
  return "MEDIUM";
}

function normalizeSprintStatus(status: string): SprintStatus {
  if (status === "ACTIVE" || status === "CLOSED" || status === "PLANNED") {
    return status;
  }
  return "PLANNED";
}
