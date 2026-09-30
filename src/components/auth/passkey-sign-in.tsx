"use client";

import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { type AuthErrorKey, authErrorKey } from "@/lib/auth/errors";

type Result = { error: { code?: string; status?: number } | null };

/** Passkey errors are mostly "cancelled" or "not recognized": one message, unless it's specific */
function passkeyError(error: NonNullable<Result["error"]>): AuthErrorKey {
  const key = authErrorKey(error.code, error.status);
  return key === "generic" ? "passkeyFailed" : key;
}

/**
 * "Sign in with a passkey". A passkey sign-in needs no second factor. No
 * browser autofill (conditional UI): its request starts late and cancels the
 * button's if the user clicks right away.
 */
export function PasskeySignIn({ callbackPath }: { callbackPath: string }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const hydrated = useHydrated();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<AuthErrorKey | null>(null);

  const done = (result: Result) => {
    if (result.error) {
      setError(passkeyError(result.error));
      return;
    }
    router.push(callbackPath);
    router.refresh();
  };

  const signIn = () =>
    startTransition(async () => {
      setError(null);
      done(await authClient.signIn.passkey());
    });

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={!hydrated || pending}
        onClick={signIn}
      >
        <KeyRound />
        {t("passkey.signIn")}
      </Button>
      {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
    </>
  );
}
