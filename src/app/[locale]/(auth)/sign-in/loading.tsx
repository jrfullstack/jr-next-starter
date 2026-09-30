import { getTranslations } from "next-intl/server";
import { AuthFormSkeleton } from "@/components/auth/auth-skeletons";
import { authCapabilities } from "@/lib/system/policy-store";

// Default policy: password and magic link (both buttons with "or"), plus Google with credentials
export default async function Loading() {
  const t = await getTranslations("Auth");
  return (
    <AuthFormSkeleton
      title={t("signIn.title")}
      description={t("signIn.description")}
      fields={2}
      secondaryAction={t("or")}
      // Passkey button always (on by default), Google's too with credentials
      leading={{
        buttons: authCapabilities().google ? 2 : 1,
        separator: t("or"),
      }}
    />
  );
}
