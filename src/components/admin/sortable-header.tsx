import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { TableHead } from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import {
  nextSort,
  type UserSortField,
  type UsersQuery,
  usersHref,
} from "@/lib/admin/users";

const icons = { asc: ArrowUp, desc: ArrowDown, none: ArrowUpDown };
const ariaSort = {
  asc: "ascending",
  desc: "descending",
  none: "none",
} as const;

/**
 * Column header that sorts on the server through the URL. Without a query
 * (skeleton before the URL is read) it looks the same but links nowhere.
 */
export function SortableHeader({
  field,
  label,
  query,
}: {
  field: UserSortField;
  label: string;
  query?: UsersQuery;
}) {
  const t = useTranslations("Admin.users");
  if (!query) {
    return (
      <TableHead>
        <span className="inline-flex items-center gap-1">
          {label}
          <icons.none className="size-3.5" aria-hidden />
        </span>
      </TableHead>
    );
  }
  const direction = query.sort === field ? query.order : "none";
  const Icon = icons[direction];

  return (
    <TableHead aria-sort={ariaSort[direction]}>
      <Link
        href={usersHref(query, nextSort(query, field))}
        aria-label={t("sortBy", { column: label })}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        <Icon className="size-3.5" aria-hidden />
      </Link>
    </TableHead>
  );
}
