import { useMemo, useState } from "react";
import { AppShell } from "@/widgets/app-shell";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { useTaskManagerState } from "../model/useTaskManagerState";
import { ProjectDialog } from "./components/ProjectDialog";
import { TaskProjectsHeader } from "./components/projects/TaskProjectsHeader";
import { TaskProjectsTable } from "./components/projects/TaskProjectsTable";

type SortMode = "UPDATED" | "NAME" | "PROGRESS";

export function TaskProjectsPage() {
  const { t, tp } = useI18n();
  const appToast = useAppToast();
  const { projects, tasks, createProject } = useTaskManagerState();

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "SCRUM" | "KANBAN">(
    "ALL",
  );
  const [ownerFilter, setOwnerFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortMode>("UPDATED");

  const taskStatsByProject = useMemo(() => {
    const stats = new Map<
      string,
      { total: number; done: number; inProgress: number; updatedAt: number }
    >();

    for (const task of tasks) {
      const current = stats.get(task.projectId) || {
        total: 0,
        done: 0,
        inProgress: 0,
        updatedAt: 0,
      };

      current.total += 1;
      if (task.status === "DONE") {
        current.done += 1;
      }
      if (task.status === "IN_PROGRESS") {
        current.inProgress += 1;
      }
      current.updatedAt = Math.max(
        current.updatedAt,
        Date.parse(task.updatedAt) || 0,
      );
      stats.set(task.projectId, current);
    }

    return stats;
  }, [tasks]);

  const ownerOptions = useMemo(
    () => Array.from(new Set(projects.map((project) => project.owner))).sort(),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    let nextProjects = [...projects];

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      nextProjects = nextProjects.filter((project) =>
        `${project.name} ${project.key} ${project.description} ${project.owner}`
          .toLowerCase()
          .includes(keyword),
      );
    }

    if (typeFilter !== "ALL") {
      nextProjects = nextProjects.filter(
        (project) => project.type === typeFilter,
      );
    }

    if (ownerFilter !== "ALL") {
      nextProjects = nextProjects.filter(
        (project) => project.owner === ownerFilter,
      );
    }

    if (sortBy === "NAME") {
      return nextProjects.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "PROGRESS") {
      return nextProjects.sort((a, b) => {
        const aStat = taskStatsByProject.get(a.id);
        const bStat = taskStatsByProject.get(b.id);
        const aProgress =
          aStat && aStat.total > 0 ? aStat.done / aStat.total : 0;
        const bProgress =
          bStat && bStat.total > 0 ? bStat.done / bStat.total : 0;
        return bProgress - aProgress;
      });
    }

    return nextProjects.sort((a, b) => {
      const aUpdatedAt = taskStatsByProject.get(a.id)?.updatedAt || 0;
      const bUpdatedAt = taskStatsByProject.get(b.id)?.updatedAt || 0;
      return bUpdatedAt - aUpdatedAt;
    });
  }, [ownerFilter, projects, search, sortBy, taskStatsByProject, typeFilter]);

  return (
    <AppShell>
      <section className="space-y-4">
        <TaskProjectsHeader
          search={search}
          typeFilter={typeFilter}
          ownerFilter={ownerFilter}
          sortBy={sortBy}
          ownerOptions={ownerOptions}
          onSearchChange={setSearch}
          onTypeFilterChange={setTypeFilter}
          onOwnerFilterChange={setOwnerFilter}
          onSortChange={setSortBy}
          onCreateProject={() => setCreateProjectOpen(true)}
        />

        <TaskProjectsTable
          projects={filteredProjects}
          taskStatsByProject={taskStatsByProject}
        />
      </section>

      <ProjectDialog
        key={`create-project-${createProjectOpen ? "open" : "closed"}`}
        open={createProjectOpen}
        mode="create"
        project={null}
        onOpenChange={setCreateProjectOpen}
        onSubmit={(payload) => {
          createProject(payload);
          appToast.success({
            title: t("tasks.projects.toast.projectCreatedTitle"),
            description: tp("tasks.projects.toast.projectCreatedDescription", {
              name: payload.name,
            }),
          });
          setCreateProjectOpen(false);
        }}
      />
    </AppShell>
  );
}
