type SidebarFooterProps = {
  collapsed?: boolean;
};

export function SidebarFooter({ collapsed = false }: SidebarFooterProps) {
  return (
    <div className="relative shrink-0 px-3 pt-8 pb-5">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-b from-transparent to-[var(--sb-bg)]" />
      <div className="grid place-items-center text-[var(--sb-logo-text)]">
        <div className="flex items-center gap-2 text-[12px] font-medium tracking-[0.06em]">
          <span className="text-[var(--sb-logo-star)]">*</span>
          {!collapsed ? <span>snow</span> : null}
        </div>
      </div>
    </div>
  );
}
