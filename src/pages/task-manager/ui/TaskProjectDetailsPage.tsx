import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleHalfDotIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowUp01Icon,
  Search01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { AppShell } from "@/widgets/app-shell";
import { appRoutes } from "@/shared/constants/routes";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Progress } from "@/shared/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { TASK_TABLE_MIN_WIDTH_CLASS } from "../model/constants";
import { useTaskManagerState } from "../model/useTaskManagerState";
import {
  TASK_PRIORITY_VALUES,
  type SprintItem,
  type TaskItem,
  type TaskPriority,
  type TaskProject,
  type WorkflowTemplate,
} from "../model/types";
import { ProjectDialog } from "./components/ProjectDialog";
import { ProjectSettingsDialog } from "./components/ProjectSettingsDialog";
import { SprintDialog } from "./components/SprintDialog";
import { TaskDialog } from "./components/TaskDialog";
import { TaskStatusBadge } from "./components/TaskStatusBadge";
import { TaskProjectDetailsHeader } from "./components/project-details/TaskProjectDetailsHeader";
import { TaskProjectDetailsNotFound } from "./components/project-details/TaskProjectDetailsNotFound";

type ProjectDetailsActions = Pick<
  ReturnType<typeof useTaskManagerState>,
  | "tasks"
  | "sprints"
  | "workflowTemplates"
  | "workflowIdByProject"
  | "updateProject"
  | "deleteProject"
  | "addMember"
  | "removeMember"
  | "updateMemberRole"
  | "memberRolesByProject"
  | "createTask"
  | "updateTask"
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
>;

export function TaskProjectDetailsPage() {
  const navigate = useNavigate();
  const { projectId = "" } = useParams<{ projectId: string }>();
  const { projects, ...actions } = useTaskManagerState();

  const project = useMemo(
    () => projects.find((item) => item.id === projectId) || null,
    [projectId, projects],
  );

  if (!project) {
    return <TaskProjectDetailsNotFound onBack={() => navigate(appRoutes.tasksProjects)} />;
  }

  return (
    <ProjectDetailsContent
      key={project.id}
      project={project}
      actions={actions}
      onBack={() => navigate(appRoutes.tasksProjects)}
    />
  );
}

