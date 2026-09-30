import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { parseLocale } from "@/i18n/locale";
import { requireSession } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function DashboardPage({
  params,
}: PageProps<"/[locale]/dashboard">) {
  const locale = parseLocale((await params).locale);
  const { user } = await requireSession(locale, "/dashboard");
  const t = await getTranslations("Dashboard");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        {t("title", { name: user.name })}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {t("description", { email: user.email })}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("role", { role: user.role ?? "user" })}
      </p>
    </main>
  );
}
