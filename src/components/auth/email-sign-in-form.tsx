"use client";

import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { authRoutes, withLocale } from "@/lib/auth/routes";
import { emailSchema, signInSchema } from "@/lib/auth/schemas";
import { AuthFormField, EmailField } from "./auth-form-field";
import { MagicLinkSent } from "./magic-link-sent";
import { useAuthForm } from "./use-auth-form";
import { useMagicLinkForm } from "./use-magic-link-form";

const MAGIC_LINK_INTENT = "magicLink";

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
 * One email field for both email methods: "Sign in" uses the password, the
 * magic link button only needs the email (based on the shadcn/ui "login-01" block).
 */
export function EmailSignInForm({
  callbackPath,
  methods,
  magicLinkMinutes,
}: {
  callbackPath: string;
  methods: { password: boolean; magicLink: boolean };
  magicLinkMinutes: number;
}) {
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
    <form method="post" onSubmit={onSubmit} noValidate>
      <FieldGroup>
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
          <FieldSeparator>{t("or")}</FieldSeparator>
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
          <MagicLinkSent email={magicLink.sentTo} minutes={magicLinkMinutes} />
        )}
        {current.error && (
          <FieldError>{t(`errors.${current.error}`)}</FieldError>
        )}
      </FieldGroup>
    </form>
  );
}
