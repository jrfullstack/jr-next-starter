import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { parseLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import { authRoutes } from "@/lib/auth/routes";
import { getSession } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth.signUp");
  return { title: t("metaTitle") };
}

export default async function SignUpPage({
  params,
}: PageProps<"/[locale]/sign-up">) {
  const locale = parseLocale((await params).locale);

  if (await getSession()) {
    redirect({ href: authRoutes.afterSignIn, locale });
  }

  return <SignUpForm />;
}
