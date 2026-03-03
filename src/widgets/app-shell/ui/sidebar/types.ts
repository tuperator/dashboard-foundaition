export type SidebarAction = {
  label: string;
  destructive?: boolean;
};

export type SidebarSimpleItem = {
  label: string;
  kind: "simple";
};

export type SidebarMenuItem = {
  label: string;
  icon?: unknown;
  active?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  children?: string[];
  actions?: SidebarAction[];
};

export type SidebarSection = {
  title: string;
  items: SidebarMenuItem[];
};
