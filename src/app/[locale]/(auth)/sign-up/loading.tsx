import { getTranslations } from "next-intl/server";
import { AuthFormSkeleton } from "@/components/auth/auth-skeletons";
import { authCapabilities } from "@/lib/system/policy-store";

// Default policy: the password form, plus Google's button with credentials
export default async function Loading() {
  const t = await getTranslations("Auth");
  return (
    <AuthFormSkeleton
      title={t("signUp.title")}
      description={t("signUp.description")}
      fields={4}
      leading={{
        buttons: authCapabilities().google ? 1 : 0,
        separator: t("or"),
      }}
    />
  );
}
