"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { authRoutes } from "@/lib/auth/routes";
import { signInSchema } from "@/lib/auth/schemas";
import { AuthCard } from "./auth-card";
import { AuthFormField, EmailField } from "./auth-form-field";
import { useAuthForm } from "./use-auth-form";

// Based on the shadcn/ui "login-01" block
export function SignInForm({ callbackPath }: { callbackPath: string }) {
  const t = useTranslations("Auth");
  const { onSubmit, invalid, error, pending } = useAuthForm({
    schema: signInSchema,
    redirectTo: callbackPath,
    submit: (data) => authClient.signIn.email(data),
  });

  return (
    <AuthCard
      title={t("signIn.title")}
      description={t("signIn.description")}
      footer={
        <>
          {t("signIn.noAccount")}{" "}
          <Link href={authRoutes.signUp}>{t("signIn.signUpLink")}</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <EmailField invalid={invalid.email} />
          <AuthFormField
            name="password"
            type="password"
            autoComplete="current-password"
            label={t("fields.password")}
            error={invalid.password && t("errors.invalidCredentials")}
          />
          {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
          <Button type="submit" disabled={pending}>
            {t("signIn.submit")}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
