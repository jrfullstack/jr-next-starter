import type { Locale } from "next-intl";
import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { adminSections } from "@/lib/admin/sections";
import { parseUsersQuery, type UsersQuery, usersHref } from "@/lib/admin/users";
import { findUsersPage } from "@/lib/admin/users-query";
import { requirePermission } from "@/lib/auth/authorization";
import { hasCanonicalParams } from "@/lib/search-params";
import { UsersFilters } from "./users-filters";
import { UsersPagination } from "./users-pagination";
import { UsersTableSkeleton } from "./users-skeletons";
import { UsersTable } from "./users-table";

const section = adminSections[0];

type Actor = { id: string; role?: string | null };

/** Filtered, sorted and paginated in the database (AGENTS.md: server-side lists) */
async function UsersResults({
  query,
  actor,
}: {
  query: UsersQuery;
  actor: Actor;
}) {
  const { users, total } = await findUsersPage(query);
  return (
    <>
      <UsersTable users={users} actor={actor} query={query} />
      <UsersPagination query={query} total={total} />
    </>
  );
}

/**
 * Reads the session and the URL, so it streams inside a Suspense boundary.
 * The results boundary is keyed by the query: every search, filter, sort or
 * page change shows the table skeleton instead of the stale rows.
 */
export async function UsersList({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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

  return (
    <>
      <div className="mt-6">
        <UsersFilters query={query} />
      </div>
      <div className="mt-6">
        <Suspense
          key={JSON.stringify(query)}
          fallback={<UsersTableSkeleton query={query} />}
        >
          <UsersResults query={query} actor={user} />
        </Suspense>
      </div>
    </>
  );
}
