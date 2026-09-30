"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { authRoutes } from "@/lib/auth/routes";
import { magicLinkSignUpSchema } from "@/lib/auth/schemas";
import { AuthCard } from "./auth-card";
import { AuthFormField, EmailField } from "./auth-form-field";
import { MagicLinkSent } from "./magic-link-sent";
import { useMagicLinkForm } from "./use-magic-link-form";

/** Sign-up when only the magic link accepts new accounts: opening the link creates it */
export function MagicLinkSignUpForm({ minutes }: { minutes: number }) {
  const t = useTranslations("Auth");
  const { onSubmit, invalid, error, submitDisabled, sentTo } = useMagicLinkForm(
    {
      schema: magicLinkSignUpSchema,
      callbackPath: authRoutes.afterSignIn,
    },
  );

  return (
    <AuthCard
      title={t("signUp.title")}
      description={t("magicLink.signUpDescription")}
      footer={
        <>
          {t("signUp.hasAccount")}{" "}
          <Link href={authRoutes.signIn}>{t("signUp.signInLink")}</Link>
        </>
      }
    >
      {sentTo ? (
        <MagicLinkSent email={sentTo} minutes={minutes} />
      ) : (
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
            {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
            <Button type="submit" disabled={submitDisabled}>
              {t("magicLink.submit")}
            </Button>
          </FieldGroup>
        </form>
      )}
    </AuthCard>
  );
}
