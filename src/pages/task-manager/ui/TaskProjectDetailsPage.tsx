import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/widgets/app-shell";
import { appRoutes } from "@/shared/constants/routes";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Spinner } from "@/shared/ui/spinner";
import { useTaskManagerState } from "../model/useTaskManagerState";
import { useTaskManagerUsers } from "../model/useTaskManagerUsers";
import {
  buildTaskUserOptionsByIds,
  getTaskProjectParticipantIds,
} from "../model/helpers/userHelpers";
import {
  createTask as createTaskApi,
  getProjectDetail,
  listTasks,
  updateTask as updateTaskApi,
  type TaskProjectDetail,
} from "../model/projectManagement.api";
import { getWorkflowDetail } from "../model/workflowManagement.api";
import {
  type SprintItem,
  type TaskManagerUserOption,
  type TaskItem,
  type TaskPriority,
} from "../model/types";
import ProjectDialog from "./components/ProjectDialog";
import { ProjectSettingsDialog } from "./components/ProjectSettingsDialog";
import { SprintDialog } from "./components/SprintDialog";
import { TaskDialog } from "./components/TaskDialog";
import { TaskProjectDetailsHeader } from "./components/project-details/TaskProjectDetailsHeader";
import { TaskProjectDetailsNotFound } from "./components/project-details/TaskProjectDetailsNotFound";
import { TaskProjectDetailsIssuesTab } from "./components/project-details/TaskProjectDetailsIssuesTab";
import { TaskProjectDetailsBacklogTab } from "./components/project-details/TaskProjectDetailsBacklogTab";
import { TaskProjectDetailsSprintsTab } from "./components/project-details/TaskProjectDetailsSprintsTab";
import { TaskProjectDetailsOverviewTab } from "./components/project-details/TaskProjectDetailsOverviewTab";
import { TaskPriorityManagerDialog } from "./components/project-details/TaskPriorityManagerDialog";

type ProjectDetailsActions = Pick<
  ReturnType<typeof useTaskManagerState>,
  | "taskPriorities"
  | "updateProject"
  | "deleteProject"
  | "addMember"
  | "removeMember"
  | "updateMemberRole"
  | "memberRolesByProject"
  | "deleteTask"
  | "assignTask"
  | "changeTaskStatus"
  | "changeTaskPriority"
  | "moveBacklogTask"
  | "addIssueToSprint"
  | "removeIssueFromSprint"
  | "createSprint"
  | "updateSprint"
  | "startSprint"
  | "closeSprint"
  | "createTaskPriority"
  | "updateTaskPriority"
  | "deleteTaskPriority"
>;

const TASK_PROJECT_TASKS_QUERY_KEY = "task-project-tasks";

export function TaskProjectDetailsPage() {
  const navigate = useNavigate();
  const { projectId = "" } = useParams<{ projectId: string }>();
  const { t } = useI18n();
  const actions = useTaskManagerState();
  const { userOptions, userOptionById, resolveUserLabel } =
    useTaskManagerUsers();
  const projectQuery = useQuery({
    queryKey: ["task-project-detail", projectId],
    queryFn: () => getProjectDetail(projectId),
    enabled: Boolean(projectId),
  });

  if (projectQuery.isLoading) {
    return (
      <AppShell>
        <section className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 rounded-2xl border border-dashed text-sm">
          <Spinner className="size-4" />
          {t("tasks.projects.table.loading")}
        </section>
      </AppShell>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <TaskProjectDetailsNotFound
        onBack={() => navigate(appRoutes.tasksProjects)}
      />
    );
  }

  return (
    <ProjectDetailsContent
      key={projectQuery.data.id}
      project={projectQuery.data}
      actions={actions}
      userOptions={userOptions}
      userOptionById={userOptionById}
      resolveUserLabel={resolveUserLabel}
      onBack={() => navigate(appRoutes.tasksProjects)}
    />
  );
}

