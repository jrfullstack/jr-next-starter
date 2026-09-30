import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { authRoutes } from "@/lib/auth/routes";
import { AuthCard } from "./auth-card";
import { GoogleSignIn } from "./google-sign-in";

/** Sign-up card shared by every method: Google first (if it accepts new accounts), then the form */
export function SignUpCard({
  description,
  google,
  children,
}: {
  description: string;
  google: boolean;
  children?: ReactNode;
}) {
  const t = useTranslations("Auth.signUp");
  return (
    <AuthCard
      title={t("title")}
      description={description}
      footer={
        <>
          {t("hasAccount")}{" "}
          <Link href={authRoutes.signIn}>{t("signInLink")}</Link>
        </>
      }
    >
      {google && (
        <GoogleSignIn
          callbackPath={authRoutes.afterSignIn}
          separator={Boolean(children)}
        />
      )}
      {children}
    </AuthCard>
  );
}
