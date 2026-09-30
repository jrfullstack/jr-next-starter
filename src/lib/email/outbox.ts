import { env } from "@/env";

export type OutboxEmail = {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: Date;
};

const MAX_EMAILS = 50;

// Survives hot reloads in dev; one list per server process
const globalForOutbox = globalThis as unknown as { outbox?: OutboxEmail[] };
if (!globalForOutbox.outbox) globalForOutbox.outbox = [];
const outbox = globalForOutbox.outbox;

/** Dev outbox: always in development; in production only when CI opts in */
export function isOutboxEnabled() {
  return env.NODE_ENV !== "production" || env.EMAIL_DEV_OUTBOX === "1";
}

export function addToOutbox(email: Omit<OutboxEmail, "id" | "sentAt">) {
  outbox.unshift({ ...email, id: crypto.randomUUID(), sentAt: new Date() });
  outbox.length = Math.min(outbox.length, MAX_EMAILS);
}

/** Newest first */
export function listOutbox(): readonly OutboxEmail[] {
  return outbox;
}

/** Link targets inside an email's HTML, e.g. the verification URL */
export function extractLinks(html: string) {
  return [...html.matchAll(/href="([^"]+)"/g)].map(([, href = ""]) =>
    href.replaceAll("&amp;", "&"),
  );
}
