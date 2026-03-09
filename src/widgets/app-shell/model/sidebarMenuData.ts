import {
  FolderOpenIcon,
  LayoutIcon,
  SettingsIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { appRoutes } from "@/shared/constants/routes";
import type {
  SidebarAction,
  SidebarSection,
  SidebarSimpleItem,
} from "../ui/sidebar/types";

export const sidebarProfileName = "ByeWind";

export const sidebarTabs = [
  "sidebar.tabs.favorites",
  "sidebar.tabs.recently",
] as const;

export const defaultActions: SidebarAction[] = [
  { labelKey: "sidebar.actions.open" },
  { labelKey: "sidebar.actions.share" },
  { labelKey: "sidebar.actions.edit" },
  { labelKey: "sidebar.actions.delete", destructive: true },
];

export const sidebarFavorites: SidebarSimpleItem[] = [
  {
    labelKey: "sidebar.item.overview",
    kind: "simple",
    to: appRoutes.dashboard,
    matchMode: "exact",
  },
  {
    labelKey: "sidebar.item.userManagement",
    kind: "simple",
    to: appRoutes.users,
    matchMode: "prefix",
  },
];

export const sidebarSections: SidebarSection[] = [
  {
    titleKey: "sidebar.section.main",
    items: [
      {
        labelKey: "sidebar.item.overview",
        icon: LayoutIcon,
        to: appRoutes.dashboard,
        matchMode: "exact",
        actions: defaultActions,
      },
    ],
  },
  {
    titleKey: "sidebar.section.operations",
    items: [
      {
        labelKey: "sidebar.item.taskManagement",
        icon: FolderOpenIcon,
        expandable: true,
        children: [
          {
            labelKey: "sidebar.item.workSpace",
            to: appRoutes.tasksProjects,
          },
          {
            labelKey: "sidebar.item.workflow",
            to: appRoutes.tasksWorkflows,
          },
        ],
        matchMode: "prefix",
        actions: defaultActions,
      },
    ],
  },
  {
    titleKey: "sidebar.section.organization",
    items: [
      {
        labelKey: "sidebar.item.userManagement",
        icon: UserGroupIcon,
        to: appRoutes.users,
        matchMode: "prefix",
        actions: defaultActions,
      },
      {
        labelKey: "sidebar.item.roleGroups",
        icon: UserIcon,
        to: appRoutes.roleGroups,
        matchMode: "prefix",
        actions: defaultActions,
      },
      {
        labelKey: "sidebar.item.branches",
        icon: LayoutIcon,
        to: appRoutes.branches,
        matchMode: "prefix",
        actions: defaultActions,
      },
      {
        labelKey: "sidebar.item.companyInfo",
        icon: FolderOpenIcon,
        to: appRoutes.companyInfo,
        matchMode: "prefix",
        actions: defaultActions,
      },
    ],
  },
  {
    titleKey: "sidebar.section.system",
    items: [
      {
        labelKey: "sidebar.item.settings",
        icon: SettingsIcon,
        to: appRoutes.settings,
        matchMode: "prefix",
        actions: defaultActions,
      },
    ],
  },
];
