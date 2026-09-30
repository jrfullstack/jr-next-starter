import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { USERS_PAGE_SIZE, type UsersQuery, usersHref } from "@/lib/admin/users";

/** Previous/next links that keep the current search, filters and sort */
export function UsersPagination({
  query,
  total,
}: {
  query: UsersQuery;
  total: number;
}) {
  const t = useTranslations("Admin.users.pagination");
  const from = total === 0 ? 0 : (query.page - 1) * USERS_PAGE_SIZE + 1;
  const to = Math.min(query.page * USERS_PAGE_SIZE, total);
  const linkClass = buttonVariants({ variant: "outline", size: "sm" });

  return (
    <nav className="mt-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>{t("summary", { from, to, total })}</p>
      <div className="flex gap-2">
        {query.page > 1 && (
          <Link
            href={usersHref(query, { page: query.page - 1 })}
            className={linkClass}
          >
            {t("previous")}
          </Link>
        )}
        {to < total && (
          <Link
            href={usersHref(query, { page: query.page + 1 })}
            className={linkClass}
          >
            {t("next")}
          </Link>
        )}
      </div>
    </nav>
  );
}
