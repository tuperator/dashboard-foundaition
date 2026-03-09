import type { TaskManagerStore } from "./types";

export const TASK_MANAGER_STORAGE_KEY = "task-manager-store-v1";

export const DEFAULT_WORKFLOW = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const DEFAULT_WORKFLOW_TEMPLATE_ID = "workflow-default";
const CRM_WORKFLOW_TEMPLATE_ID = "workflow-crm";

export const TASK_MANAGER_DEFAULT_STORE: TaskManagerStore = {
  projects: [
    {
      id: "proj-erp-core",
      name: "ERP Core Platform",
      key: "ERP",
      description: "Nền tảng lõi cho quản lý vận hành doanh nghiệp.",
      owner: "Toan Le",
      members: ["Toan Le", "Linh Tran", "Minh Nguyen", "An Vo"],
      type: "SCRUM",
    },
    {
      id: "proj-crm-suite",
      name: "CRM Suite",
      key: "CRM",
      description: "Quản lý khách hàng và vòng đời sales.",
      owner: "Trang Pham",
      members: ["Trang Pham", "Dat Le", "Quynh Mai"],
      type: "KANBAN",
    },
  ],
  tasks: [
    {
      id: "task-1",
      title: "Thiết kế authentication flow",
      description: "Xác định login/refresh/logout và mapping permission.",
      projectId: "proj-erp-core",
      assignee: "Toan Le",
      status: "IN_PROGRESS",
      priority: "HIGH",
      sprintId: "sprint-erp-1",
      backlogOrder: 3,
      updatedAt: "2026-03-09T01:20:00.000Z",
    },
    {
      id: "task-2",
      title: "Tạo layout dashboard tổng quan",
      description: "Xây dựng khung dashboard chính theo design system.",
      projectId: "proj-erp-core",
      assignee: "Linh Tran",
      status: "TODO",
      priority: "MEDIUM",
      sprintId: null,
      backlogOrder: 1,
      updatedAt: "2026-03-08T09:10:00.000Z",
    },
    {
      id: "task-3",
      title: "Chuẩn hóa API error contract",
      description: "Đồng bộ code lỗi giữa FE và BE cho các module quản trị.",
      projectId: "proj-erp-core",
      assignee: "Minh Nguyen",
      status: "REVIEW",
      priority: "HIGH",
      sprintId: "sprint-erp-1",
      backlogOrder: 4,
      updatedAt: "2026-03-09T03:40:00.000Z",
    },
    {
      id: "task-4",
      title: "Thiết kế pipeline lead scoring",
      description: "Định nghĩa rules phân loại khách hàng tiềm năng.",
      projectId: "proj-crm-suite",
      assignee: "Trang Pham",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      sprintId: null,
      backlogOrder: 1,
      updatedAt: "2026-03-08T13:25:00.000Z",
    },
    {
      id: "task-5",
      title: "Import dữ liệu khách hàng từ file CSV",
      description: "Parse file, validate field và mapping schema.",
      projectId: "proj-crm-suite",
      assignee: "Dat Le",
      status: "DONE",
      priority: "LOW",
      sprintId: null,
      backlogOrder: 2,
      updatedAt: "2026-03-07T08:10:00.000Z",
    },
  ],
  sprints: [
    {
      id: "sprint-erp-1",
      projectId: "proj-erp-core",
      name: "Sprint 01",
      goal: "Deliver core authentication and dashboard baseline.",
      startDate: "2026-03-01",
      endDate: "2026-03-14",
      status: "ACTIVE",
      createdAt: "2026-02-28T08:00:00.000Z",
    },
    {
      id: "sprint-erp-2",
      projectId: "proj-erp-core",
      name: "Sprint 02",
      goal: "Stabilize user management and branch module.",
      startDate: "2026-03-15",
      endDate: "2026-03-28",
      status: "PLANNED",
      createdAt: "2026-03-08T10:15:00.000Z",
    },
  ],
  workflowTemplates: [
    {
      id: DEFAULT_WORKFLOW_TEMPLATE_ID,
      name: "Standard software workflow",
      description: "Flow chuẩn cho project sản phẩm theo Agile/Scrum.",
      statuses: [
        {
          id: "status-todo",
          code: "TODO",
          name: "To do",
          color: "#6B7280",
          category: "TODO",
        },
        {
          id: "status-in-progress",
          code: "IN_PROGRESS",
          name: "In progress",
          color: "#3B82F6",
          category: "IN_PROGRESS",
        },
        {
          id: "status-review",
          code: "REVIEW",
          name: "Review",
          color: "#8B5CF6",
          category: "IN_PROGRESS",
        },
        {
          id: "status-testing",
          code: "TESTING",
          name: "Testing",
          color: "#F59E0B",
          category: "IN_PROGRESS",
        },
        {
          id: "status-done",
          code: "DONE",
          name: "Done",
          color: "#10B981",
          category: "DONE",
        },
        {
          id: "status-rejected",
          code: "REJECTED",
          name: "Rejected",
          color: "#EF4444",
          category: "DONE",
        },
      ],
      transitions: [
        {
          id: "transition-todo-in-progress",
          fromStatusCode: "TODO",
          toStatusCode: "IN_PROGRESS",
        },
        {
          id: "transition-in-progress-review",
          fromStatusCode: "IN_PROGRESS",
          toStatusCode: "REVIEW",
        },
        {
          id: "transition-review-testing",
          fromStatusCode: "REVIEW",
          toStatusCode: "TESTING",
        },
        {
          id: "transition-testing-done",
          fromStatusCode: "TESTING",
          toStatusCode: "DONE",
        },
        {
          id: "transition-review-in-progress",
          fromStatusCode: "REVIEW",
          toStatusCode: "IN_PROGRESS",
        },
        {
          id: "transition-testing-review",
          fromStatusCode: "TESTING",
          toStatusCode: "REVIEW",
        },
        {
          id: "transition-in-progress-rejected",
          fromStatusCode: "IN_PROGRESS",
          toStatusCode: "REJECTED",
        },
      ],
      issueTypes: ["TASK", "BUG", "STORY"],
      createdAt: "2026-03-01T08:00:00.000Z",
      updatedAt: "2026-03-09T08:00:00.000Z",
    },
    {
      id: CRM_WORKFLOW_TEMPLATE_ID,
      name: "CRM lightweight workflow",
      description: "Luồng xử lý gọn cho team CRM/Kanban.",
      statuses: [
        {
          id: "crm-status-todo",
          code: "TODO",
          name: "To do",
          color: "#64748B",
          category: "TODO",
        },
        {
          id: "crm-status-progress",
          code: "IN_PROGRESS",
          name: "In progress",
          color: "#3B82F6",
          category: "IN_PROGRESS",
        },
        {
          id: "crm-status-done",
          code: "DONE",
          name: "Done",
          color: "#22C55E",
          category: "DONE",
        },
      ],
      transitions: [
        {
          id: "crm-transition-1",
          fromStatusCode: "TODO",
          toStatusCode: "IN_PROGRESS",
        },
        {
          id: "crm-transition-2",
          fromStatusCode: "IN_PROGRESS",
          toStatusCode: "DONE",
        },
        {
          id: "crm-transition-3",
          fromStatusCode: "IN_PROGRESS",
          toStatusCode: "TODO",
        },
      ],
      issueTypes: ["TASK", "BUG"],
      createdAt: "2026-03-01T08:00:00.000Z",
      updatedAt: "2026-03-09T08:00:00.000Z",
    },
  ],
  workflowIdByProject: {
    "proj-erp-core": DEFAULT_WORKFLOW_TEMPLATE_ID,
    "proj-crm-suite": CRM_WORKFLOW_TEMPLATE_ID,
  },
  workflowByProject: {
    "proj-erp-core": [
      "TODO",
      "IN_PROGRESS",
      "REVIEW",
      "TESTING",
      "DONE",
      "REJECTED",
    ],
    "proj-crm-suite": ["TODO", "IN_PROGRESS", "DONE"],
  },
  memberRolesByProject: {
    "proj-erp-core": {
      "Toan Le": "OWNER",
      "Linh Tran": "ADMIN",
      "Minh Nguyen": "MEMBER",
      "An Vo": "VIEWER",
    },
    "proj-crm-suite": {
      "Trang Pham": "OWNER",
      "Dat Le": "MEMBER",
      "Quynh Mai": "MEMBER",
    },
  },
  selectedProjectId: "proj-erp-core",
};

export const TASK_TABLE_MIN_WIDTH_CLASS = "min-w-[980px]";
