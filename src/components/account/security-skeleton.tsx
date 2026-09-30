import { useTranslations } from "next-intl";
import { SectionCard } from "@/components/section-card";
import { Skeleton } from "@/components/ui/skeleton";

const PASSWORD_FIELDS = 3;
const PLACEHOLDER_SESSIONS = 2;

/** Same cards as the page with their real titles; placeholders for fields, buttons and rows */
export function SecuritySkeleton() {
  const t = useTranslations("Account.security");
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <SectionCard
        title={t("password.title")}
        description={t("password.changeDescription")}
      >
        <div className="flex flex-col gap-7">
          {Array.from({ length: PASSWORD_FIELDS }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders, never reordered
            <div key={index} className="flex flex-col gap-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-8 w-40 rounded-lg" />
        </div>
      </SectionCard>
      <SectionCard
        title={t("linked.title")}
        description={t("linked.description")}
      >
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </SectionCard>
      <SectionCard
        title={t("sessions.title")}
        description={t("sessions.description")}
      >
        <ul className="divide-y">
          {Array.from({ length: PLACEHOLDER_SESSIONS }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders, never reordered
            <li key={index} className="py-3 first:pt-0 last:pb-0">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-1 h-5 w-64 max-w-full" />
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
