import type { Locale } from "next-intl";
import { useFormatter, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { SectionCard } from "@/components/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "@/i18n/navigation";
import { adminSection } from "@/lib/admin/sections";
import { requirePermission } from "@/lib/auth/authorization";
import { hasCanonicalParams, parsePage } from "@/lib/search-params";
import { AUDIT_LOG_PAGE_SIZE, findAuditLogPage } from "@/lib/system/audit-log";
import type { PolicyChange, PolicyValue } from "@/lib/system/policy";
import { ListPagination } from "./list-pagination";

const section = adminSection("system");
const PLACEHOLDER_ENTRIES = 3;

function historyHref(page: number) {
  const query: Record<string, string> = page > 1 ? { page: String(page) } : {};
  return { pathname: "/admin/system" as const, query };
}

/** Card around the history; its title is static, so the skeleton shows it too */
export function AuditLogCard({ children }: { children: ReactNode }) {
  const t = useTranslations("Admin.system.history");
  return (
    <SectionCard title={t("title")} description={t("description")}>
      {children}
    </SectionCard>
  );
}

export function AuditLogEntriesSkeleton() {
  return (
    <ul className="divide-y" aria-busy>
      {Array.from({ length: PLACEHOLDER_ENTRIES }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders, never reordered
        <li key={index} className="py-3 first:pt-0">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="mt-1 h-5 w-80 max-w-full" />
        </li>
      ))}
    </ul>
  );
}

type SystemTranslator = ReturnType<typeof useTranslations<"Admin.system">>;

/** Label of the changed field; the switch narrows `field` to that section's keys */
function fieldLabel(t: SystemTranslator, change: PolicyChange) {
  switch (change.section) {
    case "general":
      return t(`fields.general.${change.field}.label`);
    case "emailPassword":
      return t(`fields.emailPassword.${change.field}.label`);
    case "magicLink":
      return t(`fields.magicLink.${change.field}.label`);
    case "google":
      return t(`fields.google.${change.field}.label`);
    case "twoFactor":
      return t(`fields.twoFactor.${change.field}.label`);
  }
}

function formatValue(t: SystemTranslator, value: PolicyValue) {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return t(`twoFactorLevels.${value}`);
  return t(value ? "value.on" : "value.off");
}

function ChangeLine({ change }: { change: PolicyChange }) {
  const t = useTranslations("Admin.system");
  const field = fieldLabel(t, change);
  return (
    <li>
      {t("history.change", {
        section: t(`sections.${change.section}.title`),
        field,
        from: formatValue(t, change.from),
        to: formatValue(t, change.to),
      })}
    </li>
  );
}

async function AuditLogEntries({ page }: { page: number }) {
  const { entries, total } = await findAuditLogPage(page);
  return <AuditLogList entries={entries} total={total} page={page} />;
}

function AuditLogList({
  entries,
  total,
  page,
}: Awaited<ReturnType<typeof findAuditLogPage>> & { page: number }) {
  const t = useTranslations("Admin.system.history");
  const format = useFormatter();
  if (total === 0) return <p className="text-muted-foreground">{t("empty")}</p>;

  return (
    <>
      <ul className="divide-y">
        {entries.map((entry) => (
          <li key={entry.id} className="py-3 first:pt-0">
            <p className="text-sm font-medium">
              {t("entry", {
                actor: entry.actorEmail,
                date: format.dateTime(entry.createdAt, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
              })}
            </p>
            <ul className="text-sm text-muted-foreground">
              {entry.changes.map((change) => (
                <ChangeLine
                  key={`${change.section}.${change.field}`}
                  change={change}
                />
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <ListPagination
        page={page}
        pageSize={AUDIT_LOG_PAGE_SIZE}
        total={total}
        hrefFor={historyHref}
      />
    </>
  );
}

/** Change history, paginated in the database; the entries boundary is keyed by page */
export async function SystemAuditLog({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission(locale, section.permission, section.href);
  const rawParams = await searchParams;
  const page = parsePage(rawParams.page);
  const canonical = historyHref(page);
  if (!hasCanonicalParams(rawParams, canonical.query)) {
    return redirect({ href: canonical, locale });
  }

  return (
    <AuditLogCard>
      <Suspense key={page} fallback={<AuditLogEntriesSkeleton />}>
        <AuditLogEntries page={page} />
      </Suspense>
    </AuditLogCard>
  );
}
