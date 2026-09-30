import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { extractLinks, isOutboxEnabled, listOutbox } from "@/lib/email/outbox";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DevOutbox");
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

/** Emails the app would have sent (no RESEND_API_KEY). Development and CI only. */
export default async function DevOutboxPage() {
  // Request time first: the outbox lives in memory and EMAIL_DEV_OUTBOX is read at runtime
  // (checking before this would bake a static 404 into the build)
  await connection();
  if (!isOutboxEnabled()) notFound();
  const t = await getTranslations("DevOutbox");
  const format = await getFormatter();
  const emails = listOutbox();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>
      {emails.length === 0 && <p className="mt-8">{t("empty")}</p>}
      <ul className="mt-8 flex flex-col gap-8">
        {emails.map((email) => (
          <li key={email.id} className="rounded-lg border p-4">
            <h2 className="font-semibold">{email.subject}</h2>
            <p className="text-sm text-muted-foreground">
              {t("to", {
                to: email.to,
                sentAt: format.dateTime(email.sentAt, { timeStyle: "medium" }),
              })}
            </p>
            <p className="mt-3 text-sm font-medium">{t("links")}</p>
            <ul className="text-sm">
              {extractLinks(email.html).map((href) => (
                <li key={href} className="truncate">
                  <a href={href} className="underline underline-offset-4">
                    {href}
                  </a>
                </li>
              ))}
            </ul>
            <iframe
              title={email.subject}
              srcDoc={email.html}
              sandbox=""
              className="mt-4 h-96 w-full rounded-md border bg-white"
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
