"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { authRoutes } from "@/lib/auth/routes";
import { PASSWORD_MIN_LENGTH, signUpSchema } from "@/lib/auth/schemas";
import { AuthCard } from "./auth-card";
import { AuthFormField, EmailField } from "./auth-form-field";
import { useAuthForm } from "./use-auth-form";

// Based on the shadcn/ui "signup-01" block
export function SignUpForm() {
  const t = useTranslations("Auth");
  const { onSubmit, invalid, error, pending } = useAuthForm({
    schema: signUpSchema,
    redirectTo: authRoutes.afterSignIn,
    submit: ({ name, email, password }) =>
      authClient.signUp.email({ name, email, password }),
  });
  const min = PASSWORD_MIN_LENGTH;

  return (
    <AuthCard
      title={t("signUp.title")}
      description={t("signUp.description")}
      footer={
        <>
          {t("signUp.hasAccount")}{" "}
          <Link href={authRoutes.signIn}>{t("signUp.signInLink")}</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <AuthFormField
            name="name"
            autoComplete="name"
            label={t("fields.name")}
            placeholder={t("placeholders.name")}
            error={invalid.name && t("validation.name")}
          />
          <EmailField invalid={invalid.email} />
          <AuthFormField
            name="password"
            type="password"
            autoComplete="new-password"
            label={t("fields.password")}
            hint={t("signUp.passwordHint", { min })}
            error={invalid.password && t("validation.password", { min })}
          />
          <AuthFormField
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            label={t("fields.confirmPassword")}
            error={invalid.confirmPassword && t("validation.confirmPassword")}
          />
          {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
          <Button type="submit" disabled={pending}>
            {t("signUp.submit")}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
