import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { ActionEmail } from "@/emails/action-email";
import { sendEmail } from "@/lib/email/send";
import { localeFromAuthUrl } from "./routes";

type AuthEmailKind = "verifyEmail" | "resetPassword";

/** Sends a translated auth email with a single action link (verification, password reset) */
export async function sendAuthEmail(
  kind: AuthEmailKind,
  { to, name, url }: { to: string; name: string; url: string },
) {
  const locale = localeFromAuthUrl(url);
  const t = await getTranslations({ locale, namespace: "Emails" });
  const subject = t(`${kind}.subject`);

  await sendEmail({
    to,
    subject,
    react: (
      <ActionEmail
        lang={locale}
        preview={subject}
        heading={t(`${kind}.heading`)}
        body={t(`${kind}.body`, { name })}
        cta={t(`${kind}.cta`)}
        url={url}
        footnote={t(`${kind}.footnote`)}
        footer={t("footer", { name: siteConfig.name })}
      />
    ),
  });
}
