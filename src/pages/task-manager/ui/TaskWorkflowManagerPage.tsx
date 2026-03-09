import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleHalfDotIcon } from "@hugeicons/core-free-icons";
import { AppShell } from "@/widgets/app-shell";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { useAppToast } from "@/shared/providers/toast/ToastProvider";
import { Button } from "@/shared/ui/button";
import { useTaskManagerState } from "../model/useTaskManagerState";
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
  const {
    projects,
    workflowTemplates,
    workflowIdByProject,
    createWorkflowTemplate,
    deleteWorkflowTemplate,
    updateWorkflowTemplate,
    assignWorkflowToProjects,
    createWorkflowStatus,
    updateWorkflowStatus,
    deleteWorkflowStatus,
    createWorkflowTransition,
    deleteWorkflowTransition,
  } = useTaskManagerState();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<WorkflowCreateForm>(
    EMPTY_WORKFLOW_CREATE_FORM,
  );
  const [manageWorkflowId, setManageWorkflowId] = useState<string | null>(null);

  const workflowRows = useMemo(
    () =>
      workflowTemplates.map((workflow) => ({
        workflow,
        assignedProjects: projects.filter(
          (project) => workflowIdByProject[project.id] === workflow.id,
        ),
      })),
    [projects, workflowIdByProject, workflowTemplates],
  );

  const workflowToManage = useMemo(
    () =>
      workflowTemplates.find((workflow) => workflow.id === manageWorkflowId) ||
      null,
    [manageWorkflowId, workflowTemplates],
  );

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
            <Button onClick={() => setCreateDialogOpen(true)}>
              <HugeiconsIcon icon={AddCircleHalfDotIcon} />
              {t("tasks.workflow.newWorkflow")}
            </Button>
          </div>

          <WorkflowListTable
            rows={workflowRows}
            onManage={setManageWorkflowId}
            onDelete={(workflowId) => {
              const workflow = workflowTemplates.find(
                (item) => item.id === workflowId,
              );
              if (!workflow) {
                return;
              }

              if (workflowTemplates.length <= 1) {
                appToast.warning({
                  title: t("tasks.workflow.toast.cannotDeleteTitle"),
                  description: t(
                    "tasks.workflow.toast.cannotDeleteDescription",
                  ),
                });
                return;
              }

              deleteWorkflowTemplate(workflowId);
              if (manageWorkflowId === workflowId) {
                setManageWorkflowId(null);
              }

              appToast.success({
                title: t("tasks.workflow.toast.deletedTitle"),
                description: tp("tasks.workflow.toast.deletedDescription", {
                  name: workflow.name,
                }),
              });
            }}
          />
        </header>
      </section>

      <WorkflowCreateDialog
        open={createDialogOpen}
        form={createForm}
        onOpenChange={setCreateDialogOpen}
        onFormChange={setCreateForm}
        onSubmit={() => {
          if (!createForm.name.trim()) {
            appToast.warning({
              title: t("tasks.workflow.toast.invalidTitle"),
              description: t("tasks.workflow.toast.invalidDescription"),
            });
            return;
          }

          createWorkflowTemplate({
            name: createForm.name,
            description: createForm.description,
            issueTypes: createForm.issueTypes,
          });
          setCreateDialogOpen(false);
          setCreateForm(EMPTY_WORKFLOW_CREATE_FORM);
          appToast.success({
            title: t("tasks.workflow.toast.createdTitle"),
            description: tp("tasks.workflow.toast.createdDescription", {
              name: createForm.name,
            }),
          });
        }}
      />

      {workflowToManage ? (
        <WorkflowEditorDialog
          key={workflowToManage.id}
          open
          workflow={workflowToManage}
          projects={projects}
          workflowIdByProject={workflowIdByProject}
          onOpenChange={(open) => {
            if (!open) {
              setManageWorkflowId(null);
            }
          }}
          onSaveMetadata={updateWorkflowTemplate}
          onAssignProjects={assignWorkflowToProjects}
          onCreateStatus={createWorkflowStatus}
          onUpdateStatus={updateWorkflowStatus}
          onDeleteStatus={deleteWorkflowStatus}
          onCreateTransition={createWorkflowTransition}
          onDeleteTransition={deleteWorkflowTransition}
        />
      ) : null}
    </AppShell>
  );
}
