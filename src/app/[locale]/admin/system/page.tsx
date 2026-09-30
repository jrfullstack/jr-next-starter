import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SystemAuditLog } from "@/components/admin/system-audit-log";
import { SystemSettings } from "@/components/admin/system-settings";
import {
  AuditLogSkeleton,
  SystemSettingsSkeleton,
} from "@/components/admin/system-skeletons";
import { parseLocale } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin.system");
  return { title: t("metaTitle") };
}

// Static header; the settings (session + policy) and the history (URL + database) stream separately
export default async function AdminSystemPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/system">) {
  const locale = parseLocale((await params).locale);
  const t = await getTranslations("Admin.system");

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <div className="mt-6 flex flex-col gap-6">
        <Suspense fallback={<SystemSettingsSkeleton />}>
          <SystemSettings locale={locale} />
        </Suspense>
        <Suspense fallback={<AuditLogSkeleton />}>
          <SystemAuditLog locale={locale} searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
