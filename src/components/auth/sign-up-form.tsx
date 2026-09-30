"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { authRoutes, withLocale } from "@/lib/auth/routes";
import { signUpSchema } from "@/lib/auth/schemas";
import { AuthCard } from "./auth-card";
import {
  AuthFormField,
  EmailField,
  NewPasswordFields,
} from "./auth-form-field";
import { useAuthForm } from "./use-auth-form";

// Based on the shadcn/ui "signup-01" block
export function SignUpForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const { onSubmit, invalid, error, submitDisabled } = useAuthForm({
    schema: signUpSchema,
    // No session until the email is verified: show "check your email"
    redirectTo: ({ email }) => ({
      pathname: authRoutes.verifyEmail,
      query: { email },
    }),
    submit: ({ name, email, password }) =>
      authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: withLocale(locale, authRoutes.verifyEmail),
      }),
  });

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
      <form method="post" onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <AuthFormField
            name="name"
            autoComplete="name"
            label={t("fields.name")}
            placeholder={t("placeholders.name")}
            error={invalid.name && t("validation.name")}
          />
          <EmailField invalid={invalid.email} />
          <NewPasswordFields invalid={invalid} />
          {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
          <Button type="submit" disabled={submitDisabled}>
            {t("signUp.submit")}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
