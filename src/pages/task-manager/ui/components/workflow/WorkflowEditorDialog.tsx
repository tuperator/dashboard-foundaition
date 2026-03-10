import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import { type WorkflowIssueType } from "../../../model/types";
import { type StatusEditorState } from "./types";
import { WorkflowMetadataTab } from "./editor/WorkflowMetadataTab";
import { WorkflowProjectsTab } from "./editor/WorkflowProjectsTab";
import { WorkflowStatusTab } from "./editor/WorkflowStatusTab";
import { WorkflowTransitionsTab } from "./editor/WorkflowTransitionsTab";
import type { WorkflowEditorDialogProps } from "./editor/types";

export function WorkflowEditorDialog({
  open,
  workflow,
  projects,
  submitting = false,
  onOpenChange,
  onSaveMetadata,
  onAssignProjects,
  onCreateStatus,
  onUpdateStatus,
  onDeleteStatus,
  onCreateTransition,
  onDeleteTransition,
}: WorkflowEditorDialogProps) {
  const { t } = useI18n();

  const [name, setName] = useState(workflow.name);
  const [description, setDescription] = useState(workflow.description);
  const [issueTypes, setIssueTypes] = useState<WorkflowIssueType[]>(
    workflow.issueTypes,
  );
  const [statusEditor, setStatusEditor] = useState<StatusEditorState | null>(
    null,
  );
  const [fromStatusCode, setFromStatusCode] = useState(
    workflow.statuses[0]?.code || "",
  );
  const [toStatusCode, setToStatusCode] = useState(
    workflow.statuses[1]?.code || workflow.statuses[0]?.code || "",
  );
  const [assignProjectIds, setAssignProjectIds] = useState<string[]>(
    workflow.assignedProjects.map((project) => project.id),
  );

  const handleToggleIssueType = (issueType: WorkflowIssueType) => {
    const active = issueTypes.includes(issueType);
    if (active) {
      if (issueTypes.length <= 1) return;
      setIssueTypes((previous) =>
        previous.filter((value) => value !== issueType),
      );
      return;
    }

    setIssueTypes((previous) => [...previous, issueType]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[zoom:var(--app-scale)] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{workflow.name}</DialogTitle>
          <DialogDescription>
            {t("tasks.workflow.editor.description")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="metadata">
          <TabsList variant="line">
            <TabsTrigger value="metadata">
              {t("tasks.workflow.editor.tab.metadata")}
            </TabsTrigger>
            <TabsTrigger value="status">
              {t("tasks.workflow.editor.tab.status")}
            </TabsTrigger>
            <TabsTrigger value="transitions">
              {t("tasks.workflow.editor.tab.transitions")}
            </TabsTrigger>
            <TabsTrigger value="projects">
              {t("tasks.workflow.editor.tab.projects")}
            </TabsTrigger>
          </TabsList>

          <WorkflowMetadataTab
            workflowId={workflow.id}
            name={name}
            description={description}
            issueTypes={issueTypes}
            submitting={submitting}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onToggleIssueType={handleToggleIssueType}
            onSave={onSaveMetadata}
          />

          <WorkflowStatusTab
            workflow={workflow}
            submitting={submitting}
            statusEditor={statusEditor}
            onStatusEditorChange={setStatusEditor}
            onCreateStatus={onCreateStatus}
            onUpdateStatus={onUpdateStatus}
            onDeleteStatus={onDeleteStatus}
          />

          <WorkflowTransitionsTab
            workflow={workflow}
            submitting={submitting}
            fromStatusCode={fromStatusCode}
            toStatusCode={toStatusCode}
            onFromStatusChange={setFromStatusCode}
            onToStatusChange={setToStatusCode}
            onCreateTransition={onCreateTransition}
            onDeleteTransition={onDeleteTransition}
          />

          <WorkflowProjectsTab
            workflowId={workflow.id}
            projects={projects}
            assignProjectIds={assignProjectIds}
            submitting={submitting}
            onAssignProjectIdsChange={setAssignProjectIds}
            onAssignProjects={onAssignProjects}
          />
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
