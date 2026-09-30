import { getTranslations } from "next-intl/server";
import { AuthFormSkeleton } from "@/components/auth/auth-skeletons";

export default async function Loading() {
  const t = await getTranslations("Auth.twoFactor");
  return (
    <AuthFormSkeleton
      title={t("title")}
      description={t("totpDescription")}
      fields={1}
    />
  );
}
