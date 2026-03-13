import { useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import {
  TASK_ISSUE_DEFAULT_PAGE,
  TASK_ISSUE_DEFAULT_PAGE_SIZE,
  TASK_ISSUE_MAX_VISIBLE_PAGES,
  TASK_KANBAN_LOAD_PAGE_SIZE,
} from "../constants";
import { isWorkflowTransitionAllowed } from "../helpers/workflowHelpers";
import {
  listTasks,
  updateTask as updateTaskApi,
} from "../projectManagement.api";
import { listSprints } from "../sprintManagement.api";
import type {
  TaskItem,
  TaskPriority,
  TaskPriorityItem,
  WorkflowTemplate,
} from "../types";

const TASK_PROJECT_TASKS_QUERY_KEY = "task-project-tasks";
const TASK_PROJECT_KANBAN_TASKS_QUERY_KEY = "task-project-kanban-tasks";
const TASK_PROJECT_SPRINTS_QUERY_KEY = "task-project-sprints";

type UseTaskProjectTasksParams = {
  projectId: string;
  activeTab: string;
  workflow: string[];
  workflowTemplate: WorkflowTemplate | null;
  taskPriorities: TaskPriorityItem[];
  resolveUserLabel: (value: string | null | undefined) => string;
};

export function useTaskProjectTasks({
  projectId,
  activeTab,
  workflow,
  workflowTemplate,
  taskPriorities,
  resolveUserLabel,
}: UseTaskProjectTasksParams) {
  const { t } = useI18n();
  const appToast = useAppToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | TaskPriority>(
    "ALL",
  );
  const [issuePage, setIssuePage] = useState(TASK_ISSUE_DEFAULT_PAGE);
  const [issuePageSize, setIssuePageSize] = useState(
    TASK_ISSUE_DEFAULT_PAGE_SIZE,
  );
  const [sortBy, setSortBy] = useState<"LATEST" | "PRIORITY" | "BACKLOG_ORDER">(
    "LATEST",
  );
  const [issueViewMode, setIssueViewMode] = useState<"LIST" | "KANBAN">("LIST");
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  const listSort = useMemo(() => mapTaskSort(sortBy), [sortBy]);
  const normalizedSearch = search.trim() || undefined;
  const normalizedStatus = statusFilter !== "ALL" ? statusFilter : undefined;
  const normalizedAssignee =
    assigneeFilter !== "ALL" && assigneeFilter !== "__UNASSIGNED__"
      ? assigneeFilter
      : undefined;
  const normalizedPriority =
    priorityFilter !== "ALL" ? priorityFilter : undefined;

  const issueListTasksQuery = useQuery({
    queryKey: [
      TASK_PROJECT_TASKS_QUERY_KEY,
      projectId,
      "issues-list",
      issuePage,
      issuePageSize,
      normalizedSearch,
      normalizedStatus,
      assigneeFilter,
      normalizedPriority,
      sortBy,
    ],
    queryFn: () =>
      listTasks({
        projectId,
        page: issuePage,
        size: issuePageSize,
        search: normalizedSearch,
        status: normalizedStatus,
        assigneeId: normalizedAssignee,
        priority: normalizedPriority,
        sortBy: listSort.sortBy,
        sortDirection: listSort.sortDirection,
      }),
    enabled: activeTab === "issues" && issueViewMode === "LIST",
  });

  const supportingTasksQuery = useQuery({
    queryKey: [TASK_PROJECT_TASKS_QUERY_KEY, projectId, "supporting"],
    queryFn: () =>
      listTasks({
        projectId,
        page: 1,
        size: 200,
        sortBy: "UPDATED_AT",
        sortDirection: "DESC",
      }),
    enabled: activeTab !== "issues",
  });

  const kanbanTasksQuery = useInfiniteQuery({
    queryKey: [
      TASK_PROJECT_KANBAN_TASKS_QUERY_KEY,
      projectId,
      normalizedSearch,
      normalizedStatus,
      assigneeFilter,
      normalizedPriority,
      sortBy,
    ],
    queryFn: ({ pageParam }) =>
      listTasks({
        projectId,
        page: pageParam,
        size: TASK_KANBAN_LOAD_PAGE_SIZE,
        search: normalizedSearch,
        status: normalizedStatus,
        assigneeId: normalizedAssignee,
        priority: normalizedPriority,
        sortBy: listSort.sortBy,
        sortDirection: listSort.sortDirection,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: activeTab === "issues" && issueViewMode === "KANBAN",
  });
  const sprintListQuery = useQuery({
    queryKey: [TASK_PROJECT_SPRINTS_QUERY_KEY, projectId],
    queryFn: () =>
      listSprints({
        projectId,
        page: 1,
        size: 100,
        sortBy: "START_DATE",
        sortDirection: "DESC",
      }),
    enabled: Boolean(projectId),
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
      await invalidateTaskQueries(queryClient, projectId);
    },
  });

  const issueListTasks = useMemo(
    () => issueListTasksQuery.data?.items || [],
    [issueListTasksQuery.data],
  );
  const supportingTasks = useMemo(
    () => supportingTasksQuery.data?.items || [],
    [supportingTasksQuery.data],
  );
  const kanbanTasks = useMemo(() => {
    const byId = new Map<string, TaskItem>();

    for (const page of kanbanTasksQuery.data?.pages || []) {
      for (const task of page.items) {
        byId.set(task.id, task);
      }
    }

    return Array.from(byId.values());
  }, [kanbanTasksQuery.data?.pages]);

  const progress = useMemo(() => {
    const total = supportingTasks.length;
    const done = supportingTasks.filter((task) => task.status === "DONE").length;
    const inProgress = supportingTasks.filter(
      (task) => task.status === "IN_PROGRESS",
    ).length;
    const completion = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, inProgress, completion };
  }, [supportingTasks]);

  const filteredSupportingTasks = useMemo(
    () =>
      applyIssueFiltersAndSort({
        tasks: supportingTasks,
        statusFilter,
        assigneeFilter,
        priorityFilter,
        search,
        sortBy,
        taskPriorityByCode: new Map(taskPriorities.map((item) => [item.code, item])),
        resolveUserLabel,
      }),
    [
      assigneeFilter,
      priorityFilter,
      resolveUserLabel,
      search,
      sortBy,
      statusFilter,
      supportingTasks,
      taskPriorities,
    ],
  );

  const backlogTasks = useMemo(
    () =>
      filteredSupportingTasks
        .filter((task) => task.sprintId === null)
        .sort((a, b) => a.backlogOrder - b.backlogOrder),
    [filteredSupportingTasks],
  );

  const issueTotal = issueListTasksQuery.data?.total ?? 0;
  const issueTotalPages = Math.max(1, issueListTasksQuery.data?.totalPages ?? 1);
  const activeIssuePage = Math.min(issuePage, issueTotalPages);
  const paginatedIssueTasks = issueListTasks;
  const issueRowStart =
    issueTotal === 0 ? 0 : (activeIssuePage - 1) * issuePageSize + 1;
  const issueRowEnd =
    issueTotal === 0 ? 0 : issueRowStart + paginatedIssueTasks.length - 1;
  const visibleIssuePages = useMemo(() => {
    const startIndex = Math.max(
      0,
      activeIssuePage - Math.ceil(TASK_ISSUE_MAX_VISIBLE_PAGES / 2),
    );

    return Array.from({ length: issueTotalPages }, (_, index) => index + 1).slice(
      startIndex,
      startIndex + TASK_ISSUE_MAX_VISIBLE_PAGES,
    );
  }, [activeIssuePage, issueTotalPages]);

  const projectSprints = useMemo(
    () => sprintListQuery.data?.items || [],
    [sprintListQuery.data],
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

    for (const task of kanbanTasks) {
      if (!grouped.has(task.status)) {
        grouped.set(task.status, []);
      }
      grouped.get(task.status)?.push(task);
    }

    return grouped;
  }, [kanbanTasks, workflow]);

  const activeSprintTasksByStatus = useMemo(() => {
    const grouped = new Map<string, TaskItem[]>();
    workflow.forEach((status) => grouped.set(status, []));
    if (!activeSprint) {
      return grouped;
    }

    for (const task of supportingTasks) {
      if (task.sprintId !== activeSprint.id) {
        continue;
      }
      if (!grouped.has(task.status)) {
        grouped.set(task.status, []);
      }
      grouped.get(task.status)?.push(task);
    }

    return grouped;
  }, [activeSprint, supportingTasks, workflow]);

  const taskById = useMemo(() => {
    const nextMap = new Map<string, TaskItem>();

    for (const task of issueListTasks) {
      nextMap.set(task.id, task);
    }
    for (const task of supportingTasks) {
      nextMap.set(task.id, task);
    }
    for (const task of kanbanTasks) {
      nextMap.set(task.id, task);
    }

    return nextMap;
  }, [issueListTasks, kanbanTasks, supportingTasks]);

  const sprintIssuesBySprintId = useMemo(() => {
    const grouped = new Map<string, TaskItem[]>();
    supportingTasks.forEach((task) => {
      if (!task.sprintId) {
        return;
      }
      const current = grouped.get(task.sprintId) || [];
      current.push(task);
      grouped.set(task.sprintId, current);
    });
    return grouped;
  }, [supportingTasks]);

  const getAvailableStatuses = (task: TaskItem) => {
    const nextStatuses = workflow.filter(
      (status) =>
        status === task.status ||
        isWorkflowTransitionAllowed(workflowTemplate, task.status, status),
    );

    return nextStatuses.length > 0 ? nextStatuses : [task.status];
  };

  const handleStatusChange = async (taskId: string, nextStatus: string) => {
    const task = taskById.get(taskId);
    if (!task || task.status === nextStatus) {
      return;
    }

    if (
      !isWorkflowTransitionAllowed(workflowTemplate, task.status, nextStatus)
    ) {
      appToast.warning({
        title: t("tasks.projectDetails.toast.transitionNotAllowedTitle"),
        description: t(
          "tasks.projectDetails.toast.transitionNotAllowedDescription",
        ),
      });
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        payload: {
          title: task.title,
          description: task.description,
          projectId: task.projectId,
          assignee: task.assignee,
          status: nextStatus,
          priority: task.priority,
        },
      });
    } catch (error: unknown) {
      appToast.warning({
        title: t("tasks.projectDetails.toast.taskRequestFailedTitle"),
        description:
          error instanceof Error
            ? error.message
            : t("tasks.projectDetails.toast.taskRequestFailedDescription"),
      });
    }
  };

  return {
    search,
    statusFilter,
    assigneeFilter,
    priorityFilter,
    sortBy,
    issuePage: activeIssuePage,
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
    hasMoreKanbanTasks: Boolean(kanbanTasksQuery.hasNextPage),
    isLoadingMoreKanbanTasks: kanbanTasksQuery.isFetchingNextPage,
    taskDataState: {
      isLoading:
        activeTab === "issues"
          ? issueViewMode === "KANBAN"
            ? kanbanTasksQuery.isLoading
            : issueListTasksQuery.isLoading
          : supportingTasksQuery.isLoading || sprintListQuery.isLoading,
      isError:
        activeTab === "issues"
          ? issueViewMode === "KANBAN"
            ? kanbanTasksQuery.isError
            : issueListTasksQuery.isError
          : supportingTasksQuery.isError || sprintListQuery.isError,
      error:
        activeTab === "issues"
          ? issueViewMode === "KANBAN"
            ? kanbanTasksQuery.error
            : issueListTasksQuery.error
          : supportingTasksQuery.error || sprintListQuery.error,
      refetch: async () => {
        if (activeTab === "issues") {
          return issueViewMode === "KANBAN"
            ? kanbanTasksQuery.refetch()
            : issueListTasksQuery.refetch();
        }

        await Promise.all([
          supportingTasksQuery.refetch(),
          sprintListQuery.refetch(),
        ]);
      },
    },
    onLoadMoreKanbanTasks: () => {
      if (kanbanTasksQuery.hasNextPage && !kanbanTasksQuery.isFetchingNextPage) {
        void kanbanTasksQuery.fetchNextPage();
      }
    },
    onIssuePageChange: setIssuePage,
    onIssuePageSizeChange: (value: number) => {
      setIssuePageSize(value);
      setIssuePage(TASK_ISSUE_DEFAULT_PAGE);
    },
    onIssueViewModeChange: setIssueViewMode,
    onDragTaskIdChange: setDragTaskId,
    onSearchChange: (value: string) => {
      setSearch(value);
      setIssuePage(TASK_ISSUE_DEFAULT_PAGE);
    },
    onStatusFilterChange: (value: "ALL" | string) => {
      setStatusFilter(value);
      setIssuePage(TASK_ISSUE_DEFAULT_PAGE);
    },
    onPriorityFilterChange: (value: "ALL" | TaskPriority) => {
      setPriorityFilter(value);
      setIssuePage(TASK_ISSUE_DEFAULT_PAGE);
    },
    onAssigneeFilterChange: (value: string) => {
      setAssigneeFilter(value);
      setIssuePage(TASK_ISSUE_DEFAULT_PAGE);
    },
    onSortByChange: (value: "LATEST" | "PRIORITY" | "BACKLOG_ORDER") => {
      setSortBy(value);
      setIssuePage(TASK_ISSUE_DEFAULT_PAGE);
    },
    onTaskChangeStatus: handleStatusChange,
  };
}

