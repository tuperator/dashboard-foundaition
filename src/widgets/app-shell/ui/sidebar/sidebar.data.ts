import {
  CreditCardIcon,
  File01Icon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  LayoutIcon,
  MailIcon,
  NotificationIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import type { SidebarAction, SidebarSection, SidebarSimpleItem } from "./types";

export const sidebarProfileName = "ByeWind";

export const sidebarTabs = ["Favorites", "Recently"] as const;

export const defaultActions: SidebarAction[] = [
  { label: "Open" },
  { label: "Share" },
  { label: "Edit" },
  { label: "Delete", destructive: true },
];

export const sidebarFavorites: SidebarSimpleItem[] = [
  { label: "Overview", kind: "simple" },
  { label: "Projects", kind: "simple" },
];

export const sidebarSections: SidebarSection[] = [
  {
    title: "Dashboards",
    items: [
      {
        label: "Default",
        icon: LayoutIcon,
        active: true,
        actions: defaultActions,
      },
      {
        label: "eCommerce",
        icon: FolderOpenIcon,
        expandable: true,
        actions: defaultActions,
      },
      {
        label: "Projects",
        icon: FolderIcon,
        expandable: true,
        actions: defaultActions,
      },
      {
        label: "Online Courses",
        icon: FileIcon,
        expandable: true,
        actions: defaultActions,
      },
    ],
  },
  {
    title: "Pages",
    items: [
      {
        label: "User Profile",
        icon: UserIcon,
        expanded: true,
        children: [
          "Overview",
          "Projects",
          "Campaigns",
          "Documents",
          "Followers",
        ],
        actions: defaultActions,
      },
      {
        label: "Account",
        icon: CreditCardIcon,
        expandable: true,
        actions: defaultActions,
      },
      {
        label: "Corporate",
        icon: UserIcon,
        expandable: true,
        actions: defaultActions,
      },
      {
        label: "Blog",
        icon: File01Icon,
        expandable: true,
        actions: defaultActions,
      },
      {
        label: "Social",
        icon: NotificationIcon,
        expandable: true,
        actions: defaultActions,
      },
      {
        label: "Messages",
        icon: MailIcon,
        expandable: true,
        actions: defaultActions,
      },
    ],
  },
];
