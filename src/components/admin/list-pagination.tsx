import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type Href = ComponentProps<typeof Link>["href"];

/** Previous/next links of a server-side list; `hrefFor` keeps the rest of its URL state */
export function ListPagination({
  page,
  pageSize,
  total,
  hrefFor,
}: {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (page: number) => Href;
}) {
  const t = useTranslations("Admin.pagination");
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const linkClass = buttonVariants({ variant: "outline", size: "sm" });

  return (
    <nav className="mt-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>{t("summary", { from, to, total })}</p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={hrefFor(page - 1)} className={linkClass}>
            {t("previous")}
          </Link>
        )}
        {to < total && (
          <Link href={hrefFor(page + 1)} className={linkClass}>
            {t("next")}
          </Link>
        )}
      </div>
    </nav>
  );
}
