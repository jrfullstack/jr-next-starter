"use client";

import { useTranslations } from "next-intl";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { authClient } from "@/lib/auth/client";
import { twoFactorCodeSchema } from "@/lib/auth/schemas";
import { QrCode } from "./qr-code";

/** Scan the QR (or type the key), then prove it works with a first code: that turns 2FA on */
export function TwoFactorSetup({
  totpURI,
  onVerified,
}: {
  totpURI: string;
  onVerified: () => void;
}) {
  const t = useTranslations("Account.security.twoFactor");
  const tAuth = useTranslations("Auth");
  const secret = new URL(totpURI).searchParams.get("secret") ?? "";
  const { onSubmit, invalid, error, submitDisabled } = useAuthForm({
    schema: twoFactorCodeSchema,
    submit: ({ code }) => authClient.twoFactor.verifyTotp({ code }),
    onSuccess: onVerified,
  });

  return (
    <form method="post" onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <FieldDescription>{t("scan")}</FieldDescription>
        <QrCode value={totpURI} label={t("qr")} />
        <div className="flex flex-col gap-1 text-sm">
          <span>{t("secret")}</span>
          <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono break-all">
            {secret}
          </code>
        </div>
        <AuthFormField
          name="code"
          autoComplete="one-time-code"
          label={tAuth("twoFactor.code")}
          error={invalid.code && tAuth("validation.code")}
        />
        {error && <FieldError>{tAuth(`errors.${error}`)}</FieldError>}
        <Button type="submit" disabled={submitDisabled} className="self-start">
          {t("verify")}
        </Button>
      </FieldGroup>
    </form>
  );
}