function ProjectDetailsContent({
  project,
  actions,
  onBack,
}: {
  project: TaskProject;
  actions: ProjectDetailsActions;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const { t, tp } = useI18n();
  const appToast = useAppToast();
  const workflowTemplate = useMemo<WorkflowTemplate | null>(() => {
    const workflowId = actions.workflowIdByProject[project.id];
    return (
      actions.workflowTemplates.find((template) => template.id === workflowId) ||
      actions.workflowTemplates[0] ||
      null
    );
  }, [actions.workflowIdByProject, actions.workflowTemplates, project.id]);
  const workflow = useMemo(
    () =>
      workflowTemplate?.statuses.map((status) => status.code) || [
        "TODO",
        "IN_PROGRESS",
        "REVIEW",
        "DONE",
      ],
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
  const projectTasks = useMemo(
    () => actions.tasks.filter((task) => task.projectId === project.id),
    [actions.tasks, project.id],
  );
  const projectSprints = useMemo(
    () =>
      actions.sprints
        .filter((sprint) => sprint.projectId === project.id)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [actions.sprints, project.id],
  );

  const [activeTab, setActiveTab] = useState("issues");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "edit">("create");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<SprintItem | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | TaskPriority>("ALL");
  const [sortBy, setSortBy] = useState<"LATEST" | "PRIORITY" | "BACKLOG_ORDER">("LATEST");
  const [issueViewMode, setIssueViewMode] = useState<"LIST" | "KANBAN">("LIST");
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [backlogSprintTarget, setBacklogSprintTarget] = useState<Record<string, string>>({});

  const progress = useMemo(() => {
    const total = projectTasks.length;
    const done = projectTasks.filter((task) => task.status === "DONE").length;
    const inProgress = projectTasks.filter((task) => task.status === "IN_PROGRESS").length;
    const completion = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, inProgress, completion };
  }, [projectTasks]);

  const filteredTasks = useMemo(() => {
    let nextTasks = [...projectTasks];

    if (statusFilter !== "ALL") {
      nextTasks = nextTasks.filter((task) => task.status === statusFilter);
    }
    if (assigneeFilter !== "ALL") {
      nextTasks = nextTasks.filter((task) => (task.assignee || "__UNASSIGNED__") === assigneeFilter);
    }
    if (priorityFilter !== "ALL") {
      nextTasks = nextTasks.filter((task) => task.priority === priorityFilter);
    }
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      nextTasks = nextTasks.filter((task) =>
        `${task.title} ${task.description} ${task.assignee || ""}`.toLowerCase().includes(keyword),
      );
    }

    if (sortBy === "BACKLOG_ORDER") {
      nextTasks.sort((a, b) => a.backlogOrder - b.backlogOrder);
      return nextTasks;
    }

    if (sortBy === "PRIORITY") {
      const weight = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
      nextTasks.sort((a, b) => weight[b.priority] - weight[a.priority]);
      return nextTasks;
    }

    nextTasks.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    return nextTasks;
  }, [assigneeFilter, priorityFilter, projectTasks, search, sortBy, statusFilter]);

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

  const projectIssueView =
    project.type === "SCRUM" ? "Issue board (Scrum)" : "Issue board (Kanban)";

  const handleStatusChange = (taskId: string, nextStatus: string) => {
    const changed = actions.changeTaskStatus(taskId, nextStatus);
    if (!changed) {
      appToast.warning({
        title: t("tasks.projectDetails.toast.transitionNotAllowedTitle"),
        description: t("tasks.projectDetails.toast.transitionNotAllowedDescription"),
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
          sortBy={sortBy}
          onBack={onBack}
          onOpenEditProject={() => setEditDialogOpen(true)}
          onOpenSettings={() => setSettingsDialogOpen(true)}
          onOpenWorkflowManager={() => navigate(appRoutes.tasksWorkflows)}
          onCreateIssue={() => {
            setTaskDialogMode("create");
            setEditingTask(null);
            setTaskDialogOpen(true);
          }}
          onDeleteProject={() => {
            actions.deleteProject(project.id);
            appToast.warning({
              title: t("tasks.projectDetails.toast.projectDeletedTitle"),
              description: tp("tasks.projectDetails.toast.projectDeletedDescription", {
                name: project.name,
              }),
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
            <TabsTrigger value="issues">{t("tasks.projectDetails.tab.issues")}</TabsTrigger>
            <TabsTrigger value="backlog">{t("tasks.projectDetails.tab.backlog")}</TabsTrigger>
            <TabsTrigger value="sprints">{t("tasks.projectDetails.tab.sprints")}</TabsTrigger>
            <TabsTrigger value="overview">{t("tasks.projectDetails.tab.overview")}</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-4">
            <section className="rounded-2xl border bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {projectIssueView}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeSprint
                      ? tp("tasks.projectDetails.activeSprint", { name: activeSprint.name })
                      : t("tasks.projectDetails.noActiveSprint")}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/20 p-1">
                  <Button
                    size="sm"
                    variant={issueViewMode === "LIST" ? "default" : "ghost"}
                    onClick={() => setIssueViewMode("LIST")}
                  >
                    {t("tasks.projectDetails.view.list")}
                  </Button>
                  <Button
                    size="sm"
                    variant={issueViewMode === "KANBAN" ? "default" : "ghost"}
                    onClick={() => setIssueViewMode("KANBAN")}
                  >
                    {t("tasks.projectDetails.view.kanban")}
                  </Button>
                </div>
              </div>

              {issueViewMode === "LIST" ? (
                <Table className={TASK_TABLE_MIN_WIDTH_CLASS}>
                  <TableHeader>
                    <TableRow className="bg-muted/25">
                      <TableHead>{t("tasks.projectDetails.table.issue")}</TableHead>
                      <TableHead>{t("tasks.projectDetails.table.priority")}</TableHead>
                      <TableHead>{t("tasks.projectDetails.table.status")}</TableHead>
                      <TableHead>{t("tasks.projectDetails.table.assignee")}</TableHead>
                      <TableHead>{t("tasks.projectDetails.table.sprint")}</TableHead>
                      <TableHead>{t("tasks.projectDetails.table.updated")}</TableHead>
                      <TableHead>{t("tasks.projectDetails.table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          {t("tasks.projectDetails.emptyIssue")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <p className="font-medium text-foreground">{task.title}</p>
                            <p className="line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={task.priority}
                              onValueChange={(value) =>
                                actions.changeTaskPriority(task.id, value as TaskPriority)
                              }
                            >
                              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {TASK_PRIORITY_VALUES.map((priority) => (
                                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={task.status}
                              onValueChange={(value) => handleStatusChange(task.id, value)}
                            >
                              <SelectTrigger
                                className={cn("w-[165px] border-2 font-medium")}
                                style={{
                                  borderColor: workflowStatusByCode.get(task.status)?.color || "#6B7280",
                                  backgroundColor: `${workflowStatusByCode.get(task.status)?.color || "#6B7280"}14`,
                                }}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {workflow.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    <span className="flex items-center gap-2">
                                      <span
                                        className="size-2 rounded-full"
                                        style={{ backgroundColor: workflowStatusByCode.get(status)?.color || "#6B7280" }}
                                      />
                                      {workflowStatusByCode.get(status)?.name || status}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={task.assignee || "__UNASSIGNED__"}
                              onValueChange={(value) =>
                                actions.assignTask(task.id, value === "__UNASSIGNED__" ? null : value)
                              }
                            >
                              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__UNASSIGNED__">{t("tasks.common.unassigned")}</SelectItem>
                                {project.members.map((member) => (
                                  <SelectItem key={member} value={member}>{member}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {task.sprintId ? (
                              <Badge variant="outline" className="h-6 rounded-full">
                                {projectSprints.find((sprint) => sprint.id === task.sprintId)?.name || t("tasks.projectDetails.defaultSprintLabel")}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">{t("tasks.projectDetails.backlogLabel")}</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDateTime(task.updatedAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setTaskDialogMode("edit");
                                  setEditingTask(task);
                                  setTaskDialogOpen(true);
                                }}
                              >
                                {t("tasks.common.edit")}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => actions.deleteTask(task.id)}
                              >
                                {t("tasks.common.delete")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="overflow-x-auto">
                  <div className="grid min-w-[760px] gap-3 xl:grid-cols-4">
                    {workflow.map((status) => (
                      <section
                        key={status}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (!dragTaskId) {
                            return;
                          }
                          handleStatusChange(dragTaskId, status);
                          setDragTaskId(null);
                        }}
                        className="min-h-[360px] rounded-xl border bg-muted/15 p-2.5"
                      >
                        <header className="mb-2 flex items-center justify-between">
                          <Badge
                            className="h-6 rounded-full border border-transparent px-2 text-[11px]"
                            style={{
                              backgroundColor: `${workflowStatusByCode.get(status)?.color || "#6B7280"}20`,
                              color: workflowStatusByCode.get(status)?.color || "currentColor",
                            }}
                          >
                            {workflowStatusByCode.get(status)?.name || status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {issueTasksByStatus.get(status)?.length || 0}
                          </span>
                        </header>
                        <div className="space-y-2">
                          {(issueTasksByStatus.get(status) || []).map((task) => (
                            <article
                              key={task.id}
                              draggable
                              onDragStart={() => setDragTaskId(task.id)}
                              onDragEnd={() => setDragTaskId(null)}
                              className="cursor-grab rounded-lg border bg-card p-2.5 active:cursor-grabbing"
                            >
                              <p className="line-clamp-2 text-sm font-medium text-foreground">{task.title}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {task.description || t("tasks.common.noDescription")}
                              </p>
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <Badge className={priorityBadgeClassName(task.priority)}>
                                  {task.priority}
                                </Badge>
                                <span className="truncate text-xs text-muted-foreground">
                                  {task.assignee || t("tasks.common.unassigned")}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center justify-between gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setTaskDialogMode("edit");
                                    setEditingTask(task);
                                    setTaskDialogOpen(true);
                                  }}
                                >
                                  {t("tasks.common.edit")}
                                </Button>
                                <Select
                                  value={task.status}
                                  onValueChange={(value) => handleStatusChange(task.id, value)}
                                >
                                  <SelectTrigger className="h-7 w-[128px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {workflow.map((workflowStatus) => (
                                      <SelectItem key={workflowStatus} value={workflowStatus}>
                                        {workflowStatusByCode.get(workflowStatus)?.name || workflowStatus}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="backlog" className="space-y-4">
            <section className="rounded-2xl border bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">Backlog management</p>
                  <p className="text-xs text-muted-foreground">
                    {t("tasks.projectDetails.backlogDescription")}
                  </p>
                </div>
                <Badge variant="outline" className="h-6 rounded-full">
                  {tp("tasks.projectDetails.backlogCount", { count: backlogTasks.length })}
                </Badge>
              </div>

              <Table className={TASK_TABLE_MIN_WIDTH_CLASS}>
                <TableHeader>
                  <TableRow className="bg-muted/25">
                    <TableHead>#</TableHead>
                    <TableHead>{t("tasks.projectDetails.table.issue")}</TableHead>
                    <TableHead>{t("tasks.projectDetails.table.priority")}</TableHead>
                    <TableHead>{t("tasks.projectDetails.table.status")}</TableHead>
                    <TableHead>{t("tasks.projectDetails.table.reorder")}</TableHead>
                    <TableHead>{t("tasks.projectDetails.table.addToSprint")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backlogTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        {t("tasks.projectDetails.emptyBacklog")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    backlogTasks.map((task, index) => (
                      <TableRow key={task.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground">{task.title}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
                        </TableCell>
                        <TableCell>{task.priority}</TableCell>
                        <TableCell><TaskStatusBadge status={task.status} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => actions.moveBacklogTask(project.id, task.id, "up")}
                              disabled={index === 0}
                            >
                              <HugeiconsIcon icon={ArrowUp01Icon} className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon-sm"
                              onClick={() => actions.moveBacklogTask(project.id, task.id, "down")}
                              disabled={index === backlogTasks.length - 1}
                            >
                              <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={backlogSprintTarget[task.id] || "__AUTO__"}
                              onValueChange={(value) =>
                                setBacklogSprintTarget((prev) => ({
                                  ...prev,
                                  [task.id]: value,
                                }))
                              }
                            >
                              <SelectTrigger className="w-[170px]">
                                <SelectValue placeholder="Sprint target" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__AUTO__">{t("tasks.projectDetails.sprintTargetAuto")}</SelectItem>
                                {availableSprintTargets.map((sprint) => (
                                  <SelectItem key={sprint.id} value={sprint.id}>
                                    {sprint.name} ({sprint.status})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const selected = backlogSprintTarget[task.id];
                                const targetSprint =
                                  selected && selected !== "__AUTO__"
                                    ? availableSprintTargets.find((sprint) => sprint.id === selected)
                                    : activeSprint || availableSprintTargets.find((sprint) => sprint.status === "PLANNED");

                                if (!targetSprint) {
                                  appToast.warning({
                                    title: t("tasks.projectDetails.toast.noSprintAvailableTitle"),
                                    description: t("tasks.projectDetails.toast.noSprintAvailableDescription"),
                                  });
                                  return;
                                }

                                actions.addIssueToSprint(task.id, targetSprint.id);
                              }}
                            >
                              {t("tasks.common.add")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </section>
          </TabsContent>

          <TabsContent value="sprints" className="space-y-4">
            {project.type !== "SCRUM" ? (
              <section className="rounded-2xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                  {t("tasks.projectDetails.sprintOnlyScrum")}
                </p>
              </section>
            ) : (
              <>
                <section className="rounded-2xl border bg-card p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t("tasks.projectDetails.sprintManagement")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("tasks.projectDetails.sprintManagementDescription")}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingSprint(null);
                        setSprintDialogOpen(true);
                      }}
                    >
                      <HugeiconsIcon icon={AddCircleHalfDotIcon} />
                      {t("tasks.projectDetails.createSprint")}
                    </Button>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    {projectSprints.length === 0 ? (
                      <article className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                        {t("tasks.projectDetails.noSprintYet")}
                      </article>
                    ) : (
                      projectSprints.map((sprint) => {
                        const sprintIssues = sprintIssuesBySprintId.get(sprint.id) || [];
                        const sprintDone = sprintIssues.filter((task) => task.status === "DONE").length;
                        const sprintProgress =
                          sprintIssues.length === 0
                            ? 0
                            : Math.round((sprintDone / sprintIssues.length) * 100);

                        return (
                          <article key={sprint.id} className="rounded-xl border bg-muted/10 p-3">
                            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{sprint.name}</p>
                                <p className="text-xs text-muted-foreground">{sprint.startDate} - {sprint.endDate}</p>
                              </div>
                              <Badge
                                className={
                                  sprint.status === "ACTIVE"
                                    ? "h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                    : sprint.status === "CLOSED"
                                      ? "h-6 rounded-full bg-muted text-muted-foreground"
                                      : "h-6 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                }
                              >
                                {sprint.status}
                              </Badge>
                            </div>

                            <p className="mb-2 text-xs text-muted-foreground">{sprint.goal || t("tasks.projectDetails.noGoal")}</p>

                            <div className="mb-2">
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{t("tasks.projectDetails.progress")}</span>
                                <span className="text-xs text-foreground">{sprintProgress}%</span>
                              </div>
                              <Progress value={sprintProgress} className="h-1.5" />
                            </div>

                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              {sprint.status === "PLANNED" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => actions.startSprint(sprint.id)}
                                >
                                  {t("tasks.projectDetails.startSprint")}
                                </Button>
                              ) : null}
                              {sprint.status === "ACTIVE" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => actions.closeSprint(sprint.id)}
                                >
                                  {t("tasks.projectDetails.closeSprint")}
                                </Button>
                              ) : null}
                            </div>

                            <div className="space-y-1">
                              {sprintIssues.length === 0 ? (
                                <p className="text-xs text-muted-foreground">{t("tasks.projectDetails.noIssueInSprint")}</p>
                              ) : (
                                sprintIssues.map((issue) => (
                                  <div
                                    key={issue.id}
                                    className="flex items-center justify-between rounded-md border bg-card px-2 py-1.5"
                                  >
                                    <span className="truncate text-xs text-foreground">{issue.title}</span>
                                    {sprint.status !== "CLOSED" ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => actions.removeIssueFromSprint(issue.id)}
                                      >
                                        {t("tasks.common.remove")}
                                      </Button>
                                    ) : null}
                                  </div>
                                ))
                              )}
                            </div>
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border bg-card p-4">
                  <p className="mb-2 text-sm font-semibold text-foreground">{t("tasks.projectDetails.activeSprintBoard")}</p>
                  {activeSprint ? (
                    <div className="grid gap-3 xl:grid-cols-4">
                              {workflow.map((status) => (
                                <section
                                  key={status}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (!dragTaskId) {
                              return;
                            }
                            handleStatusChange(dragTaskId, status);
                            setDragTaskId(null);
                          }}
                          className="min-h-[300px] rounded-xl border bg-muted/15 p-2.5"
                        >
                          <header className="mb-2 flex items-center justify-between">
                            <Badge
                              className="h-6 rounded-full border border-transparent px-2 text-[11px]"
                              style={{
                                backgroundColor: `${workflowStatusByCode.get(status)?.color || "#6B7280"}20`,
                                color: workflowStatusByCode.get(status)?.color || "currentColor",
                              }}
                            >
                              {workflowStatusByCode.get(status)?.name || status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {activeSprintTasksByStatus.get(status)?.length || 0}
                            </span>
                          </header>
                          <div className="space-y-2">
                            {(activeSprintTasksByStatus.get(status) || []).map((task) => (
                              <article
                                key={task.id}
                                draggable
                                onDragStart={() => setDragTaskId(task.id)}
                                className="cursor-grab rounded-lg border bg-card p-2.5"
                              >
                                <p className="text-sm font-medium text-foreground">{task.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {task.assignee || t("tasks.common.unassigned")}
                                </p>
                              </article>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("tasks.projectDetails.noActiveSprint")}</p>
                  )}
                </section>
              </>
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <section className="rounded-2xl border bg-card p-4">
              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label={t("tasks.projectDetails.metric.members")} value={String(project.members.length)} />
                <MetricCard label={t("tasks.projectDetails.metric.totalIssues")} value={String(progress.total)} />
                <MetricCard label={t("tasks.projectDetails.metric.inProgress")} value={String(progress.inProgress)} />
                <MetricCard label={t("tasks.projectDetails.metric.done")} value={String(progress.done)} />
              </div>

              <article className="mb-4 rounded-xl border bg-muted/15 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{t("tasks.projectDetails.projectCompletion")}</p>
                  <span className="text-sm font-semibold text-foreground">{progress.completion}%</span>
                </div>
                <Progress value={progress.completion} className="h-2" />
              </article>

              <article className="rounded-xl border bg-muted/15 p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("tasks.projectDetails.workflow")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("tasks.projectDetails.workflowDescription")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(appRoutes.tasksWorkflows)}
                  >
                    {t("tasks.projectDetails.workflowManager")}
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="h-6 rounded-full">
                    {workflowTemplate?.name || t("tasks.projectDetails.defaultWorkflow")}
                  </Badge>
                  {workflow.map((status) => (
                    <Badge
                      key={status}
                      className="h-6 rounded-full border border-transparent px-2 text-[11px]"
                      style={{
                        backgroundColor: `${workflowStatusByCode.get(status)?.color || "#6B7280"}20`,
                        color: workflowStatusByCode.get(status)?.color || "currentColor",
                      }}
                    >
                      {workflowStatusByCode.get(status)?.name || status}
                    </Badge>
                  ))}
                </div>
              </article>
            </section>
          </TabsContent>
        </Tabs>
      </section>

      <ProjectDialog
        key={`${project.id}-${editDialogOpen ? "edit-open" : "edit-close"}`}
        open={editDialogOpen}
        mode="edit"
        project={project}
        onOpenChange={setEditDialogOpen}
        onSubmit={(payload) => {
          actions.updateProject(project.id, {
            ...project,
            ...payload,
            members: payload.members,
          });
          appToast.success({
            title: t("tasks.projectDetails.toast.projectUpdatedTitle"),
            description: tp("tasks.projectDetails.toast.projectUpdatedDescription", {
              name: payload.name,
            }),
          });
          setEditDialogOpen(false);
        }}
      />

      <ProjectSettingsDialog
        key={`${project.id}-${settingsDialogOpen ? "settings-open" : "settings-close"}`}
        open={settingsDialogOpen}
        project={project}
        memberRoles={memberRoles}
        onOpenChange={setSettingsDialogOpen}
        onSaveProject={(projectId, payload) => {
          actions.updateProject(projectId, payload);
          appToast.success({
            title: t("tasks.projectDetails.toast.projectUpdatedTitle"),
            description: tp("tasks.projectDetails.toast.projectUpdatedDescription", {
              name: payload.name,
            }),
          });
          setSettingsDialogOpen(false);
        }}
        onAddMember={(projectId, member) => actions.addMember(projectId, member)}
        onRemoveMember={(projectId, member) => actions.removeMember(projectId, member)}
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
        members={project.members}
        statusOptions={workflow}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
        onSubmit={(payload) => {
          if (taskDialogMode === "create") {
            actions.createTask(payload);
            appToast.success({
              title: t("tasks.projectDetails.toast.issueCreatedTitle"),
              description: tp("tasks.projectDetails.toast.issueCreatedDescription", {
                name: payload.title,
              }),
            });
          } else if (editingTask) {
            actions.updateTask(editingTask.id, payload);
            appToast.success({
              title: t("tasks.projectDetails.toast.issueUpdatedTitle"),
              description: tp("tasks.projectDetails.toast.issueUpdatedDescription", {
                name: payload.title,
              }),
            });
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
    </AppShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100/50 p-3 dark:from-slate-950/30 dark:to-slate-900/10">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </article>
  );
}

function priorityBadgeClassName(priority: TaskPriority) {
  if (priority === "HIGH") {
    return "h-5 rounded-full bg-red-100 px-2 text-[10px] text-red-700 dark:bg-red-900/40 dark:text-red-200";
  }
  if (priority === "MEDIUM") {
    return "h-5 rounded-full bg-amber-100 px-2 text-[10px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-200";
  }

  return "h-5 rounded-full bg-sky-100 px-2 text-[10px] text-sky-700 dark:bg-sky-900/40 dark:text-sky-200";
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
