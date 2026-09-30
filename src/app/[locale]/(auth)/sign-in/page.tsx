import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SignInForm } from "@/components/auth/sign-in-form";
import { parseLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import { callbackErrorMessage } from "@/lib/auth/errors";
import { safeCallbackPath } from "@/lib/auth/routes";
import { getSession } from "@/lib/auth/session";
import { canSignIn, canSignUpAny } from "@/lib/system/policy";
import { getAuthPolicy } from "@/lib/system/policy-store";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.signIn");
  return { title: t("metaTitle") };
}

export default async function SignInPage({
  params,
  searchParams,
}: PageProps<"/[locale]/sign-in">) {
  const locale = parseLocale((await params).locale);
  const { callbackUrl, reset, error } = await searchParams;
  const callbackPath = safeCallbackPath(
    typeof callbackUrl === "string" ? callbackUrl : undefined,
  );

  // Already signed in: go straight to the destination
  if (await getSession()) {
    redirect({ href: callbackPath, locale });
  }

  const t = await getTranslations("Auth");
  const policy = await getAuthPolicy();
  // ?error= comes from a magic link or Google sign-in that failed
  const linkError = callbackErrorMessage(error);
  const resetNotice = reset === "success" ? t("signIn.resetDone") : undefined;

  return (
    <SignInForm
      callbackPath={callbackPath}
      methods={{
        password: canSignIn(policy, "emailPassword"),
        magicLink: canSignIn(policy, "magicLink"),
        google: canSignIn(policy, "google"),
        passkey: canSignIn(policy, "passkey"),
      }}
      magicLinkMinutes={policy.magicLink.expiresInMinutes}
      allowSignUp={canSignUpAny(policy)}
      notice={linkError ? t(linkError) : resetNotice}
    />
  );
}
