import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  LANGUAGE_OPTIONS,
  TIME_ZONE_OPTIONS,
} from "../../model/settingsPreferences";

type GeneralSettingsCardProps = {
  workspaceName: string;
  language: string;
  timeZone: string;
  onWorkspaceNameChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onTimeZoneChange: (value: string) => void;
};

export function GeneralSettingsCard({
  workspaceName,
  language,
  timeZone,
  onWorkspaceNameChange,
  onLanguageChange,
  onTimeZoneChange,
}: GeneralSettingsCardProps) {
  return (
    <Card id="general">
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Cấu hình thông tin vận hành mặc định cho doanh nghiệp.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="workspace-name">Workspace name</Label>
          <Input
            id="workspace-name"
            value={workspaceName}
            onChange={(event) => onWorkspaceNameChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger id="language" className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={timeZone} onValueChange={onTimeZoneChange}>
            <SelectTrigger id="timezone" className="w-full">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIME_ZONE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
