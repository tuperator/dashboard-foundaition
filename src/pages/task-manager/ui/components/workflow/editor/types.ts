import type {
  TaskProject,
  WorkflowIssueType,
  WorkflowStatusCategory,
} from "../../../../model/types";
import type { WorkflowDetail } from "../../../../model/workflowManagement.types";

export type WorkflowEditorDialogProps = {
  open: boolean;
  workflow: WorkflowDetail;
  projects: TaskProject[];
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveMetadata: (
    workflowId: string,
    payload: {
      name: string;
      description: string;
      issueTypes: WorkflowIssueType[];
    },
  ) => Promise<void>;
  onAssignProjects: (workflowId: string, projectIds: string[]) => Promise<void>;
  onCreateStatus: (
    workflowId: string,
    payload: {
      code: string;
      name: string;
      color: string;
      category: WorkflowStatusCategory;
    },
  ) => Promise<void>;
  onUpdateStatus: (
    workflowId: string,
    statusId: string,
    payload: {
      code: string;
      name: string;
      color: string;
      category: WorkflowStatusCategory;
    },
  ) => Promise<void>;
  onDeleteStatus: (workflowId: string, statusId: string) => Promise<void>;
  onCreateTransition: (
    workflowId: string,
    fromStatusCode: string,
    toStatusCode: string,
  ) => Promise<void>;
  onDeleteTransition: (workflowId: string, transitionId: string) => Promise<void>;
};
