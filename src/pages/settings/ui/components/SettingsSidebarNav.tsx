import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { SETTINGS_SECTION_LINKS } from "../../model/settingsPreferences";

export function SettingsSidebarNav() {
  return (
    <Card className="h-fit py-3">
      <CardHeader className="pb-0">
        <CardTitle>Danh mục</CardTitle>
        <CardDescription>Nhóm cấu hình cơ bản</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        {SETTINGS_SECTION_LINKS.map((section) => (
          <a
            key={section.href}
            href={section.href}
            className="block rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          >
            {section.label}
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
