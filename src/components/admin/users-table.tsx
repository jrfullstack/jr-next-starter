import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rowPermissions, type UserStatus, userStatus } from "@/lib/admin/users";
import { UserRowActions } from "./user-row-actions";

type ListedUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  emailVerified: boolean;
  createdAt: Date;
};

const statusVariant: Record<
  UserStatus,
  "default" | "secondary" | "destructive"
> = {
  active: "default",
  unverified: "secondary",
  banned: "destructive",
};

const knownRoles = new Set(["user", "admin", "superadmin"]);

export function UsersTable({
  users,
  actor,
}: {
  users: ListedUser[];
  actor: { id: string; role?: string | null };
}) {
  const t = useTranslations("Admin.users");
  const format = useFormatter();

  if (users.length === 0) {
    return <p className="py-8 text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("columns.name")}</TableHead>
          <TableHead>{t("columns.email")}</TableHead>
          <TableHead>{t("columns.role")}</TableHead>
          <TableHead>{t("columns.status")}</TableHead>
          <TableHead>{t("columns.createdAt")}</TableHead>
          <TableHead className="sr-only">{t("columns.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const permissions = rowPermissions(actor, user);
          const role =
            user.role && knownRoles.has(user.role) ? user.role : "user";
          const status = userStatus(user);
          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.name}
                {user.id === actor.id && (
                  <Badge variant="outline" className="ml-2">
                    {t("you")}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {t(`roles.${role as "user" | "admin" | "superadmin"}`)}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[status]}>
                  {t(`status.${status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                {format.dateTime(user.createdAt, { dateStyle: "medium" })}
              </TableCell>
              <TableCell className="text-right">
                {permissions.manageable ? (
                  <UserRowActions user={user} permissions={permissions} />
                ) : (
                  user.role === "superadmin" && (
                    <span className="text-xs text-muted-foreground">
                      {t("protected")}
                    </span>
                  )
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
