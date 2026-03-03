import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { SESSION_TIMEOUT_OPTIONS } from "../../model/settingsPreferences";
import { SettingSwitchRow } from "./SettingSwitchRow";

type SecuritySettingsCardProps = {
  enforce2FA: boolean;
  allowIpRestriction: boolean;
  requirePolicyAccepted: boolean;
  sessionTimeout: string;
  onEnforce2FAChange: (next: boolean) => void;
  onAllowIpRestrictionChange: (next: boolean) => void;
  onRequirePolicyAcceptedChange: (next: boolean) => void;
  onSessionTimeoutChange: (value: string) => void;
};

export function SecuritySettingsCard({
  enforce2FA,
  allowIpRestriction,
  requirePolicyAccepted,
  sessionTimeout,
  onEnforce2FAChange,
  onAllowIpRestrictionChange,
  onRequirePolicyAcceptedChange,
  onSessionTimeoutChange,
}: SecuritySettingsCardProps) {
  return (
    <Card id="security">
      <CardHeader>
        <CardTitle>Security & Policy</CardTitle>
        <CardDescription>
          Thiết lập các lớp bảo vệ cơ bản cho người dùng và dữ liệu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingSwitchRow
          title="Bắt buộc 2FA cho tài khoản quản trị"
          description="Giảm rủi ro bị truy cập trái phép vào khu vực quản trị."
          checked={enforce2FA}
          onCheckedChange={onEnforce2FAChange}
        />
        <SettingSwitchRow
          title="Giới hạn truy cập theo IP nội bộ"
          description="Chỉ cho phép đăng nhập từ danh sách IP được cấp quyền."
          checked={allowIpRestriction}
          onCheckedChange={onAllowIpRestrictionChange}
        />
        <SettingSwitchRow
          title="Bắt buộc người dùng chấp nhận chính sách mới"
          description="Hiển thị hộp xác nhận khi có cập nhật điều khoản sử dụng."
          checked={requirePolicyAccepted}
          onCheckedChange={onRequirePolicyAcceptedChange}
        />

        <div className="space-y-2">
          <Label htmlFor="session-timeout">Session timeout</Label>
          <Select value={sessionTimeout} onValueChange={onSessionTimeoutChange}>
            <SelectTrigger id="session-timeout" className="w-full md:w-[220px]">
              <SelectValue placeholder="Select timeout" />
            </SelectTrigger>
            <SelectContent>
              {SESSION_TIMEOUT_OPTIONS.map((option) => (
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
