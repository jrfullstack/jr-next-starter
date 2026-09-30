"use client";

import { useTranslations } from "next-intl";
import { FieldDescription, FieldSeparator } from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { authRoutes } from "@/lib/auth/routes";
import { AuthCard } from "./auth-card";
import { EmailSignInForm } from "./email-sign-in-form";
import { GoogleSignIn } from "./google-sign-in";
import { PasskeySignIn } from "./passkey-sign-in";

type Props = {
  callbackPath: string;
  /** Sign-in methods on in the auth policy (at least one, by the safeguards) */
  methods: {
    password: boolean;
    magicLink: boolean;
    google: boolean;
    passkey: boolean;
  };
  magicLinkMinutes: number;
  /** From the auth policy: hides the sign-up link when registrations are closed */
  allowSignUp: boolean;
  /** Shown above everything, e.g. after a password reset or a failed Google sign-in */
  notice?: string;
};

function descriptionKey(methods: Props["methods"]) {
  if (methods.password) return "signIn.description" as const;
  if (methods.magicLink) return "magicLink.signInDescription" as const;
  if (methods.google) return "google.signInDescription" as const;
  return "passkey.signInDescription" as const;
}

/** Sign-in card: Google first (if on), then the email form for password and magic link */
export function SignInForm({
  callbackPath,
  methods,
  magicLinkMinutes,
  allowSignUp,
  notice,
}: Props) {
  const t = useTranslations("Auth");
  const emailMethods = methods.password || methods.magicLink;

  return (
    <AuthCard
      title={t("signIn.title")}
      description={t(descriptionKey(methods))}
      footer={
        allowSignUp && (
          <>
            {t("signIn.noAccount")}{" "}
            <Link href={authRoutes.signUp}>{t("signIn.signUpLink")}</Link>
          </>
        )
      }
    >
      {notice && <FieldDescription role="status">{notice}</FieldDescription>}
      {(methods.google || methods.passkey) && (
        <div className="flex flex-col gap-3">
          {methods.google && <GoogleSignIn callbackPath={callbackPath} />}
          {methods.passkey && <PasskeySignIn callbackPath={callbackPath} />}
        </div>
      )}
      {(methods.google || methods.passkey) && emailMethods && (
        <FieldSeparator>{t("or")}</FieldSeparator>
      )}
      {emailMethods && (
        <EmailSignInForm
          callbackPath={callbackPath}
          methods={methods}
          magicLinkMinutes={magicLinkMinutes}
        />
      )}
    </AuthCard>
  );
}
