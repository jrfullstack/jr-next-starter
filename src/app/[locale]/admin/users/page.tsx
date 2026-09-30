import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { UsersList } from "@/components/admin/users-list";
import { UsersPageHeader } from "@/components/admin/users-page-header";
import { UsersListSkeleton } from "@/components/admin/users-skeletons";
import { parseLocale } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin.users");
  return { title: t("metaTitle") };
}

// The header is static (prerendered); the list reads the session and the URL, so it streams
export default async function AdminUsersPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/users">) {
  const locale = parseLocale((await params).locale);

  return (
    <>
      <UsersPageHeader action={<CreateUserDialog />} />
      <Suspense fallback={<UsersListSkeleton />}>
        <UsersList locale={locale} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
