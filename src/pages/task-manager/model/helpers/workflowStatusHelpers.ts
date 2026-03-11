export type WorkflowStatusMeta = {
  name: string;
  color: string;
};

export function getWorkflowStatusMeta(
  workflowStatusByCode: Map<string, WorkflowStatusMeta>,
  statusCode: string,
) {
  const meta = workflowStatusByCode.get(statusCode);

  return {
    name: meta?.name || statusCode,
    color: meta?.color || "#6B7280",
  };
}

export function getWorkflowStatusStyle(
  workflowStatusByCode: Map<string, WorkflowStatusMeta>,
  statusCode: string,
) {
  const { color } = getWorkflowStatusMeta(workflowStatusByCode, statusCode);

  return {
    borderColor: color,
    backgroundColor: `${color}14`,
    color,
  };
}
