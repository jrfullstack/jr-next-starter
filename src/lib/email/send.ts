import type { ReactElement } from "react";
import { render } from "react-email";
import { Resend } from "resend";
import { env } from "@/env";
import { addToOutbox, isOutboxEnabled } from "./outbox";

export type Email = { to: string; subject: string; react: ReactElement };

// RFC 2606 / 6761 reserved names: they can never receive real mail (e2e test users use them)
const reservedDomains =
  /(^|\.)(example\.(com|org|net)|test|example|invalid|localhost)$/i;

/** True for addresses that must never be sent through a real provider */
export function isReservedEmail(address: string) {
  const domain = address.split("@").pop() ?? "";
  return reservedDomains.test(domain);
}

/**
 * - Dev outbox (development, or CI with EMAIL_DEV_OUTBOX=1) always keeps a copy.
 * - Resend sends it when RESEND_API_KEY is set, except to reserved test domains.
 * - Production without Resend fails loudly, so a verification email is never lost.
 */
export async function sendEmail(email: Email) {
  const outbox = isOutboxEnabled();
  if (outbox) await deliverToOutbox(email);

  if (env.RESEND_API_KEY && !isReservedEmail(email.to)) {
    await sendWithResend(env.RESEND_API_KEY, email);
    return;
  }
  if (!outbox) {
    throw new Error("RESEND_API_KEY is required to send emails in production");
  }
}

async function sendWithResend(apiKey: string, { to, subject, react }: Email) {
  if (!env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is required when RESEND_API_KEY is set");
  }
  const { error } = await new Resend(apiKey).emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    react,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

async function deliverToOutbox({ to, subject, react }: Email) {
  addToOutbox({ to, subject, html: await render(react) });
  // biome-ignore lint/suspicious/noConsole: dev-only notice that an email is waiting in the outbox
  console.info(`✉️  "${subject}" → ${to} (see /dev/outbox)`);
}
