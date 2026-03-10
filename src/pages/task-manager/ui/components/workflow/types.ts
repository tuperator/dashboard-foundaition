import type {
  WorkflowIssueType,
  WorkflowStatusCategory,
} from "../../../model/types";
import type { WorkflowListItem } from "../../../model/workflowManagement.types";

export type WorkflowRow = WorkflowListItem;

export type WorkflowCreateForm = {
  name: string;
  description: string;
  issueTypes: WorkflowIssueType[];
};

export type StatusEditorState = {
  mode: "create" | "edit";
  statusId: string | null;
  code: string;
  name: string;
  color: string;
  category: WorkflowStatusCategory;
};

export const EMPTY_WORKFLOW_CREATE_FORM: WorkflowCreateForm = {
  name: "",
  description: "",
  issueTypes: ["TASK", "BUG", "STORY"],
};

export const EMPTY_STATUS_EDITOR: StatusEditorState = {
  mode: "create",
  statusId: null,
  code: "",
  name: "",
  color: "#3B82F6",
  category: "TODO",
};
