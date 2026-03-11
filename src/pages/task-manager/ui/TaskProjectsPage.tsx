import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/widgets/app-shell";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/shared/ui/pagination";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";
import {
  TASK_PROJECT_DEFAULT_PAGE,
  TASK_PROJECT_DEFAULT_PAGE_SIZE,
  TASK_PROJECT_MAX_VISIBLE_PAGES,
  TASK_PROJECT_PAGE_SIZE_OPTIONS,
} from "../model/constants";
import {
  createProject as createProjectApi,
  listProjects,
} from "../model/projectManagement.api";
import { useTaskManagerUsers } from "../model/useTaskManagerUsers";
import ProjectDialog from "./components/ProjectDialog";
import { TaskProjectsHeader } from "./components/projects/TaskProjectsHeader";
import { TaskProjectsTable } from "./components/projects/TaskProjectsTable";

type SortMode = "UPDATED_AT" | "NAME" | "PROGRESS";

const TASK_PROJECTS_QUERY_KEYS = {
  list: "task-projects",
} as const;

export function TaskProjectsPage() {
  const { t, tp } = useI18n();
  const appToast = useAppToast();
  const queryClient = useQueryClient();
  const { companyId, myProfileQuery, userOptions, resolveUserLabel } =
    useTaskManagerUsers();

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "SCRUM" | "KANBAN">(
    "ALL",
  );
  const [ownerFilter, setOwnerFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortMode>("UPDATED_AT");
  const [page, setPage] = useState(TASK_PROJECT_DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(TASK_PROJECT_DEFAULT_PAGE_SIZE);

  const ownerOptions = useMemo(
    () =>
      userOptions
        .map((user) => ({ value: user.id, label: user.label }))
        .sort((left, right) => left.label.localeCompare(right.label)),
    [userOptions],
  );

  const projectFilters = useMemo(
    () => ({
      page,
      size: pageSize,
      search: search.trim() || undefined,
      type: typeFilter === "ALL" ? null : typeFilter,
      ownerId: ownerFilter === "ALL" ? null : ownerFilter,
      sortBy,
      sortDirection: sortBy === "NAME" ? ("ASC" as const) : ("DESC" as const),
    }),
    [ownerFilter, page, pageSize, search, sortBy, typeFilter],
  );

  const projectsQuery = useQuery({
    queryKey: [TASK_PROJECTS_QUERY_KEYS.list, projectFilters],
    queryFn: () => listProjects(projectFilters),
    enabled: Boolean(companyId),
  });

  const createProjectMutation = useMutation({
    mutationFn: createProjectApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [TASK_PROJECTS_QUERY_KEYS.list],
      });
    },
  });

  const projectRows = useMemo(
    () => projectsQuery.data?.items || [],
    [projectsQuery.data?.items],
  );
  const total = projectsQuery.data?.total ?? 0;
  const totalPages =
    projectsQuery.data?.totalPages ??
    Math.max(1, Math.ceil((projectsQuery.data?.total ?? 0) / pageSize));
  const visiblePages = useMemo(() => {
    const startIndex = Math.max(
      0,
      page - Math.ceil(TASK_PROJECT_MAX_VISIBLE_PAGES / 2),
    );

    return Array.from({ length: totalPages }, (_, index) => index + 1).slice(
      startIndex,
      startIndex + TASK_PROJECT_MAX_VISIBLE_PAGES,
    );
  }, [page, totalPages]);
  const rowStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rowEnd = Math.min(page * pageSize, total);

  return (
    <AppShell>
      <section className="space-y-4">
        <TaskProjectsHeader
          search={search}
          typeFilter={typeFilter}
          ownerFilter={ownerFilter}
          sortBy={sortBy}
          ownerOptions={ownerOptions}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(TASK_PROJECT_DEFAULT_PAGE);
          }}
          onTypeFilterChange={(value) => {
            setTypeFilter(value);
            setPage(TASK_PROJECT_DEFAULT_PAGE);
          }}
          onOwnerFilterChange={(value) => {
            setOwnerFilter(value);
            setPage(TASK_PROJECT_DEFAULT_PAGE);
          }}
          onSortChange={(value) => {
            setSortBy(value);
            setPage(TASK_PROJECT_DEFAULT_PAGE);
          }}
          onCreateProject={() => setCreateProjectOpen(true)}
        />

        {projectsQuery.isLoading ? (
          <div className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 rounded-2xl border border-dashed text-sm">
            <Spinner className="size-4" />
            {t("tasks.projects.table.loading")}
          </div>
        ) : projectsQuery.isError ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 text-center">
            <p className="text-sm font-medium">
              {t("tasks.projects.toast.loadingFailedTitle")}
            </p>
            <p className="text-muted-foreground text-sm">
              {projectsQuery.error instanceof Error
                ? projectsQuery.error.message
                : undefined}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void projectsQuery.refetch()}
            >
              {t("tasks.common.retry")}
            </Button>
          </div>
        ) : (
          <>
            <TaskProjectsTable
              projects={projectRows}
              resolveUserLabel={resolveUserLabel}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span>{t("tasks.projects.pagination.rowsPerPage")}</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(TASK_PROJECT_DEFAULT_PAGE);
                  }}
                >
                  <SelectTrigger size="sm" className="w-[88px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PROJECT_PAGE_SIZE_OPTIONS.map((value) => (
                      <SelectItem key={value} value={String(value)}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>
                  {tp("tasks.projects.pagination.range", {
                    start: rowStart,
                    end: rowEnd,
                    total,
                  })}
                </span>
              </div>

              <Pagination className="mx-0 w-auto justify-start">
                <PaginationContent>
                  {visiblePages.map((value) => (
                    <PaginationItem key={value}>
                      <PaginationLink
                        href="#"
                        size="icon-sm"
                        isActive={value === page}
                        onClick={(event) => {
                          event.preventDefault();
                          setPage(value);
                        }}
                      >
                        {value}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </section>

      <ProjectDialog
        key={`create-project-${createProjectOpen ? "open" : "closed"}`}
        open={createProjectOpen}
        mode="create"
        project={null}
        userOptions={userOptions}
        onOpenChange={setCreateProjectOpen}
        onSubmit={async (payload) => {
          const profile = myProfileQuery.data;
          if (!profile?.id || !companyId) {
            appToast.warning({
              title: t("tasks.projects.toast.loadingFailedTitle"),
              description: t("tasks.projects.toast.profileNotReady"),
            });
            return;
          }

          try {
            await createProjectMutation.mutateAsync({
              ...payload,
              createdById: profile.id,
              companyId,
            });
            setPage(TASK_PROJECT_DEFAULT_PAGE);
            appToast.success({
              title: t("tasks.projects.toast.projectCreatedTitle"),
              description: tp("tasks.projects.toast.projectCreatedDescription", {
                name: payload.name,
              }),
            });
            setCreateProjectOpen(false);
          } catch (error) {
            appToast.error({
              title: t("tasks.projects.toast.loadingFailedTitle"),
              description: error instanceof Error ? error.message : undefined,
            });
          }
        }}
      />
    </AppShell>
  );
}
