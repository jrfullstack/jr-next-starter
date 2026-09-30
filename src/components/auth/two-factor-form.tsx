"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { authRoutes } from "@/lib/auth/routes";
import { twoFactorCodeSchema } from "@/lib/auth/schemas";
import { AuthCard } from "./auth-card";
import { AuthFormField } from "./auth-form-field";
import { useAuthForm } from "./use-auth-form";

type Factor = "totp" | "backup" | "otp";

function verify(factor: Factor, body: { code: string; trustDevice: boolean }) {
  if (factor === "backup") return authClient.twoFactor.verifyBackupCode(body);
  if (factor === "otp") return authClient.twoFactor.verifyOtp(body);
  return authClient.twoFactor.verifyTotp(body);
}

/** Other factors the user can switch to from the current one */
function alternatives(current: Factor, emailOtp: boolean) {
  const all: Factor[] = emailOtp
    ? ["totp", "backup", "otp"]
    : ["totp", "backup"];
  return all.filter((factor) => factor !== current);
}

const switchLabel = {
  totp: "useApp",
  backup: "useBackup",
  otp: "useEmail",
} as const;

/**
 * Second step of a sign-in: Better Auth left a signed challenge cookie, and
 * a valid code turns it into the session (then back to `callbackPath`).
 */
export function TwoFactorForm({
  callbackPath,
  emailOtp,
  trustDevice,
}: {
  callbackPath: string;
  /** From the policy: the email code is an option */
  emailOtp: boolean;
  /** From the policy: "remember this device" is offered */
  trustDevice: boolean;
}) {
  const t = useTranslations("Auth");
  const [factor, setFactor] = useState<Factor>("totp");
  const [emailSent, setEmailSent] = useState(false);
  const { onSubmit, invalid, error, submitDisabled } = useAuthForm({
    schema: twoFactorCodeSchema,
    redirectTo: callbackPath,
    submit: (body) => verify(factor, body),
  });

  const choose = async (next: Factor) => {
    setFactor(next);
    if (next === "otp" && !emailSent) {
      await authClient.twoFactor.sendOtp();
      setEmailSent(true);
    }
  };

  return (
    <AuthCard
      title={t("twoFactor.title")}
      description={t(`twoFactor.${factor}Description`)}
      footer={
        <Link href={authRoutes.signIn}>{t("twoFactor.signInAgain")}</Link>
      }
    >
      <form method="post" onSubmit={onSubmit} noValidate>
        <FieldGroup>
          {factor === "otp" && emailSent && (
            <FieldDescription role="status">
              {t("twoFactor.emailSent")}
            </FieldDescription>
          )}
          <AuthFormField
            key={factor}
            name="code"
            autoComplete="one-time-code"
            label={t("twoFactor.code")}
            error={invalid.code && t("validation.code")}
          />
          {trustDevice && (
            <Field orientation="horizontal">
              <Checkbox id="trustDevice" name="trustDevice" />
              <FieldLabel htmlFor="trustDevice">
                {t("twoFactor.trustDevice")}
              </FieldLabel>
            </Field>
          )}
          {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
          <Button type="submit" disabled={submitDisabled}>
            {t("twoFactor.submit")}
          </Button>
          {alternatives(factor, emailOtp).map((next) => (
            <Button
              key={next}
              type="button"
              variant="link"
              onClick={() => choose(next)}
            >
              {t(`twoFactor.${switchLabel[next]}`)}
            </Button>
          ))}
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
