import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Link } from "@/i18n/navigation";
import { authRoutes } from "@/lib/auth/routes";
import { getAuthPolicy } from "@/lib/system/policy-store";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.resetPassword");
  return { title: t("metaTitle") };
}

/** Better Auth redirects here from the email link with ?token=… or ?error=INVALID_TOKEN */
export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/[locale]/reset-password">) {
  const { token, error } = await searchParams;

  if (error || typeof token !== "string") {
    const t = await getTranslations("Auth.resetPassword");
    return (
      <AuthCard
        title={t("invalidTitle")}
        description={t("invalidDescription")}
        footer={<Link href={authRoutes.forgotPassword}>{t("requestNew")}</Link>}
      />
    );
  }

  const policy = await getAuthPolicy();
  return (
    <ResetPasswordForm
      token={token}
      minPasswordLength={policy.emailPassword.minPasswordLength}
    />
  );
}
