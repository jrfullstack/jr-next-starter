import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { UsersPagination } from "@/components/admin/users-pagination";
import { UsersTable } from "@/components/admin/users-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseLocale } from "@/i18n/locale";
import { adminSections } from "@/lib/admin/sections";
import { parseUsersQuery, USERS_PAGE_SIZE } from "@/lib/admin/users";
import { requirePermission } from "@/lib/auth/authorization";
import { auth } from "@/lib/auth/server";

const section = adminSections[0];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin.users");
  return { title: t("metaTitle") };
}

export default async function AdminUsersPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/users">) {
  const locale = parseLocale((await params).locale);
  const { user } = await requirePermission(
    locale,
    section.permission,
    section.href,
  );
  const { search, page, offset } = parseUsersQuery(await searchParams);
  const t = await getTranslations("Admin.users");

  // Better Auth checks the permission again and filters on the database
  const { users, total } = await auth.api.listUsers({
    headers: await headers(),
    query: {
      ...(search && {
        searchValue: search,
        searchField: "email",
        searchOperator: "contains",
      }),
      limit: USERS_PAGE_SIZE,
      offset,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  });

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("description")}</p>
        </div>
        <CreateUserDialog />
      </div>
      {/* Plain GET form: the search lives in the URL (shareable, back button works) */}
      <form className="mt-6 flex max-w-md gap-2">
        <Input
          name="q"
          type="search"
          defaultValue={search}
          aria-label={t("searchLabel")}
          placeholder={t("searchLabel")}
        />
        <Button type="submit" variant="outline">
          {t("search")}
        </Button>
      </form>
      <div className="mt-6">
        <UsersTable users={users} actor={user} />
        <UsersPagination page={page} total={total} search={search} />
      </div>
    </>
  );
}
