import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  CreateUserButton,
  CreateUserButtonSkeleton,
} from "@/components/admin/create-user-button";
import { UsersList } from "@/components/admin/users-list";
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
  const t = await getTranslations("Admin.users");

  return (
    <>
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        action={
          // Reads the password policy, so it streams in on its own
          <Suspense fallback={<CreateUserButtonSkeleton />}>
            <CreateUserButton />
          </Suspense>
        }
      />
      <Suspense fallback={<UsersListSkeleton />}>
        <UsersList locale={locale} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