function ProjectDetailsContent({
  project,
  actions,
  userOptions,
  userOptionById,
  resolveUserLabel,
  onBack,
}: {
  project: TaskProjectDetail;
  actions: ProjectDetailsActions;
  userOptions: TaskManagerUserOption[];
  userOptionById: Map<string, TaskManagerUserOption>;
  resolveUserLabel: (value: string | null | undefined) => string;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const { t, tp } = useI18n();
  const appToast = useAppToast();
  const queryClient = useQueryClient();
  const workflowDetailQuery = useQuery({
    queryKey: ["task-project-workflow-detail", project.workflowId],
    queryFn: () => getWorkflowDetail(project.workflowId as string),
    enabled: Boolean(project.workflowId),
  });
  const workflowTemplate = workflowDetailQuery.data || null;
  const workflow = useMemo(
    () =>
      workflowTemplate?.statuses.map((status) => status.code) || [],
    [workflowTemplate],
  );
  const workflowStatusByCode = useMemo(
    () =>
      new Map(
        (workflowTemplate?.statuses || []).map((status) => [
          status.code,
          status,
        ]),
      ),
    [workflowTemplate],
  );
  const taskPriorities = actions.taskPriorities;
  const projectTasksQuery = useQuery({
    queryKey: [TASK_PROJECT_TASKS_QUERY_KEY, project.id],
    queryFn: () =>
      listTasks({
        projectId: project.id,
        page: 1,
        size: 200,
        sortBy: "UPDATED_AT",
        sortDirection: "DESC",
      }),
  });
  const createTaskMutation = useMutation({
    mutationFn: createTaskApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [TASK_PROJECT_TASKS_QUERY_KEY, project.id],
      });
    },
  });
  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: Parameters<typeof updateTaskApi>[1];
    }) => updateTaskApi(taskId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [TASK_PROJECT_TASKS_QUERY_KEY, project.id],
      });
    },
  });
  const taskPriorityByCode = useMemo(
    () => new Map(taskPriorities.map((p) => [p.code, p])),
    [taskPriorities],
  );
  const participantIds = useMemo(
    () => getTaskProjectParticipantIds(project),
    [project],
  );
  const participantOptions = useMemo(
    () => buildTaskUserOptionsByIds(participantIds, userOptionById),
    [participantIds, userOptionById],
  );
  const projectTasks = useMemo<TaskItem[]>(
    () => projectTasksQuery.data?.items || [],
    [projectTasksQuery.data],
  );
  const projectSprints = useMemo<SprintItem[]>(() => [], []);

  const [activeTab, setActiveTab] = useState("issues");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "edit">(
    "create",
  );
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<SprintItem | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | TaskPriority>(
    "ALL",
  );
  const [sortBy, setSortBy] = useState<"LATEST" | "PRIORITY" | "BACKLOG_ORDER">(
    "LATEST",
  );
  const [issueViewMode, setIssueViewMode] = useState<"LIST" | "KANBAN">("LIST");
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [priorityManagerOpen, setPriorityManagerOpen] = useState(false);
  const [backlogSprintTarget, setBacklogSprintTarget] = useState<
    Record<string, string>
  >({});

  const progress = useMemo(() => {
    const total = projectTasks.length;
    const done = projectTasks.filter((task) => task.status === "DONE").length;
    const inProgress = projectTasks.filter(
      (task) => task.status === "IN_PROGRESS",
    ).length;
    const completion = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, inProgress, completion };
  }, [projectTasks]);

  const filteredTasks = useMemo(() => {
    let nextTasks = [...projectTasks];

    if (statusFilter !== "ALL") {
      nextTasks = nextTasks.filter((task) => task.status === statusFilter);
    }
    if (assigneeFilter !== "ALL") {
      nextTasks = nextTasks.filter(
        (task) => (task.assignee || "__UNASSIGNED__") === assigneeFilter,
      );
    }
    if (priorityFilter !== "ALL") {
      nextTasks = nextTasks.filter((task) => task.priority === priorityFilter);
    }
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      nextTasks = nextTasks.filter((task) =>
        `${task.title} ${task.description} ${resolveUserLabel(task.assignee)}`
          .toLowerCase()
          .includes(keyword),
      );
    }

    if (sortBy === "BACKLOG_ORDER") {
      nextTasks.sort((a, b) => a.backlogOrder - b.backlogOrder);
      return nextTasks;
    }

    if (sortBy === "PRIORITY") {
      nextTasks.sort((a, b) => {
        const orderA = taskPriorityByCode.get(a.priority)?.order || 0;
        const orderB = taskPriorityByCode.get(b.priority)?.order || 0;
        return orderB - orderA;
      });
      return nextTasks;
    }

    nextTasks.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    return nextTasks;
  }, [
    assigneeFilter,
    priorityFilter,
    projectTasks,
    search,
    sortBy,
    statusFilter,
    taskPriorityByCode,
    resolveUserLabel,
  ]);

  const backlogTasks = useMemo(
    () =>
      filteredTasks
        .filter((task) => task.sprintId === null)
        .sort((a, b) => a.backlogOrder - b.backlogOrder),
    [filteredTasks],
  );

  const activeSprint = useMemo(
    () => projectSprints.find((sprint) => sprint.status === "ACTIVE") || null,
    [projectSprints],
  );

  const availableSprintTargets = useMemo(
    () => projectSprints.filter((sprint) => sprint.status !== "CLOSED"),
    [projectSprints],
  );

  const issueTasksByStatus = useMemo(() => {
    const grouped = new Map<string, TaskItem[]>();
    workflow.forEach((status) => grouped.set(status, []));
    for (const task of filteredTasks) {
      if (!grouped.has(task.status)) {
        grouped.set(task.status, []);
      }
      grouped.get(task.status)?.push(task);
    }
    return grouped;
  }, [filteredTasks, workflow]);

  const activeSprintTasksByStatus = useMemo(() => {
    const grouped = new Map<string, TaskItem[]>();
    workflow.forEach((status) => grouped.set(status, []));
    if (!activeSprint) {
      return grouped;
    }

    for (const task of projectTasks) {
      if (task.sprintId !== activeSprint.id) {
        continue;
      }
      if (!grouped.has(task.status)) {
        grouped.set(task.status, []);
      }
      grouped.get(task.status)?.push(task);
    }
    return grouped;
  }, [activeSprint, projectTasks, workflow]);

  const memberRoles = actions.memberRolesByProject[project.id] || {};
  const sprintIssuesBySprintId = useMemo(() => {
    const grouped = new Map<string, TaskItem[]>();
    projectTasks.forEach((task) => {
      if (!task.sprintId) {
        return;
      }
      const current = grouped.get(task.sprintId) || [];
      current.push(task);
      grouped.set(task.sprintId, current);
    });
    return grouped;
  }, [projectTasks]);

  const handleStatusChange = (taskId: string, nextStatus: string) => {
    const changed = actions.changeTaskStatus(taskId, nextStatus);
    if (!changed) {
      appToast.warning({
        title: t("tasks.projectDetails.toast.transitionNotAllowedTitle"),
        description: t(
          "tasks.projectDetails.toast.transitionNotAllowedDescription",
        ),
      });
    }
  };

  return (
    <AppShell>
      <section className="space-y-4">
        <TaskProjectDetailsHeader
          project={project}
          workflow={workflow}
          search={search}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          assigneeFilter={assigneeFilter}
          assigneeOptions={participantOptions}
          sortBy={sortBy}
          taskPriorities={taskPriorities}
          resolveUserLabel={resolveUserLabel}
          onBack={onBack}
          onOpenEditProject={() => setEditDialogOpen(true)}
          onOpenSettings={() => setSettingsDialogOpen(true)}
          onOpenWorkflowManager={() => navigate(appRoutes.tasksWorkflows)}
          onOpenPriorityManager={() => setPriorityManagerOpen(true)}
          onCreateIssue={() => {
            setTaskDialogMode("create");
            setEditingTask(null);
            setTaskDialogOpen(true);
          }}
          onDeleteProject={() => {
            actions.deleteProject(project.id);
            appToast.warning({
              title: t("tasks.projectDetails.toast.projectDeletedTitle"),
              description: tp(
                "tasks.projectDetails.toast.projectDeletedDescription",
                {
                  name: project.name,
                },
              ),
            });
            onBack();
          }}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onPriorityFilterChange={setPriorityFilter}
          onAssigneeFilterChange={setAssigneeFilter}
          onSortByChange={setSortBy}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line">
            <TabsTrigger value="issues">
              {t("tasks.projectDetails.tab.issues")}
            </TabsTrigger>
            <TabsTrigger value="backlog">
              {t("tasks.projectDetails.tab.backlog")}
            </TabsTrigger>
            <TabsTrigger value="sprints">
              {t("tasks.projectDetails.tab.sprints")}
            </TabsTrigger>
            <TabsTrigger value="overview">
              {t("tasks.projectDetails.tab.overview")}
            </TabsTrigger>
          </TabsList>

          {projectTasksQuery.isLoading ? (
            <section className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 rounded-2xl border border-dashed text-sm">
              <Spinner className="size-4" />
              {t("tasks.projectDetails.loadingTasks")}
            </section>
          ) : projectTasksQuery.isError ? (
            <section className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 text-center">
              <p className="text-foreground text-sm font-medium">
                {t("tasks.projectDetails.loadTasksFailedTitle")}
              </p>
              <p className="text-muted-foreground text-sm">
                {projectTasksQuery.error instanceof Error
                  ? projectTasksQuery.error.message
                  : t("tasks.projectDetails.loadTasksFailedDescription")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void projectTasksQuery.refetch();
                }}
              >
                {t("tasks.common.retry")}
              </Button>
            </section>
          ) : (
            <>
          <TabsContent value="issues" className="space-y-4">
            <TaskProjectDetailsIssuesTab
              project={project}
              projectSprints={projectSprints}
              filteredTasks={filteredTasks}
              workflow={workflow}
              workflowStatusByCode={workflowStatusByCode}
              activeSprint={activeSprint}
              issueTasksByStatus={issueTasksByStatus}
              issueViewMode={issueViewMode}
              setIssueViewMode={setIssueViewMode}
              taskPriorities={taskPriorities}
              taskPriorityByCode={taskPriorityByCode}
              assigneeOptions={participantOptions}
              dragTaskId={dragTaskId}
              setDragTaskId={setDragTaskId}
              resolveUserLabel={resolveUserLabel}
              onTaskChangePriority={(taskId, priority) =>
                actions.changeTaskPriority(taskId, priority)
              }
              onTaskChangeStatus={handleStatusChange}
              onTaskChangeAssignee={(taskId, assignee) =>
                actions.assignTask(taskId, assignee)
              }
              onTaskEdit={(task) => {
                setTaskDialogMode("edit");
                setEditingTask(task);
                setTaskDialogOpen(true);
              }}
              onTaskDelete={(taskId) => actions.deleteTask(taskId)}
            />
          </TabsContent>

          <TabsContent value="backlog" className="space-y-4">
            <TaskProjectDetailsBacklogTab
              project={project}
              backlogTasks={backlogTasks}
              availableSprintTargets={availableSprintTargets}
              activeSprint={activeSprint}
              backlogSprintTarget={backlogSprintTarget}
              setBacklogSprintTarget={setBacklogSprintTarget}
              onMoveBacklogTask={actions.moveBacklogTask}
              onAddIssueToSprint={(taskId, sprintId) => {
                actions.addIssueToSprint(taskId, sprintId);
                appToast.success({
                  title: t("tasks.projectDetails.sprintManagement"),
                  description: "Đã thêm issue vào sprint.",
                });
              }}
            />
          </TabsContent>

          <TabsContent value="sprints" className="space-y-4">
            <TaskProjectDetailsSprintsTab
              project={project}
              projectSprints={projectSprints}
              sprintIssuesBySprintId={sprintIssuesBySprintId}
              workflow={workflow}
              workflowStatusByCode={workflowStatusByCode}
              activeSprint={activeSprint}
              activeSprintTasksByStatus={activeSprintTasksByStatus}
              resolveUserLabel={resolveUserLabel}
              dragTaskId={dragTaskId}
              setDragTaskId={setDragTaskId}
              onSprintCreate={() => {
                setEditingSprint(null);
                setSprintDialogOpen(true);
              }}
              onSprintStart={actions.startSprint}
              onSprintClose={actions.closeSprint}
              onIssueRemoveFromSprint={actions.removeIssueFromSprint}
              onTaskChangeStatus={handleStatusChange}
            />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <TaskProjectDetailsOverviewTab
              project={project}
              progress={progress}
              workflowTemplate={workflowTemplate}
              workflow={workflow}
              workflowStatusByCode={workflowStatusByCode}
              onOpenWorkflowManager={() => navigate(appRoutes.tasksWorkflows)}
            />
          </TabsContent>
            </>
          )}
        </Tabs>
      </section>

      <ProjectDialog
        key={`${project.id}-${editDialogOpen ? "edit-open" : "edit-close"}`}
        open={editDialogOpen}
        mode="edit"
        project={project}
        initialWorkflowId={project.workflowId}
        userOptions={userOptions}
        onOpenChange={setEditDialogOpen}
        onSubmit={(payload) => {
          actions.updateProject(project.id, {
            ...project,
            ...payload,
            members: payload.members,
            workflowId: payload.workflowId || undefined,
          });
          appToast.success({
            title: t("tasks.projectDetails.toast.projectUpdatedTitle"),
            description: tp(
              "tasks.projectDetails.toast.projectUpdatedDescription",
              {
                name: payload.name,
              },
            ),
          });
          setEditDialogOpen(false);
        }}
      />

      <ProjectSettingsDialog
        key={`${project.id}-${settingsDialogOpen ? "settings-open" : "settings-close"}`}
        open={settingsDialogOpen}
        project={project}
        memberRoles={memberRoles}
        userOptions={userOptions}
        userOptionById={userOptionById}
        onOpenChange={setSettingsDialogOpen}
        onSaveProject={(projectId, payload) => {
          actions.updateProject(projectId, payload);
          appToast.success({
            title: t("tasks.projectDetails.toast.projectUpdatedTitle"),
            description: tp(
              "tasks.projectDetails.toast.projectUpdatedDescription",
              {
                name: payload.name,
              },
            ),
          });
          setSettingsDialogOpen(false);
        }}
        onAddMember={(projectId, member) =>
          actions.addMember(projectId, member)
        }
        onRemoveMember={(projectId, member) =>
          actions.removeMember(projectId, member)
        }
        onUpdateMemberRole={(projectId, member, role) =>
          actions.updateMemberRole(projectId, member, role)
        }
      />

      <TaskDialog
        key={`${project.id}-${taskDialogMode}-${editingTask?.id || "new"}-${taskDialogOpen ? "open" : "closed"}`}
        open={taskDialogOpen}
        mode={taskDialogMode}
        task={taskDialogMode === "edit" ? editingTask : null}
        projects={[project]}
        defaultProjectId={project.id}
        lockProjectId={project.id}
        assigneeOptions={participantOptions}
        statusOptions={workflow}
        taskPriorities={taskPriorities}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
        onSubmit={(payload) => {
          if (taskDialogMode === "create") {
            void createTaskMutation
              .mutateAsync(payload)
              .then(() => {
                appToast.success({
                  title: t("tasks.projectDetails.toast.issueCreatedTitle"),
                  description: tp(
                    "tasks.projectDetails.toast.issueCreatedDescription",
                    {
                      name: payload.title,
                    },
                  ),
                });
                setTaskDialogOpen(false);
              })
              .catch((error: unknown) => {
                appToast.warning({
                  title: t("tasks.projectDetails.toast.taskRequestFailedTitle"),
                  description:
                    error instanceof Error
                      ? error.message
                      : t(
                          "tasks.projectDetails.toast.taskRequestFailedDescription",
                        ),
                });
              });
            return;
          } else if (editingTask) {
            void updateTaskMutation
              .mutateAsync({
                taskId: editingTask.id,
                payload,
              })
              .then(() => {
                appToast.success({
                  title: t("tasks.projectDetails.toast.issueUpdatedTitle"),
                  description: tp(
                    "tasks.projectDetails.toast.issueUpdatedDescription",
                    {
                      name: payload.title,
                    },
                  ),
                });
                setTaskDialogOpen(false);
                setEditingTask(null);
              })
              .catch((error: unknown) => {
                appToast.warning({
                  title: t("tasks.projectDetails.toast.taskRequestFailedTitle"),
                  description:
                    error instanceof Error
                      ? error.message
                      : t(
                          "tasks.projectDetails.toast.taskRequestFailedDescription",
                        ),
                });
              });
            return;
          }
          setTaskDialogOpen(false);
        }}
      />

      <SprintDialog
        key={`${project.id}-${editingSprint?.id || "new"}-${sprintDialogOpen ? "open" : "closed"}`}
        open={sprintDialogOpen}
        mode={editingSprint ? "edit" : "create"}
        sprint={editingSprint}
        projectId={project.id}
        onOpenChange={(open) => {
          setSprintDialogOpen(open);
          if (!open) {
            setEditingSprint(null);
          }
        }}
        onSubmit={(payload) => {
          if (editingSprint) {
            actions.updateSprint(editingSprint.id, payload);
          } else {
            actions.createSprint(payload);
          }
          setSprintDialogOpen(false);
        }}
      />

      <TaskPriorityManagerDialog
        open={priorityManagerOpen}
        onOpenChange={setPriorityManagerOpen}
        priorities={taskPriorities}
        onCreatePriority={actions.createTaskPriority}
        onUpdatePriority={actions.updateTaskPriority}
        onDeletePriority={actions.deleteTaskPriority}
      />
    </AppShell>
  );
}
