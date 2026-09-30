import { getTranslations } from "next-intl/server";
import { AuthFormSkeleton } from "@/components/auth/auth-skeletons";

export default async function Loading() {
  const t = await getTranslations("Auth.forgotPassword");
  return (
    <AuthFormSkeleton
      title={t("title")}
      description={t("description")}
      fields={1}
    />
  );
}
