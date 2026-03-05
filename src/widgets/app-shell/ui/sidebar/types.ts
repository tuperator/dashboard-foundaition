import type { TranslationKey } from "@/shared/i18n/messages";

export type SidebarAction = {
  labelKey: TranslationKey;
  destructive?: boolean;
};

export type SidebarSimpleItem = {
  labelKey: TranslationKey;
  kind: "simple";
  to: string;
  matchMode?: "exact" | "prefix";
};

export type SidebarChildItem = {
  labelKey: TranslationKey;
  to: string;
};

export type SidebarMenuItem = {
  labelKey: TranslationKey;
  icon?: unknown;
  to?: string;
  matchMode?: "exact" | "prefix";
  expandable?: boolean;
  expanded?: boolean;
  children?: SidebarChildItem[];
  actions?: SidebarAction[];
};

export type SidebarSection = {
  titleKey: TranslationKey;
  items: SidebarMenuItem[];
};
