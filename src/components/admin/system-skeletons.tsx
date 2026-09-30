import { Skeleton } from "@/components/ui/skeleton";
import { AuditLogCard, AuditLogEntriesSkeleton } from "./system-audit-log";
import {
  numberSettings,
  SystemSettingsLayout,
  selectSettings,
} from "./system-settings-layout";

/** Same cards and labels as the form; placeholders where the switches, input and button go */
export function SystemSettingsSkeleton() {
  return (
    <div aria-busy>
      <SystemSettingsLayout
        control={(field) =>
          numberSettings[field] || selectSettings[field] ? (
            <Skeleton
              className={
                selectSettings[field]
                  ? "h-8 w-36 rounded-lg"
                  : "h-8 w-20 rounded-lg"
              }
            />
          ) : (
            <Skeleton className="h-[18.4px] w-8 rounded-full" />
          )
        }
      />
      <div className="mt-4 flex justify-end">
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export function AuditLogSkeleton() {
  return (
    <AuditLogCard>
      <AuditLogEntriesSkeleton />
    </AuditLogCard>
  );
}
