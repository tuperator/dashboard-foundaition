import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  getProjectDetail,
  type TaskProjectDetail,
} from "../model/projectManagement.api";
import { useTaskProjectTasks } from "../model/hooks/useTaskProjectTasks";
import { getWorkflowDetail } from "../model/workflowManagement.api";
import {
  type TaskManagerUserOption,
} from "../model/types";
import ProjectDialog from "./components/ProjectDialog";
import { ProjectSettingsDialog } from "./components/ProjectSettingsDialog";
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
  | "createTaskPriority"
  | "updateTaskPriority"
  | "deleteTaskPriority"
>;

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
  const [activeTab, setActiveTab] = useState("issues");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [priorityManagerOpen, setPriorityManagerOpen] = useState(false);
  const [backlogSprintTarget, setBacklogSprintTarget] = useState<
    Record<string, string>
  >({});
  const workflowDetailQuery = useQuery({
    queryKey: ["task-project-workflow-detail", project.workflowId],
    queryFn: () => getWorkflowDetail(project.workflowId as string),
    enabled: Boolean(project.workflowId),
  });
  const workflowTemplate = workflowDetailQuery.data || null;
  const workflow = useMemo(
    () => workflowTemplate?.statuses.map((status) => status.code) || [],
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
  const taskPriorityByCode = useMemo(
    () => new Map(taskPriorities.map((priority) => [priority.code, priority])),
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

  const memberRoles = actions.memberRolesByProject[project.id] || {};

  const {
    search,
    statusFilter,
    assigneeFilter,
    priorityFilter,
    sortBy,
    issuePage,
    issuePageSize,
    issueViewMode,
    dragTaskId,
    projectSprints,
    activeSprint,
    availableSprintTargets,
    progress,
    backlogTasks,
    paginatedIssueTasks,
    issueTotal,
    issueRowStart,
    issueRowEnd,
    visibleIssuePages,
    issueTasksByStatus,
    activeSprintTasksByStatus,
    sprintIssuesBySprintId,
    getAvailableStatuses,
    hasMoreKanbanTasks,
    isLoadingMoreKanbanTasks,
    taskDataState,
    onLoadMoreKanbanTasks,
    onIssuePageChange,
    onIssuePageSizeChange,
    onIssueViewModeChange,
    onDragTaskIdChange,
    onSearchChange,
    onStatusFilterChange,
    onPriorityFilterChange,
    onAssigneeFilterChange,
    onSortByChange,
    onTaskChangeStatus,
  } = useTaskProjectTasks({
    projectId: project.id,
    activeTab,
    workflow,
    workflowTemplate,
    taskPriorities,
    resolveUserLabel,
  });

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
          onSearchChange={onSearchChange}
          onStatusFilterChange={onStatusFilterChange}
          onPriorityFilterChange={onPriorityFilterChange}
          onAssigneeFilterChange={onAssigneeFilterChange}
          onSortByChange={onSortByChange}
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

          {taskDataState.isLoading ? (
            <section className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 rounded-2xl border border-dashed text-sm">
              <Spinner className="size-4" />
              {t("tasks.projectDetails.loadingTasks")}
            </section>
          ) : taskDataState.isError ? (
            <section className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 text-center">
              <p className="text-foreground text-sm font-medium">
                {t("tasks.projectDetails.loadTasksFailedTitle")}
              </p>
              <p className="text-muted-foreground text-sm">
                {taskDataState.error instanceof Error
                  ? taskDataState.error.message
                  : t("tasks.projectDetails.loadTasksFailedDescription")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void taskDataState.refetch();
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
                  filteredTasks={paginatedIssueTasks}
                  workflow={workflow}
                  getAvailableStatuses={getAvailableStatuses}
                  workflowStatusByCode={workflowStatusByCode}
                  activeSprint={activeSprint}
                  issueTasksByStatus={issueTasksByStatus}
                  issueViewMode={issueViewMode}
                  setIssueViewMode={onIssueViewModeChange}
                  issuePage={issuePage}
                  issuePageSize={issuePageSize}
                  issueRowStart={issueRowStart}
                  issueRowEnd={issueRowEnd}
                  issueTotal={issueTotal}
                  visibleIssuePages={visibleIssuePages}
                  onIssuePageChange={onIssuePageChange}
                  onIssuePageSizeChange={onIssuePageSizeChange}
                  hasMoreKanbanTasks={hasMoreKanbanTasks}
                  isLoadingMoreKanbanTasks={isLoadingMoreKanbanTasks}
                  onLoadMoreKanbanTasks={onLoadMoreKanbanTasks}
                  taskPriorities={taskPriorities}
                  taskPriorityByCode={taskPriorityByCode}
                  assigneeOptions={participantOptions}
                  dragTaskId={dragTaskId}
                  setDragTaskId={onDragTaskIdChange}
                  resolveUserLabel={resolveUserLabel}
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
                  setDragTaskId={onDragTaskIdChange}
                  onIssueRemoveFromSprint={actions.removeIssueFromSprint}
                  onTaskChangeStatus={onTaskChangeStatus}
                />
              </TabsContent>

              <TabsContent value="overview" className="space-y-4">
                <TaskProjectDetailsOverviewTab
                  project={project}
                  progress={progress}
                  workflowTemplate={workflowTemplate}
                  workflow={workflow}
                  workflowStatusByCode={workflowStatusByCode}
                  onOpenWorkflowManager={() =>
                    navigate(appRoutes.tasksWorkflows)
                  }
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
