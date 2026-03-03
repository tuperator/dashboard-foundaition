type SidebarBrandProps = {
  profileName: string;
};

export function SidebarBrand({ profileName }: SidebarBrandProps) {
  return (
    <div className="flex h-10 flex-1 items-center gap-2 rounded-xl px-2">
      <div className="grid size-8 place-content-center rounded-full bg-gradient-to-br from-[var(--sb-avatar-from)] to-[var(--sb-avatar-to)] text-[var(--sb-avatar-text)]">
        B
      </div>
      <p className="truncate text-[15px] font-medium text-[var(--sb-text)]">
        {profileName}
      </p>
    </div>
  );
}
