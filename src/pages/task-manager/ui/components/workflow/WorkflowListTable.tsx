import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { IssueTypeTag } from "./WorkflowUiPrimitives";
import type { WorkflowRow } from "./types";

type WorkflowListTableProps = {
  rows: WorkflowRow[];
  onManage: (workflowId: string) => void;
  onDelete: (workflowId: string) => void;
};

export function WorkflowListTable({
  rows,
  onManage,
  onDelete,
}: WorkflowListTableProps) {
  const { t } = useI18n();

  return (
    <section className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/25">
            <TableHead>{t("tasks.workflow.table.workflow")}</TableHead>
            <TableHead>{t("tasks.workflow.table.issueTypes")}</TableHead>
            <TableHead>{t("tasks.workflow.table.statuses")}</TableHead>
            <TableHead>{t("tasks.workflow.table.transitions")}</TableHead>
            <TableHead>{t("tasks.workflow.table.projects")}</TableHead>
            <TableHead className="w-[220px]">
              {t("tasks.workflow.table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground py-10 text-center text-sm"
              >
                {t("tasks.workflow.table.empty")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell>
                  <p className="text-foreground text-sm font-semibold">
                    {workflow.name}
                  </p>
                  <p className="text-muted-foreground line-clamp-1 text-xs">
                    {workflow.description || t("tasks.common.noDescription")}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {workflow.issueTypes.map((issueType) => (
                      <IssueTypeTag
                        key={issueType}
                        issueType={issueType}
                        active
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="h-6 rounded-full">
                    {workflow.statusCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="h-6 rounded-full">
                    {workflow.transitionCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {workflow.assignedProjects.length === 0 ? (
                      <span className="text-muted-foreground text-xs">
                        {t("tasks.common.none")}
                      </span>
                    ) : (
                      workflow.assignedProjects.slice(0, 3).map((project) => (
                        <Badge
                          key={project.id}
                          variant="outline"
                          className="h-6 rounded-full"
                        >
                          {project.key}
                        </Badge>
                      ))
                    )}
                    {workflow.assignedProjects.length > 3 ? (
                      <Badge variant="outline" className="h-6 rounded-full">
                        +{workflow.assignedProjects.length - 3}
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onManage(workflow.id)}
                    >
                      <HugeiconsIcon icon={Edit02Icon} />
                      {t("tasks.workflow.button.manage")}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(workflow.id)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} />
                      {t("tasks.common.delete")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}
