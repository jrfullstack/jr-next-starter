"use client";

import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRouter } from "@/i18n/navigation";
import type { rowPermissions } from "@/lib/admin/users";
import { authClient } from "@/lib/auth/client";
import { ConfirmActionDialog } from "./confirm-action-dialog";

type Props = {
  user: {
    id: string;
    name: string;
    role?: string | null;
    banned?: boolean | null;
  };
  permissions: ReturnType<typeof rowPermissions>;
};

type ActionResult = { error: { status?: number } | null };
type Confirmation = "ban" | "revokeSessions" | null;

const FORBIDDEN_STATUS = 403;

export function UserRowActions({ user, permissions }: Props) {
  const t = useTranslations("Admin.users");
  const router = useRouter();
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [pending, startTransition] = useTransition();
  const hydrated = useHydrated();

  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const { error } = await action();
      setConfirmation(null);
      if (error) {
        const forbidden = error.status === FORBIDDEN_STATUS;
        toast.error(t(forbidden ? "errors.forbidden" : "errors.generic"));
        return;
      }
      router.refresh();
    });

  const userId = user.id;
  const nextRole = user.role === "admin" ? "user" : "admin";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending || !hydrated}
            />
          }
        >
          <MoreHorizontal />
          <span className="sr-only">
            {t("actions.menu", { name: user.name })}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {permissions.ban &&
            (user.banned ? (
              <DropdownMenuItem
                onClick={() =>
                  run(() => authClient.admin.unbanUser({ userId }))
                }
              >
                {t("actions.unban")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setConfirmation("ban")}>
                {t("actions.ban")}
              </DropdownMenuItem>
            ))}
          {permissions.revokeSessions && (
            <DropdownMenuItem onClick={() => setConfirmation("revokeSessions")}>
              {t("actions.revokeSessions")}
            </DropdownMenuItem>
          )}
          {permissions.setRole && (
            <DropdownMenuItem
              onClick={() =>
                run(() => authClient.admin.setRole({ userId, role: nextRole }))
              }
            >
              {t(
                nextRole === "admin" ? "actions.makeAdmin" : "actions.makeUser",
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmActionDialog
        open={confirmation === "ban"}
        title={t("confirm.banTitle", { name: user.name })}
        description={t("confirm.banDescription")}
        pending={pending}
        onCancel={() => setConfirmation(null)}
        onConfirm={() => run(() => authClient.admin.banUser({ userId }))}
      />
      <ConfirmActionDialog
        open={confirmation === "revokeSessions"}
        title={t("confirm.revokeTitle", { name: user.name })}
        description={t("confirm.revokeDescription")}
        pending={pending}
        onCancel={() => setConfirmation(null)}
        onConfirm={() =>
          run(() => authClient.admin.revokeUserSessions({ userId }))
        }
      />
    </>
  );
}
