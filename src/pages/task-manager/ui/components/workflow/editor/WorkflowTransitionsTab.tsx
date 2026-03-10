import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Delete02Icon,
  LinkSquare02Icon,
} from "@hugeicons/core-free-icons";
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
import { Separator } from "@/shared/ui/separator";
import { TabsContent } from "@/shared/ui/tabs";
import type { WorkflowDetail } from "../../../../model/workflowManagement.types";
import { StatusChip } from "../WorkflowUiPrimitives";

type WorkflowTransitionsTabProps = {
  workflow: WorkflowDetail;
  submitting: boolean;
  fromStatusCode: string;
  toStatusCode: string;
  onFromStatusChange: (value: string) => void;
  onToStatusChange: (value: string) => void;
  onCreateTransition: (
    workflowId: string,
    fromStatusCode: string,
    toStatusCode: string,
  ) => Promise<void>;
  onDeleteTransition: (workflowId: string, transitionId: string) => Promise<void>;
};

export function WorkflowTransitionsTab({
  workflow,
  submitting,
  fromStatusCode,
  toStatusCode,
  onFromStatusChange,
  onToStatusChange,
  onCreateTransition,
  onDeleteTransition,
}: WorkflowTransitionsTabProps) {
  const appToast = useAppToast();
  const { t } = useI18n();

  const statusMap = new Map(
    workflow.statuses.map((status) => [status.code, status]),
  );

  return (
    <TabsContent value="transitions" className="space-y-3 pt-2">
      <div className="rounded-md border border-dashed bg-muted/20 p-3">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto]">
          <Select
            value={fromStatusCode}
            onValueChange={onFromStatusChange}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t("tasks.workflow.editor.fromStatus")}
              />
            </SelectTrigger>
            <SelectContent>
              {workflow.statuses.map((status) => (
                <SelectItem key={status.code} value={status.code}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid place-content-center text-muted-foreground">
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </div>

          <Select
            value={toStatusCode}
            onValueChange={onToStatusChange}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("tasks.workflow.editor.toStatus")} />
            </SelectTrigger>
            <SelectContent>
              {workflow.statuses.map((status) => (
                <SelectItem key={status.code} value={status.code}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            disabled={submitting}
            onClick={async () => {
              if (!fromStatusCode || !toStatusCode) return;
              if (fromStatusCode === toStatusCode) {
                appToast.warning({
                  title: t("tasks.workflow.toast.invalidTransitionTitle"),
                  description: t(
                    "tasks.workflow.toast.invalidTransitionDescription",
                  ),
                });
                return;
              }

              try {
                await onCreateTransition(
                  workflow.id,
                  fromStatusCode,
                  toStatusCode,
                );
              } catch (error) {
                appToast.error({
                  title: t("tasks.workflow.toast.requestFailedTitle"),
                  description:
                    error instanceof Error ? error.message : undefined,
                });
              }
            }}
          >
            <HugeiconsIcon icon={LinkSquare02Icon} className="mr-2 size-4" />
            {t("tasks.common.add")}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-1">
        {workflow.transitions.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("tasks.workflow.editor.emptyTransitions")}
          </div>
        ) : (
          workflow.transitions.map((transition) => {
            const fromStatus = statusMap.get(transition.fromStatusCode);
            const toStatus = statusMap.get(transition.toStatusCode);

            return (
              <div
                key={transition.id}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <StatusChip
                    color={fromStatus?.color || "#6B7280"}
                    name={fromStatus?.name || transition.fromStatusCode}
                    code={transition.fromStatusCode}
                  />
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-3.5 text-muted-foreground"
                  />
                  <StatusChip
                    color={toStatus?.color || "#6B7280"}
                    name={toStatus?.name || transition.toStatusCode}
                    code={transition.toStatusCode}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={submitting}
                  className="size-7 hover:bg-destructive/10 hover:text-destructive"
                  onClick={async () => {
                    try {
                      await onDeleteTransition(workflow.id, transition.id);
                    } catch (error) {
                      appToast.error({
                        title: t("tasks.workflow.toast.requestFailedTitle"),
                        description:
                          error instanceof Error ? error.message : undefined,
                      });
                    }
                  }}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                </Button>
              </div>
            );
          })
        )}
      </div>
    </TabsContent>
  );
}
