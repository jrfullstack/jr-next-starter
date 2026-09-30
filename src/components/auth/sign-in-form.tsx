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
import { signInSchema } from "@/lib/auth/schemas";
import { AuthCard } from "./auth-card";
import { AuthFormField, EmailField } from "./auth-form-field";
import { useAuthForm } from "./use-auth-form";

// Based on the shadcn/ui "login-01" block
export function SignInForm({
  callbackPath,
  notice,
}: {
  callbackPath: string;
  /** Confirmation shown above the form, e.g. after a password reset */
  notice?: string;
}) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const { onSubmit, invalid, error, submitDisabled } = useAuthForm({
    schema: signInSchema,
    redirectTo: callbackPath,
    // Better Auth redirects to callbackURL on success; an unverified user gets a
    // fresh verification link that also lands there, already signed in
    submit: (data) =>
      authClient.signIn.email({
        ...data,
        callbackURL: withLocale(locale, callbackPath),
      }),
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
      <form method="post" onSubmit={onSubmit} noValidate>
        <FieldGroup>
          {notice && (
            <FieldDescription role="status">{notice}</FieldDescription>
          )}
          <EmailField invalid={invalid.email} />
          <AuthFormField
            name="password"
            type="password"
            autoComplete="current-password"
            label={t("fields.password")}
            error={invalid.password && t("errors.invalidCredentials")}
            aside={
              <Link
                href={authRoutes.forgotPassword}
                className="text-sm underline-offset-4 hover:underline"
              >
                {t("signIn.forgotPassword")}
              </Link>
            }
          />
          {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
          <Button type="submit" disabled={submitDisabled}>
            {t("signIn.submit")}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