async function invalidateTaskQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
) {
  await queryClient.invalidateQueries({
    queryKey: [TASK_PROJECT_TASKS_QUERY_KEY, projectId],
  });
  await queryClient.invalidateQueries({
    queryKey: [TASK_PROJECT_KANBAN_TASKS_QUERY_KEY, projectId],
  });
}

function applyIssueFiltersAndSort({
  tasks,
  statusFilter,
  assigneeFilter,
  priorityFilter,
  search,
  sortBy,
  taskPriorityByCode,
  resolveUserLabel,
}: {
  tasks: TaskItem[];
  statusFilter: "ALL" | string;
  assigneeFilter: string;
  priorityFilter: "ALL" | TaskPriority;
  search: string;
  sortBy: "LATEST" | "PRIORITY" | "BACKLOG_ORDER";
  taskPriorityByCode: Map<string, { order: number }>;
  resolveUserLabel: (value: string | null | undefined) => string;
}) {
  let nextTasks = [...tasks];

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
}

function mapTaskSort(sortBy: "LATEST" | "PRIORITY" | "BACKLOG_ORDER") {
  if (sortBy === "PRIORITY") {
    return {
      sortBy: "PRIORITY" as const,
      sortDirection: "DESC" as const,
    };
  }

  if (sortBy === "BACKLOG_ORDER") {
    return {
      sortBy: "BACKLOG_ORDER" as const,
      sortDirection: "ASC" as const,
    };
  }

  return {
    sortBy: "UPDATED_AT" as const,
    sortDirection: "DESC" as const,
  };
}
