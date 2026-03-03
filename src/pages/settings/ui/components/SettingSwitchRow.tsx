import { Switch } from "@/shared/ui/switch";

type SettingSwitchRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
};

export function SettingSwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
}: SettingSwitchRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-input/15 px-3 py-2.5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
