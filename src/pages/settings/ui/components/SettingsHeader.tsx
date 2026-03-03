import { Link } from "react-router-dom";
import { appRoutes } from "@/shared/constants/routes";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export function SettingsHeader() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl leading-8 font-semibold">
          System Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Quản lý cấu hình chung: ngôn ngữ, chính sách bảo mật và giao diện làm
          việc.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline">Auto-save local</Badge>
        <Button asChild variant="outline">
          <Link to={appRoutes.dashboard}>Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
