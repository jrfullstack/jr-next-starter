import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { authRoutes } from "@/lib/auth/routes";
import { getSession } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.verifyEmail");
  return { title: t("metaTitle") };
}

/**
 * Three states: Better Auth redirected here with ?error (bad/expired link),
 * the link verified the email and signed the user in, or the user just
 * signed up and has to check the inbox (?email=).
 */
export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/[locale]/verify-email">) {
  const { email, error } = await searchParams;
  const t = await getTranslations("Auth.verifyEmail");

  if (error) {
    return (
      <AuthCard
        title={t("invalidTitle")}
        description={t("invalidDescription")}
        footer={<Link href={authRoutes.signIn}>{t("signInLink")}</Link>}
      />
    );
  }

  const session = await getSession();
  if (session?.user.emailVerified) {
    return (
      <AuthCard
        title={t("verifiedTitle")}
        description={t("verifiedDescription")}
      >
        <Link href={authRoutes.afterSignIn} className={buttonVariants()}>
          {t("continue")}
        </Link>
      </AuthCard>
    );
  }

  const address = typeof email === "string" ? email : undefined;
  return (
    <AuthCard
      title={t("checkTitle")}
      description={
        address ? t("checkDescription", { email: address }) : t("checkNoEmail")
      }
    >
      {address && <ResendVerificationButton email={address} />}
    </AuthCard>
  );
}
