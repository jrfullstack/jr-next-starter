"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { authRoutes } from "@/lib/auth/routes";
import { magicLinkSignUpSchema } from "@/lib/auth/schemas";
import { AuthFormField, EmailField } from "./auth-form-field";
import { MagicLinkSent } from "./magic-link-sent";
import { SignUpCard } from "./sign-up-card";
import { useMagicLinkForm } from "./use-magic-link-form";

/** Sign-up when only the magic link accepts new accounts: opening the link creates it */
export function MagicLinkSignUpForm({
  minutes,
  google,
}: {
  minutes: number;
  /** Google also accepts new accounts: its button goes first */
  google: boolean;
}) {
  const t = useTranslations("Auth");
  const { onSubmit, invalid, error, submitDisabled, sentTo } = useMagicLinkForm(
    {
      schema: magicLinkSignUpSchema,
      callbackPath: authRoutes.afterSignIn,
    },
  );

  return (
    <SignUpCard description={t("magicLink.signUpDescription")} google={google}>
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
    </SignUpCard>
  );
}
