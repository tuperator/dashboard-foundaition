import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleHalfDotIcon } from "@hugeicons/core-free-icons";
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
  TASK_WORKFLOW_DEFAULT_PAGE,
  TASK_WORKFLOW_MAX_VISIBLE_PAGES,
  TASK_WORKFLOW_PAGE_SIZE_OPTIONS,
} from "../model/constants";
import { useTaskManagerState } from "../model/useTaskManagerState";
import { useWorkflowManagement } from "../model/useWorkflowManagement";
import { WorkflowCreateDialog } from "./components/workflow/WorkflowCreateDialog";
import { WorkflowEditorDialog } from "./components/workflow/WorkflowEditorDialog";
import { WorkflowListTable } from "./components/workflow/WorkflowListTable";
import {
  EMPTY_WORKFLOW_CREATE_FORM,
  type WorkflowCreateForm,
} from "./components/workflow/types";

export function TaskWorkflowManagerPage() {
  const { t, tp } = useI18n();
  const appToast = useAppToast();
  const { projects } = useTaskManagerState();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<WorkflowCreateForm>(
    EMPTY_WORKFLOW_CREATE_FORM,
  );
  const [manageWorkflowId, setManageWorkflowId] = useState<string | null>(null);

  const {
    workflowsQuery,
    workflowDetailQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    createWorkflowMutation,
    updateWorkflowMutation,
    deleteWorkflowMutation,
    assignProjectsMutation,
    createStatusMutation,
    updateStatusMutation,
    deleteStatusMutation,
    createTransitionMutation,
    deleteTransitionMutation,
    isMutating,
  } = useWorkflowManagement(manageWorkflowId);

  const workflowRows = useMemo(
    () => workflowsQuery.data?.items || [],
    [workflowsQuery.data],
  );
  const visiblePages = useMemo(() => {
    const startIndex = Math.max(
      0,
      page - Math.ceil(TASK_WORKFLOW_MAX_VISIBLE_PAGES / 2),
    );

    return Array.from({ length: totalPages }, (_, index) => index + 1).slice(
      startIndex,
      startIndex + TASK_WORKFLOW_MAX_VISIBLE_PAGES,
    );
  }, [page, totalPages]);
  const rowStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rowEnd = Math.min(page * pageSize, total);

  const workflowToManage = workflowDetailQuery.data || null;

  const handleMutationError = (error: unknown) => {
    appToast.error({
      title: t("tasks.workflow.toast.requestFailedTitle"),
      description: error instanceof Error ? error.message : undefined,
    });
  };

  return (
    <AppShell>
      <section className="space-y-4">
        <header className="bg-card rounded-2xl border p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-foreground text-xl font-semibold">
                {t("tasks.workflow.pageTitle")}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {t("tasks.workflow.pageDescription")}
              </p>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              disabled={createWorkflowMutation.isPending}
            >
              <HugeiconsIcon icon={AddCircleHalfDotIcon} />
              {t("tasks.workflow.newWorkflow")}
            </Button>
          </div>

          {workflowsQuery.isLoading ? (
            <div className="text-muted-foreground flex min-h-40 items-center justify-center gap-2 rounded-xl border border-dashed text-sm">
              <Spinner className="size-4" />
              {t("tasks.workflow.table.loading")}
            </div>
          ) : workflowsQuery.isError ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 text-center">
              <p className="text-sm font-medium">
                {t("tasks.workflow.toast.loadingFailedTitle")}
              </p>
              <p className="text-muted-foreground text-sm">
                {workflowsQuery.error instanceof Error
                  ? workflowsQuery.error.message
                  : undefined}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void workflowsQuery.refetch()}
              >
                {t("tasks.common.retry")}
              </Button>
            </div>
          ) : (
            <>
              <WorkflowListTable
                rows={workflowRows}
                onManage={setManageWorkflowId}
                onDelete={async (workflowId) => {
                  const workflow = workflowRows.find(
                    (item) => item.id === workflowId,
                  );
                  if (!workflow) {
                    return;
                  }

                  if (workflowRows.length <= 1 && total <= 1) {
                    appToast.warning({
                      title: t("tasks.workflow.toast.cannotDeleteTitle"),
                      description: t(
                        "tasks.workflow.toast.cannotDeleteDescription",
                      ),
                    });
                    return;
                  }

                  try {
                    await deleteWorkflowMutation.mutateAsync(workflowId);
                    if (
                      workflowRows.length === 1 &&
                      page > TASK_WORKFLOW_DEFAULT_PAGE
                    ) {
                      setPage(page - 1);
                    }
                    if (manageWorkflowId === workflowId) {
                      setManageWorkflowId(null);
                    }

                    appToast.success({
                      title: t("tasks.workflow.toast.deletedTitle"),
                      description: tp(
                        "tasks.workflow.toast.deletedDescription",
                        {
                          name: workflow.name,
                        },
                      ),
                    });
                  } catch (error) {
                    handleMutationError(error);
                  }
                }}
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span>{t("tasks.workflow.pagination.rowsPerPage")}</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setPage(TASK_WORKFLOW_DEFAULT_PAGE);
                    }}
                  >
                    <SelectTrigger size="sm" className="w-[88px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_WORKFLOW_PAGE_SIZE_OPTIONS.map((value) => (
                        <SelectItem key={value} value={String(value)}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>
                    {tp("tasks.workflow.pagination.range", {
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
        </header>
      </section>

      <WorkflowCreateDialog
        open={createDialogOpen}
        form={createForm}
        submitting={createWorkflowMutation.isPending}
        onOpenChange={setCreateDialogOpen}
        onFormChange={setCreateForm}
        onSubmit={async () => {
          if (!createForm.name.trim()) {
            appToast.warning({
              title: t("tasks.workflow.toast.invalidTitle"),
              description: t("tasks.workflow.toast.invalidDescription"),
            });
            return;
          }

          try {
            await createWorkflowMutation.mutateAsync({
              name: createForm.name,
              description: createForm.description,
              issueTypes: createForm.issueTypes,
            });
            setPage(TASK_WORKFLOW_DEFAULT_PAGE);
            setCreateDialogOpen(false);
            setCreateForm(EMPTY_WORKFLOW_CREATE_FORM);
            appToast.success({
              title: t("tasks.workflow.toast.createdTitle"),
              description: tp("tasks.workflow.toast.createdDescription", {
                name: createForm.name,
              }),
            });
          } catch (error) {
            handleMutationError(error);
          }
        }}
      />

      {manageWorkflowId && workflowDetailQuery.isLoading ? (
        <div className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-card flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-sm">
            <Spinner className="size-4" />
            {t("tasks.workflow.table.loading")}
          </div>
        </div>
      ) : null}

      {manageWorkflowId && workflowDetailQuery.isError ? (
        <div className="bg-background/60 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl border p-5 shadow-lg">
            <h2 className="text-base font-semibold">
              {t("tasks.workflow.toast.loadingFailedTitle")}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {workflowDetailQuery.error instanceof Error
                ? workflowDetailQuery.error.message
                : undefined}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void workflowDetailQuery.refetch()}
              >
                {t("tasks.common.retry")}
              </Button>
              <Button size="sm" onClick={() => setManageWorkflowId(null)}>
                {t("tasks.common.close")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {workflowToManage ? (
        <WorkflowEditorDialog
          key={workflowToManage.id}
          open
          submitting={isMutating}
          workflow={workflowToManage}
          projects={projects}
          onOpenChange={(open) => {
            if (!open) {
              setManageWorkflowId(null);
            }
          }}
          onSaveMetadata={(workflowId, payload) =>
            updateWorkflowMutation
              .mutateAsync({ workflowId, payload })
              .then(() => undefined)
          }
          onAssignProjects={(workflowId, projectIds) =>
            assignProjectsMutation
              .mutateAsync({ workflowId, projectIds })
              .then(() => undefined)
          }
          onCreateStatus={(workflowId, payload) =>
            createStatusMutation
              .mutateAsync({ workflowId, payload })
              .then(() => undefined)
          }
          onUpdateStatus={(workflowId, statusId, payload) =>
            updateStatusMutation
              .mutateAsync({ workflowId, statusId, payload })
              .then(() => undefined)
          }
          onDeleteStatus={(workflowId, statusId) =>
            deleteStatusMutation
              .mutateAsync({ workflowId, statusId })
              .then(() => undefined)
          }
          onCreateTransition={(workflowId, fromStatusCode, toStatusCode) =>
            createTransitionMutation
              .mutateAsync({
                workflowId,
                payload: { fromStatusCode, toStatusCode },
              })
              .then(() => undefined)
          }
          onDeleteTransition={(workflowId, transitionId) =>
            deleteTransitionMutation
              .mutateAsync({ workflowId, transitionId })
              .then(() => undefined)
          }
        />
      ) : null}
    </AppShell>
  );
}
