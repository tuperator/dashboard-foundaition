import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { TASK_TABLE_MIN_WIDTH_CLASS } from "../../../model/constants";
import {
  type SprintItem,
  type TaskItem,
  type TaskProject,
} from "../../../model/types";
import { TaskStatusBadge } from "../TaskStatusBadge";
import type { Dispatch, SetStateAction } from "react";

export interface TaskProjectDetailsBacklogTabProps {
  project: TaskProject;
  backlogTasks: TaskItem[];
  availableSprintTargets: SprintItem[];
  activeSprint: SprintItem | null;
  backlogSprintTarget: Record<string, string>;
  setBacklogSprintTarget: Dispatch<SetStateAction<Record<string, string>>>;
  onMoveBacklogTask: (
    projectId: string,
    taskId: string,
    direction: "up" | "down",
  ) => void;
  onAddIssueToSprint: (taskId: string, sprintId: string) => void;
}

export function TaskProjectDetailsBacklogTab({
  project,
  backlogTasks,
  availableSprintTargets,
  activeSprint,
  backlogSprintTarget,
  setBacklogSprintTarget,
  onMoveBacklogTask,
  onAddIssueToSprint,
}: TaskProjectDetailsBacklogTabProps) {
  const { t, tp } = useI18n();
  const appToast = useAppToast();

  return (
    <section className="bg-card rounded-2xl border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-foreground text-sm font-semibold">
            Backlog management
          </p>
          <p className="text-muted-foreground text-xs">
            {t("tasks.projectDetails.backlogDescription")}
          </p>
        </div>
        <Badge variant="outline" className="h-6 rounded-full">
          {tp("tasks.projectDetails.backlogCount", {
            count: backlogTasks.length,
          })}
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
              <TableCell
                colSpan={6}
                className="text-muted-foreground py-8 text-center"
              >
                {t("tasks.projectDetails.emptyBacklog")}
              </TableCell>
            </TableRow>
          ) : (
            backlogTasks.map((task, index) => (
              <TableRow key={task.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <p className="text-foreground font-medium">{task.title}</p>
                  <p className="text-muted-foreground line-clamp-1 text-xs">
                    {task.description}
                  </p>
                </TableCell>
                <TableCell>{task.priority}</TableCell>
                <TableCell>
                  <TaskStatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        onMoveBacklogTask(project.id, task.id, "up")
                      }
                      disabled={index === 0}
                    >
                      <HugeiconsIcon icon={ArrowUp01Icon} className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        onMoveBacklogTask(project.id, task.id, "down")
                      }
                      disabled={index === backlogTasks.length - 1}
                    >
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="size-4"
                      />
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
                        <SelectItem value="__AUTO__">
                          {t("tasks.projectDetails.sprintTargetAuto")}
                        </SelectItem>
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
                            ? availableSprintTargets.find(
                                (sprint) => sprint.id === selected,
                              )
                            : activeSprint ||
                              availableSprintTargets.find(
                                (sprint) => sprint.status === "PLANNED",
                              );

                        if (!targetSprint) {
                          appToast.warning({
                            title: t(
                              "tasks.projectDetails.toast.noSprintAvailableTitle",
                            ),
                            description: t(
                              "tasks.projectDetails.toast.noSprintAvailableDescription",
                            ),
                          });
                          return;
                        }

                        onAddIssueToSprint(task.id, targetSprint.id);
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
  );
}
