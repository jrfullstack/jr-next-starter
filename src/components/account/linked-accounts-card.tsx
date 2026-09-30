"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/auth/google-icon";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { authErrorKey } from "@/lib/auth/errors";
import { authRoutes, withLocale } from "@/lib/auth/routes";

/** Link or unlink Google; unlinking is refused if it's the last way in (server checks it too) */
export function LinkedAccountsCard({
  googleAccountId,
  canUnlinkGoogle,
}: {
  /** Google's account id, if linked */
  googleAccountId?: string;
  canUnlinkGoogle: boolean;
}) {
  const t = useTranslations("Account.security.linked");
  const tAuth = useTranslations("Auth");
  const locale = useLocale();
  const router = useRouter();
  const hydrated = useHydrated();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const here = withLocale(locale, authRoutes.accountSecurity);
  const googleLinked = googleAccountId !== undefined;

  // Google sends the browser back here; errors come back as ?error=
  const link = () =>
    startTransition(async () => {
      await authClient.linkSocial({
        provider: "google",
        callbackURL: here,
        errorCallbackURL: here,
      });
    });

  const unlink = () =>
    startTransition(async () => {
      if (!googleAccountId) return;
      const { error } = await authClient.unlinkAccount({
        accountId: googleAccountId,
      });
      setConfirming(false);
      if (error) {
        toast.error(tAuth(`errors.${authErrorKey(error.code, error.status)}`));
        return;
      }
      toast.success(t("unlinked"));
      router.refresh();
    });

  return (
    <SectionCard title={t("title")} description={t("description")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <GoogleIcon className="size-5" />
          <span className="font-medium">{t("google")}</span>
          <Badge variant={googleLinked ? "default" : "secondary"}>
            {t(googleLinked ? "linkedStatus" : "notLinkedStatus")}
          </Badge>
        </div>
        {googleLinked ? (
          <Button
            variant="outline"
            disabled={!(hydrated && canUnlinkGoogle) || pending}
            onClick={() => setConfirming(true)}
          >
            {t("unlink")}
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled={!hydrated || pending}
            onClick={link}
          >
            {t("link")}
          </Button>
        )}
      </div>
      {googleLinked && !canUnlinkGoogle && (
        <FieldDescription className="mt-2">{t("lastMethod")}</FieldDescription>
      )}
      <ConfirmActionDialog
        open={confirming}
        title={t("confirmTitle")}
        description={t("confirmDescription")}
        pending={pending}
        onConfirm={unlink}
        onCancel={() => setConfirming(false)}
      />
    </SectionCard>
  );
}
