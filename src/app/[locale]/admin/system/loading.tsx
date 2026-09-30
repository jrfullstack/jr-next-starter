import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AuditLogSkeleton,
  SystemSettingsSkeleton,
} from "@/components/admin/system-skeletons";

export default async function Loading() {
  const t = await getTranslations("Admin.system");
  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <div className="mt-6 flex flex-col gap-6">
        <SystemSettingsSkeleton />
        <AuditLogSkeleton />
      </div>
    </>
  );
}
