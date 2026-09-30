import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
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
  // Registrations closed in Admin → System (the API refuses them as well)
  if (!canSignUp(policy, "emailPassword")) {
    const t = await getTranslations("Auth.signUp");
    return (
      <AuthCard
        title={t("closedTitle")}
        description={t("closedDescription")}
        footer={<Link href={authRoutes.signIn}>{t("signInLink")}</Link>}
      />
    );
  }

  return (
    <SignUpForm
      minPasswordLength={policy.emailPassword.minPasswordLength}
      requireEmailVerification={policy.emailPassword.requireEmailVerification}
    />
  );
}
