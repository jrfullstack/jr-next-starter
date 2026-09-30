"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { authClient } from "@/lib/auth/client";
import { authRoutes, withLocale } from "@/lib/auth/routes";

export function ResendVerificationButton({ email }: { email: string }) {
  const t = useTranslations("Auth.verifyEmail");
  const locale = useLocale();
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const resend = () =>
    startTransition(async () => {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: withLocale(locale, authRoutes.verifyEmail),
      });
      setSent(true);
    });

  if (sent) {
    return <FieldDescription role="status">{t("resent")}</FieldDescription>;
  }
  return (
    <Button variant="outline" onClick={resend} disabled={pending}>
      {t("resend")}
    </Button>
  );
}
