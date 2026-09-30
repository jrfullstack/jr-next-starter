import { db } from "@/lib/db";
import { parseAuthPolicy, policyChanges } from "./policy";

export const AUDIT_LOG_PAGE_SIZE = 10;

/** One page of the System change history, newest first, with its field-level changes */
export async function findAuditLogPage(page: number) {
  const [entries, total] = await db.$transaction([
    db.systemAuditLog.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * AUDIT_LOG_PAGE_SIZE,
      take: AUDIT_LOG_PAGE_SIZE,
    }),
    db.systemAuditLog.count(),
  ]);
  return {
    total,
    entries: entries.map(({ id, actorEmail, createdAt, before, after }) => ({
      id,
      actorEmail,
      createdAt,
      changes: policyChanges(parseAuthPolicy(before), parseAuthPolicy(after)),
    })),
  };
}
