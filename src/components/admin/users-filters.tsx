import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Link } from "@/i18n/navigation";
import {
  type UsersQuery,
  userRoles,
  userStatuses,
  usersHref,
} from "@/lib/admin/users";

/**
 * Plain GET form: filters live in the URL and the server runs the query.
 * The current sort travels in hidden fields so filtering keeps it.
 */
export function UsersFilters({ query }: { query: UsersQuery }) {
  const t = useTranslations("Admin.users");
  const hasFilters = Boolean(query.search || query.role || query.status);

  return (
    <form className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="sort" value={query.sort} />
      <input type="hidden" name="order" value={query.order} />
      <Input
        name="q"
        type="search"
        defaultValue={query.search}
        aria-label={t("searchLabel")}
        placeholder={t("searchLabel")}
        className="w-64"
      />
      <NativeSelect
        name="role"
        defaultValue={query.role ?? ""}
        aria-label={t("filters.role")}
      >
        <NativeSelectOption value="">
          {t("filters.allRoles")}
        </NativeSelectOption>
        {userRoles.map((role) => (
          <NativeSelectOption key={role} value={role}>
            {t(`roles.${role}`)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        name="status"
        defaultValue={query.status ?? ""}
        aria-label={t("filters.status")}
      >
        <NativeSelectOption value="">
          {t("filters.allStatuses")}
        </NativeSelectOption>
        {userStatuses.map((status) => (
          <NativeSelectOption key={status} value={status}>
            {t(`status.${status}`)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Button type="submit" variant="outline">
        {t("search")}
      </Button>
      {hasFilters && (
        <Link
          href={usersHref(query, {
            search: "",
            role: undefined,
            status: undefined,
          })}
          className={buttonVariants({ variant: "ghost" })}
        >
          {t("filters.clear")}
        </Link>
      )}
    </form>
  );
}
