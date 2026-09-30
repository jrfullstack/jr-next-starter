import { getTranslations } from "next-intl/server";
import { AuthFormSkeleton } from "@/components/auth/auth-skeletons";

// Default policy: password and magic link, so both buttons with the "or" between them
export default async function Loading() {
  const t = await getTranslations("Auth");
  return (
    <AuthFormSkeleton
      title={t("signIn.title")}
      description={t("signIn.description")}
      fields={2}
      secondaryAction={t("magicLink.divider")}
    />
  );
}
