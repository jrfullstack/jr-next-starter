import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { UsersFilters } from "@/components/admin/users-filters";
import { UsersPagination } from "@/components/admin/users-pagination";
import { UsersTable } from "@/components/admin/users-table";
import { parseLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import { adminSections } from "@/lib/admin/sections";
import { parseUsersQuery, usersHref } from "@/lib/admin/users";
import { findUsersPage } from "@/lib/admin/users-query";
import { requirePermission } from "@/lib/auth/authorization";
import { hasCanonicalParams } from "@/lib/search-params";

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
  const rawParams = await searchParams;
  const query = parseUsersQuery(rawParams);
  // Empty GET-form fields, defaults or unknown values: redirect to the clean URL
  const canonical = usersHref(query, { page: query.page });
  if (!hasCanonicalParams(rawParams, canonical.query)) {
    return redirect({ href: canonical, locale });
  }
  const t = await getTranslations("Admin.users");

  // Filtered, sorted and paginated in the database (AGENTS.md: server-side lists)
  const { users, total } = await findUsersPage(query);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("description")}</p>
        </div>
        <CreateUserDialog />
      </div>
      <div className="mt-6">
        <UsersFilters query={query} />
      </div>
      <div className="mt-6">
        <UsersTable users={users} actor={user} query={query} />
        <UsersPagination query={query} total={total} />
      </div>
    </>
  );
}
