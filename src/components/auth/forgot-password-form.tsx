"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { authRoutes, withLocale } from "@/lib/auth/routes";
import { emailSchema } from "@/lib/auth/schemas";
import { AuthCard } from "./auth-card";
import { EmailField } from "./auth-form-field";
import { useAuthForm } from "./use-auth-form";

export function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const { onSubmit, invalid, error, succeeded, submitDisabled } = useAuthForm({
    schema: emailSchema,
    submit: ({ email }) =>
      authClient.requestPasswordReset({
        email,
        redirectTo: withLocale(locale, authRoutes.resetPassword),
      }),
  });

  return (
    <AuthCard
      title={t("forgotPassword.title")}
      description={t("forgotPassword.description")}
      footer={
        <Link href={authRoutes.signIn}>{t("forgotPassword.backToSignIn")}</Link>
      }
    >
      {succeeded ? (
        // Same message whether the account exists or not
        <FieldDescription role="status">
          {t("forgotPassword.sent")}
        </FieldDescription>
      ) : (
        <form method="post" onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <EmailField invalid={invalid.email} />
            {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
            <Button type="submit" disabled={submitDisabled}>
              {t("forgotPassword.submit")}
            </Button>
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  );
}
