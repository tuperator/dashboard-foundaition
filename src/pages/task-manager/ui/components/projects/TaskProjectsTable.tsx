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
};

export function TaskProjectsTable({
  projects,
  taskStatsByProject,
}: TaskProjectsTableProps) {
  const { t, tp } = useI18n();
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border bg-card p-3">
      <div className="mb-2 grid grid-cols-[minmax(0,1.6fr)_100px_160px_140px_100px_120px] gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
        <span>{t("tasks.projects.table.project")}</span>
        <span>{t("tasks.projects.table.type")}</span>
        <span>{t("tasks.projects.table.owner")}</span>
        <span>{t("tasks.projects.table.membersTasks")}</span>
        <span>{t("tasks.projects.table.progress")}</span>
        <span>{t("tasks.projects.table.action")}</span>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
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
              stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

            return (
              <article
                key={project.id}
                className="grid grid-cols-[minmax(0,1.6fr)_100px_160px_140px_100px_120px] items-center gap-2 rounded-xl border bg-gradient-to-r from-card to-muted/10 px-2 py-2.5 transition hover:border-primary/40 hover:bg-primary/[0.03]"
              >
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="truncate text-sm font-semibold text-foreground">
                      {project.name}
                    </h2>
                    <Badge className="h-5 rounded-full bg-primary/10 px-2 text-[11px] text-primary">
                      {project.key}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {project.description}
                  </p>
                </div>

                <Badge variant="outline" className="h-6 w-fit rounded-full px-2">
                  {project.type}
                </Badge>

                <span className="truncate text-sm text-foreground">{project.owner}</span>

                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {tp("tasks.projects.stat.members", {
                      count: project.members.length,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tp("tasks.projects.stat.tasks", { count: stats.total })}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-foreground">{completion}%</p>
                  <Progress value={completion} className="h-1.5" />
                </div>

                <Button
                  size="sm"
                  className="w-fit"
                  onClick={() => navigate(getTaskProjectDetailsRoute(project.id))}
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
