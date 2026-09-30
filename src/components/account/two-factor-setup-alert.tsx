import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Why every protected page leads here: the policy requires 2FA for this
 * account and it isn't set up yet (requireSession redirects until it is).
 */
export function TwoFactorSetupAlert({ role }: { role?: string | null }) {
  const t = useTranslations("Account.security.twoFactor");
  const privileged = role === "admin" || role === "superadmin";
  return (
    <Alert>
      <ShieldAlert />
      <AlertTitle>{t("setupAlertTitle")}</AlertTitle>
      <AlertDescription>
        {t(privileged ? "setupAlertRole" : "setupAlertEveryone")}
      </AlertDescription>
    </Alert>
  );
}
