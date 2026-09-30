import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TwoFactorForm } from "@/components/auth/two-factor-form";
import { safeCallbackPath } from "@/lib/auth/routes";
import { getAuthPolicy } from "@/lib/system/policy-store";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.twoFactor");
  return { title: t("metaTitle") };
}

/** Reached after the first factor (password, magic link or Google) with ?callbackUrl= */
export default async function TwoFactorPage({
  searchParams,
}: PageProps<"/[locale]/two-factor">) {
  const { callbackUrl } = await searchParams;
  const policy = await getAuthPolicy();

  return (
    <TwoFactorForm
      callbackPath={safeCallbackPath(
        typeof callbackUrl === "string" ? callbackUrl : undefined,
      )}
      emailOtp={policy.twoFactor.emailOtp}
      trustDevice={policy.twoFactor.trustDevice}
    />
  );
}
