"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldSeparator } from "@/components/ui/field";
import { useHydrated } from "@/hooks/use-hydrated";
import { authClient } from "@/lib/auth/client";
import { type AuthErrorKey, authErrorKey } from "@/lib/auth/errors";
import { authRoutes, withLocale } from "@/lib/auth/routes";
import { GoogleIcon } from "./google-icon";

/**
 * "Continue with Google": Better Auth sends the browser to Google and back
 * to `callbackPath` (or to sign-in with ?error= if it fails). With
 * `separator`, an "or" follows it before the rest of the form.
 */
export function GoogleSignIn({
  callbackPath,
  separator = false,
}: {
  callbackPath: string;
  separator?: boolean;
}) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const hydrated = useHydrated();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<AuthErrorKey | null>(null);

  const signIn = () =>
    startTransition(async () => {
      const callbackURL = withLocale(locale, callbackPath);
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL: withLocale(locale, authRoutes.signIn),
      });
      if (result.error) {
        setError(authErrorKey(result.error.code, result.error.status));
      }
    });

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={!hydrated || pending}
        onClick={signIn}
      >
        <GoogleIcon />
        {t("google.continue")}
      </Button>
      {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
      {separator && <FieldSeparator>{t("or")}</FieldSeparator>}
    </>
  );
}
