import { getTranslations } from "next-intl/server";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreateUserButtonSkeleton } from "@/components/admin/create-user-button";
import { UsersListSkeleton } from "@/components/admin/users-skeletons";

export default async function Loading() {
  const t = await getTranslations("Admin.users");
  return (
    <>
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        action={<CreateUserButtonSkeleton />}
      />
      <UsersListSkeleton />
    </>
  );
}
