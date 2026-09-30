"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";

export type DeviceSession = {
  token: string;
  current: boolean;
  /** "Chrome · Windows", or undefined if the user agent is unknown */
  device?: string;
  ipAddress?: string | null;
  lastActive: Date;
};

/** Open sessions of the user; any but the current one can be signed out */
export function SessionsCard({ sessions }: { sessions: DeviceSession[] }) {
  const t = useTranslations("Account.security.sessions");
  const format = useFormatter();
  const router = useRouter();
  const hydrated = useHydrated();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const others = sessions.filter((session) => !session.current);

  const run = (action: () => Promise<{ error: unknown }>, done: string) =>
    startTransition(async () => {
      const { error } = await action();
      setConfirming(false);
      if (error) {
        toast.error(t("error"));
        return;
      }
      toast.success(done);
      router.refresh();
    });

  return (
    <SectionCard
      title={t("title")}
      description={t("description")}
      action={
        others.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            disabled={!hydrated || pending}
            onClick={() => setConfirming(true)}
          >
            {t("revokeOthers")}
          </Button>
        )
      }
    >
      <ul className="divide-y">
        {sessions.map((session) => (
          <li
            key={session.token}
            className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
          >
            <div>
              <p className="flex items-center gap-2 font-medium">
                {session.device ?? t("unknownDevice")}
                {session.current && (
                  <Badge variant="secondary">{t("current")}</Badge>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("detail", {
                  ip: session.ipAddress || t("unknownIp"),
                  date: format.dateTime(session.lastActive, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                })}
              </p>
            </div>
            {!session.current && (
              <Button
                variant="ghost"
                size="sm"
                disabled={!hydrated || pending}
                onClick={() =>
                  run(
                    () => authClient.revokeSession({ token: session.token }),
                    t("revoked"),
                  )
                }
              >
                {t("revoke")}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <ConfirmActionDialog
        open={confirming}
        title={t("confirmTitle")}
        description={t("confirmDescription")}
        pending={pending}
        onConfirm={() =>
          run(() => authClient.revokeOtherSessions(), t("revokedOthers"))
        }
        onCancel={() => setConfirming(false)}
      />
    </SectionCard>
  );
}
