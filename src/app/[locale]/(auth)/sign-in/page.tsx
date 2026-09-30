import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SignInForm } from "@/components/auth/sign-in-form";
import { parseLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import { safeCallbackPath } from "@/lib/auth/routes";
import { getSession } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.signIn");
  return { title: t("metaTitle") };
}

export default async function SignInPage({
  params,
  searchParams,
}: PageProps<"/[locale]/sign-in">) {
  const locale = parseLocale((await params).locale);
  const { callbackUrl, reset } = await searchParams;
  const callbackPath = safeCallbackPath(
    typeof callbackUrl === "string" ? callbackUrl : undefined,
  );

  // Already signed in: go straight to the destination
  if (await getSession()) {
    redirect({ href: callbackPath, locale });
  }

  const t = await getTranslations("Auth.signIn");
  return (
    <SignInForm
      callbackPath={callbackPath}
      notice={reset === "success" ? t("resetDone") : undefined}
    />
  );
}
