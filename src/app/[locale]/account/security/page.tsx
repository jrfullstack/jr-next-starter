import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { SecuritySections } from "@/components/account/security-sections";
import { SecuritySkeleton } from "@/components/account/security-skeleton";
import { FieldDescription } from "@/components/ui/field";
import { parseLocale } from "@/i18n/locale";
import { callbackErrorMessage } from "@/lib/auth/errors";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Account.security");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/** Linking Google failed: Better Auth comes back with ?error= */
async function LinkError({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const message = callbackErrorMessage((await searchParams).error);
  if (!message) return null;
  const t = await getTranslations("Auth");
  return <FieldDescription role="status">{t(message)}</FieldDescription>;
}

// Static header; everything about the user streams in behind its skeleton
export default async function AccountSecurityPage({
  params,
  searchParams,
}: PageProps<"/[locale]/account/security">) {
  const locale = parseLocale((await params).locale);
  const t = await getTranslations("Account.security");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>
      <div className="mt-8 flex flex-col gap-6">
        <Suspense>
          <LinkError searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<SecuritySkeleton />}>
          <SecuritySections locale={locale} />
        </Suspense>
      </div>
    </main>
  );
}
