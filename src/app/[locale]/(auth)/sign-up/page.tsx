import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { MagicLinkSignUpForm } from "@/components/auth/magic-link-sign-up-form";
import { SignUpCard } from "@/components/auth/sign-up-card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { parseLocale } from "@/i18n/locale";
import { Link, redirect } from "@/i18n/navigation";
import { authRoutes } from "@/lib/auth/routes";
import { getSession } from "@/lib/auth/session";
import { canSignUp } from "@/lib/system/policy";
import { getAuthPolicy } from "@/lib/system/policy-store";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.signUp");
  return { title: t("metaTitle") };
}

export default async function SignUpPage({
  params,
}: PageProps<"/[locale]/sign-up">) {
  const locale = parseLocale((await params).locale);

  if (await getSession()) {
    redirect({ href: authRoutes.afterSignIn, locale });
  }

  const policy = await getAuthPolicy();
  const google = canSignUp(policy, "google");
  if (canSignUp(policy, "emailPassword")) {
    return (
      <SignUpForm
        minPasswordLength={policy.emailPassword.minPasswordLength}
        requireEmailVerification={policy.emailPassword.requireEmailVerification}
        google={google}
      />
    );
  }
  // Only the magic link (and maybe Google) accepts new accounts: the link creates it
  if (canSignUp(policy, "magicLink")) {
    return (
      <MagicLinkSignUpForm
        minutes={policy.magicLink.expiresInMinutes}
        google={google}
      />
    );
  }

  const t = await getTranslations("Auth");
  if (google) {
    return <SignUpCard description={t("google.signUpDescription")} google />;
  }

  // Registrations closed in Admin → System (the API refuses them as well)
  return (
    <AuthCard
      title={t("signUp.closedTitle")}
      description={t("signUp.closedDescription")}
      footer={<Link href={authRoutes.signIn}>{t("signUp.signInLink")}</Link>}
    />
  );
}
