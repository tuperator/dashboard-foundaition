import { useNavigate } from "react-router-dom";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { getTaskProjectDetailsRoute } from "@/shared/constants/routes";
import type { TaskProject } from "../../../model/types";

type TaskProjectStats = {
  total: number;
  done: number;
  inProgress: number;
  updatedAt: number;
};

type TaskProjectsTableProps = {
  projects: TaskProject[];
  taskStatsByProject: Map<string, TaskProjectStats>;
  resolveUserLabel: (value: string | null | undefined) => string;
};

export function TaskProjectsTable({
  projects,
  taskStatsByProject,
  resolveUserLabel,
}: TaskProjectsTableProps) {
  const { t, tp } = useI18n();
  const navigate = useNavigate();

  return (
    <section className="bg-card rounded-2xl border p-3">
      <div className="text-muted-foreground mb-2 grid grid-cols-[minmax(0,1.6fr)_100px_160px_140px_100px_120px] gap-2 px-2 py-1 text-xs font-medium">
        <span>{t("tasks.projects.table.project")}</span>
        <span>{t("tasks.projects.table.type")}</span>
        <span>{t("tasks.projects.table.owner")}</span>
        <span>{t("tasks.projects.table.membersTasks")}</span>
        <span>{t("tasks.projects.table.progress")}</span>
        <span>{t("tasks.projects.table.action")}</span>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {t("tasks.projects.emptyFiltered")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => {
            const stats = taskStatsByProject.get(project.id) || {
              total: 0,
              done: 0,
              inProgress: 0,
              updatedAt: 0,
            };
            const completion =
              stats.total === 0
                ? 0
                : Math.round((stats.done / stats.total) * 100);

            return (
              <article
                key={project.id}
                className="from-card to-muted/10 hover:border-primary/40 hover:bg-primary/[0.03] grid grid-cols-[minmax(0,1.6fr)_100px_160px_140px_100px_120px] items-center gap-2 rounded-xl border bg-gradient-to-r px-2 py-2.5 transition"
              >
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="text-foreground truncate text-sm font-semibold">
                      {project.name}
                    </h2>
                    <Badge className="bg-primary/10 text-primary h-5 rounded-full px-2 text-[11px]">
                      {project.key}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground truncate text-xs">
                    {project.description}
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className="h-6 w-fit rounded-full px-2"
                >
                  {project.type}
                </Badge>

                <span className="text-foreground truncate text-sm">
                  {resolveUserLabel(project.owner)}
                </span>

                <div className="text-sm">
                  <p className="text-foreground font-medium">
                    {tp("tasks.projects.stat.members", {
                      count: new Set([project.owner, ...project.members]).size,
                    })}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {tp("tasks.projects.stat.tasks", { count: stats.total })}
                  </p>
                </div>

                <div>
                  <p className="text-foreground mb-1 text-xs font-medium">
                    {completion}%
                  </p>
                  <Progress value={completion} className="h-1.5" />
                </div>

                <Button
                  size="sm"
                  className="w-fit"
                  onClick={() =>
                    navigate(getTaskProjectDetailsRoute(project.id))
                  }
                >
                  {t("tasks.common.details")}
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
