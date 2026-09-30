"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { authClient } from "@/lib/auth/client";
import { authRoutes } from "@/lib/auth/routes";
import { resetPasswordSchema } from "@/lib/auth/schemas";
import { AuthCard } from "./auth-card";
import { NewPasswordFields } from "./auth-form-field";
import { useAuthForm } from "./use-auth-form";

export function ResetPasswordForm({
  token,
  minPasswordLength,
}: {
  token: string;
  minPasswordLength: number;
}) {
  const t = useTranslations("Auth");
  const { onSubmit, invalid, error, submitDisabled } = useAuthForm({
    schema: resetPasswordSchema(minPasswordLength),
    redirectTo: { pathname: authRoutes.signIn, query: { reset: "success" } },
    submit: ({ password }) =>
      authClient.resetPassword({ newPassword: password, token }),
  });

  return (
    <AuthCard
      title={t("resetPassword.title")}
      description={t("resetPassword.description")}
    >
      <form method="post" onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <NewPasswordFields invalid={invalid} min={minPasswordLength} />
          {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
          <Button type="submit" disabled={submitDisabled}>
            {t("resetPassword.submit")}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
