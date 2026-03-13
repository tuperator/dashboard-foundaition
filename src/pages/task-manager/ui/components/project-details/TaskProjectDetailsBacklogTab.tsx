import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { TASK_TABLE_MIN_WIDTH_CLASS } from "../../../model/constants";
import { listBacklogTasks } from "../../../model/backlogManagement.api";
import type {
  SprintItem,
  TaskItem,
  TaskManagerUserOption,
  TaskPriorityItem,
  TaskProject,
} from "../../../model/types";
import { TaskDialog } from "../TaskDialog";
import { TaskProjectBacklogBulkActions } from "./TaskProjectBacklogBulkActions";
import { TaskProjectBacklogFieldSelect } from "./TaskProjectBacklogFieldSelect";
import { TaskProjectBacklogRowActions } from "./TaskProjectBacklogRowActions";

type BacklogFiltersState = {
  search: string;
  status: string;
  priority: string;
  assigneeId: string;
};

export interface TaskProjectDetailsBacklogTabProps {
  project: TaskProject;
  availableSprintTargets: SprintItem[];
  activeSprint: SprintItem | null;
  assigneeOptions: TaskManagerUserOption[];
  taskPriorities: TaskPriorityItem[];
  workflow: string[];
  workflowStatusByCode: Map<string, { name: string; color: string }>;
}

const BACKLOG_FILTERS_STORAGE_PREFIX = "task-project-backlog-filters";

const DEFAULT_FILTERS: BacklogFiltersState = {
  search: "",
  status: "ALL",
  priority: "ALL",
  assigneeId: "ALL",
};

