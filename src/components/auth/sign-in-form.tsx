"use client";

import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { authRoutes, withLocale } from "@/lib/auth/routes";
import { emailSchema, signInSchema } from "@/lib/auth/schemas";
import { AuthCard } from "./auth-card";
import { AuthFormField, EmailField } from "./auth-form-field";
import { MagicLinkSent } from "./magic-link-sent";
import { useAuthForm } from "./use-auth-form";
import { useMagicLinkForm } from "./use-magic-link-form";

const MAGIC_LINK_INTENT = "magicLink";

type Props = {
  callbackPath: string;
  /** Sign-in methods on in the auth policy (at least one, by the safeguards) */
  methods: { password: boolean; magicLink: boolean };
  magicLinkMinutes: number;
  /** From the auth policy: hides the sign-up link when registrations are closed */
  allowSignUp: boolean;
  /** Shown above the form, e.g. after a password reset or a refused magic link */
  notice?: string;
};

function usePasswordSignIn(callbackPath: string) {
  const locale = useLocale();
  return useAuthForm({
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
}

/**
 * One email field for both methods: "Sign in" uses the password, the magic
 * link button only needs the email (based on the shadcn/ui "login-01" block).
 */
export function SignInForm({
  callbackPath,
  methods,
  magicLinkMinutes,
  allowSignUp,
  notice,
}: Props) {
  const t = useTranslations("Auth");
  const password = usePasswordSignIn(callbackPath);
  const magicLink = useMagicLinkForm({ schema: emailSchema, callbackPath });
  // Messages follow the button pressed last
  const [viaMagicLink, setViaMagicLink] = useState(!methods.password);
  const current = viaMagicLink ? magicLink : password;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const magic =
      !methods.password ||
      (submitter as HTMLButtonElement | null)?.value === MAGIC_LINK_INTENT;
    setViaMagicLink(magic);
    (magic ? magicLink : password).onSubmit(event);
  };

  return (
    <AuthCard
      title={t("signIn.title")}
      description={t(
        methods.password ? "signIn.description" : "magicLink.signInDescription",
      )}
      footer={
        allowSignUp && (
          <>
            {t("signIn.noAccount")}{" "}
            <Link href={authRoutes.signUp}>{t("signIn.signUpLink")}</Link>
          </>
        )
      }
    >
      <form method="post" onSubmit={onSubmit} noValidate>
        <FieldGroup>
          {notice && (
            <FieldDescription role="status">{notice}</FieldDescription>
          )}
          <EmailField invalid={current.invalid.email} />
          {methods.password && (
            <>
              <AuthFormField
                name="password"
                type="password"
                autoComplete="current-password"
                label={t("fields.password")}
                error={
                  password.invalid.password && t("errors.invalidCredentials")
                }
                aside={
                  <Link
                    href={authRoutes.forgotPassword}
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    {t("signIn.forgotPassword")}
                  </Link>
                }
              />
              <Button type="submit" disabled={password.submitDisabled}>
                {t("signIn.submit")}
              </Button>
            </>
          )}
          {methods.password && methods.magicLink && (
            <FieldSeparator>{t("magicLink.divider")}</FieldSeparator>
          )}
          {methods.magicLink && (
            <Button
              type="submit"
              value={MAGIC_LINK_INTENT}
              variant={methods.password ? "outline" : "default"}
              disabled={magicLink.submitDisabled}
            >
              {t("magicLink.submit")}
            </Button>
          )}
          {viaMagicLink && magicLink.sentTo && (
            <MagicLinkSent
              email={magicLink.sentTo}
              minutes={magicLinkMinutes}
            />
          )}
          {current.error && (
            <FieldError>{t(`errors.${current.error}`)}</FieldError>
          )}
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
