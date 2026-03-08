import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useI18n } from "@/shared/providers/i18n/I18nProvider";
import {
  ROLE_TABLE_COLUMN_COUNT,
  ROLE_TABLE_MIN_WIDTH_CLASS,
} from "../../model/constants";
import type { RoleRecord } from "../../model/types";

type RoleManagementTableProps = {
  roles: RoleRecord[];
  loading?: boolean;
};

export function RoleManagementTable({
  roles,
  loading = false,
}: RoleManagementTableProps) {
  const { t } = useI18n();

  return (
    <Table className={ROLE_TABLE_MIN_WIDTH_CLASS}>
      <TableHeader>
        <TableRow className="bg-muted/25">
          <TableHead>{t("role.table.name")}</TableHead>
          <TableHead>{t("role.table.id")}</TableHead>
          <TableHead>{t("role.table.type")}</TableHead>
          <TableHead>{t("role.table.scope")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={ROLE_TABLE_COLUMN_COUNT}
              className="py-10 text-center text-muted-foreground"
            >
              {t("role.table.loading")}
            </TableCell>
          </TableRow>
        ) : null}

        {!loading && roles.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={ROLE_TABLE_COLUMN_COUNT}
              className="py-10 text-center text-muted-foreground"
            >
              {t("role.table.empty")}
            </TableCell>
          </TableRow>
        ) : null}

        {!loading
          ? roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <span className="font-medium text-foreground">{role.roleName}</span>
                </TableCell>
                <TableCell>
                  <code className="text-muted-foreground text-[11px]">{role.id}</code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="h-5 rounded-full px-2">
                    {role.type === "ADMIN"
                      ? t("role.type.admin")
                      : role.type === "MANAGER"
                        ? t("role.type.manager")
                        : role.type === "OPERATION"
                          ? t("role.type.operation")
                          : t("role.type.custom")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="h-5 rounded-full px-2">
                    {role.scope === "GLOBAL"
                      ? t("role.scope.global")
                      : role.scope === "BUSINESS"
                        ? t("role.scope.business")
                        : t("role.scope.custom")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          : null}
      </TableBody>
    </Table>
  );
}