export function TaskProjectDetailsBacklogTab({
  project,
  availableSprintTargets,
  activeSprint,
  assigneeOptions,
  taskPriorities,
  workflow,
  workflowStatusByCode,
}: TaskProjectDetailsBacklogTabProps) {
  const { t, tp } = useI18n();
  const [filters, setFilters] = useState<BacklogFiltersState>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_FILTERS;
    }

    const savedValue = window.localStorage.getItem(
      `${BACKLOG_FILTERS_STORAGE_PREFIX}-${project.id}`,
    );

    if (!savedValue) {
      return DEFAULT_FILTERS;
    }

    try {
      const parsed = JSON.parse(savedValue) as Partial<BacklogFiltersState>;
      return {
        ...DEFAULT_FILTERS,
        ...parsed,
      };
    } catch {
      return DEFAULT_FILTERS;
    }
  });
  const [selectedTaskIdsState, setSelectedTaskIdsState] = useState<string[]>(
    [],
  );
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      `${BACKLOG_FILTERS_STORAGE_PREFIX}-${project.id}`,
      JSON.stringify(filters),
    );
  }, [filters, project.id]);

  const backlogTasksQuery = useQuery({
    queryKey: [
      "task-project-backlog-tasks",
      project.id,
      filters.search,
      filters.status,
      filters.priority,
      filters.assigneeId,
    ],
    queryFn: () =>
      listBacklogTasks({
        projectId: project.id,
        page: 1,
        size: 200,
        search: filters.search || undefined,
        status: filters.status !== "ALL" ? filters.status : null,
        assigneeId:
          filters.assigneeId !== "ALL" &&
          filters.assigneeId !== "__UNASSIGNED__"
            ? filters.assigneeId
            : null,
        priority: filters.priority !== "ALL" ? filters.priority : null,
        sortBy: "BACKLOG_ORDER",
        sortDirection: "ASC",
      }),
  });

  const backlogTasks = useMemo(() => {
    const items = backlogTasksQuery.data?.items || [];

    if (filters.assigneeId === "__UNASSIGNED__") {
      return items.filter((task) => !task.assignee);
    }

    return items;
  }, [backlogTasksQuery.data?.items, filters.assigneeId]);

  const taskIds = useMemo(
    () => backlogTasks.map((task) => task.id),
    [backlogTasks],
  );
  const selectedTaskIds = useMemo(
    () => selectedTaskIdsState.filter((taskId) => taskIds.includes(taskId)),
    [selectedTaskIdsState, taskIds],
  );
  const assigneeLabelById = useMemo(
    () =>
      new Map(
        assigneeOptions.map((option) => [
          option.id,
          option.label || option.email || option.id,
        ]),
      ),
    [assigneeOptions],
  );
  const allSelected =
    backlogTasks.length > 0 && selectedTaskIds.length === backlogTasks.length;
  const unassignedCount = backlogTasks.filter((task) => !task.assignee).length;
  const missingDescriptionCount = backlogTasks.filter(
    (task) => !task.description.trim(),
  ).length;

  const openCreateDialog = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const openEditDialog = (task: TaskItem) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  return (
    <>
      <section className="bg-card rounded-2xl border p-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-foreground text-sm font-semibold">
                Backlog management
              </p>
              <Badge variant="outline" className="h-6 rounded-full">
                {tp("tasks.projectDetails.backlogCount", {
                  count: backlogTasks.length,
                })}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              {t("tasks.projectDetails.backlogDescription")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="h-6 rounded-full">
              Unassigned {unassignedCount}
            </Badge>
            <Badge variant="outline" className="h-6 rounded-full">
              No description {missingDescriptionCount}
            </Badge>
            <Button onClick={openCreateDialog}>Create issue</Button>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <Input
            className="w-full xl:max-w-[520px] xl:flex-1"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            placeholder="Search issue by title"
          />

          <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  status: value,
                }))
              }
            >
              <SelectTrigger className="w-full sm:w-[148px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All status</SelectItem>
                {workflow.map((status) => (
                  <SelectItem key={status} value={status}>
                    {workflowStatusByCode.get(status)?.name || status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  priority: value,
                }))
              }
            >
              <SelectTrigger className="w-full sm:w-[148px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All priority</SelectItem>
                {taskPriorities.map((priority) => (
                  <SelectItem key={priority.code} value={priority.code}>
                    {priority.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.assigneeId}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  assigneeId: value,
                }))
              }
            >
              <SelectTrigger className="w-full sm:w-[168px]">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All assignee</SelectItem>
                <SelectItem value="__UNASSIGNED__">Unassigned</SelectItem>
                {assigneeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TaskProjectBacklogBulkActions
          projectId={project.id}
          selectedTaskIds={selectedTaskIds}
          assigneeOptions={assigneeOptions}
          taskPriorities={taskPriorities}
          availableSprintTargets={availableSprintTargets}
          onCompleted={() => setSelectedTaskIdsState([])}
        />

        {backlogTasksQuery.isLoading ? (
          <div className="text-muted-foreground flex min-h-32 items-center justify-center gap-2 rounded-xl border border-dashed text-sm">
            <Spinner className="size-4" />
            {t("tasks.projectDetails.loadingTasks")}
          </div>
        ) : backlogTasksQuery.isError ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 text-center">
            <p className="text-foreground text-sm font-medium">
              {t("tasks.projectDetails.loadTasksFailedTitle")}
            </p>
            <p className="text-muted-foreground text-sm">
              {backlogTasksQuery.error instanceof Error
                ? backlogTasksQuery.error.message
                : t("tasks.projectDetails.loadTasksFailedDescription")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void backlogTasksQuery.refetch();
              }}
            >
              {t("tasks.common.retry")}
            </Button>
          </div>
        ) : (
          <Table className={TASK_TABLE_MIN_WIDTH_CLASS}>
            <TableHeader>
              <TableRow className="bg-muted/25">
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) =>
                      setSelectedTaskIdsState(
                        event.target.checked ? taskIds : [],
                      )
                    }
                  />
                </TableHead>
                <TableHead className="w-24" />
                <TableHead>{t("tasks.projectDetails.table.issue")}</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>{t("tasks.projectDetails.table.priority")}</TableHead>
                <TableHead>{t("tasks.projectDetails.table.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backlogTasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground py-8 text-center"
                  >
                    {t("tasks.projectDetails.emptyBacklog")}
                  </TableCell>
                </TableRow>
              ) : (
                backlogTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);

                  return (
                    <TableRow key={task.id} className="align-top">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) =>
                            setSelectedTaskIdsState((current) =>
                              event.target.checked
                                ? [...current, task.id]
                                : current.filter((item) => item !== task.id),
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TaskProjectBacklogRowActions
                          projectId={project.id}
                          task={task}
                          taskIds={taskIds}
                          availableSprintTargets={availableSprintTargets}
                          activeSprint={activeSprint}
                          onEdit={openEditDialog}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-foreground font-medium">
                              {task.title}
                            </p>
                            {!task.assignee ? (
                              <Badge
                                variant="outline"
                                className="text-amber-700"
                              >
                                Unassigned
                              </Badge>
                            ) : null}
                            {!task.description.trim() ? (
                              <Badge
                                variant="outline"
                                className="text-rose-700"
                              >
                                Missing description
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-muted-foreground line-clamp-2 text-xs">
                            {task.description || "No description"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {task.assignee
                            ? assigneeLabelById.get(task.assignee) || task.assignee
                            : "Unassigned"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <TaskProjectBacklogFieldSelect
                          kind="priority"
                          projectId={project.id}
                          task={task}
                          taskPriorities={taskPriorities}
                        />
                      </TableCell>
                      <TableCell>
                        <TaskProjectBacklogFieldSelect
                          kind="status"
                          projectId={project.id}
                          task={task}
                          workflow={workflow}
                          workflowStatusByCode={workflowStatusByCode}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </section>

      <TaskDialog
        open={taskDialogOpen}
        mode={editingTask ? "edit" : "create"}
        task={editingTask}
        projects={[project]}
        defaultProjectId={project.id}
        lockProjectId={project.id}
        assigneeOptions={assigneeOptions}
        statusOptions={workflow}
        workflowStatusByCode={workflowStatusByCode}
        taskPriorities={taskPriorities}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
      />
    </>
  );
}
