import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { ActionEmail } from "@/emails/action-email";
import { sendEmail } from "@/lib/email/send";
import { localeFromAuthUrl } from "./routes";

type AuthEmail =
  | { kind: "verifyEmail" | "resetPassword"; name: string }
  /** No name: the address may not have an account yet */
  | { kind: "magicLink"; expiresInMinutes: number };

async function authEmailTexts(email: AuthEmail, url: string) {
  const locale = localeFromAuthUrl(url);
  const t = await getTranslations({ locale, namespace: "Emails" });
  const texts =
    email.kind === "magicLink"
      ? {
          body: t("magicLink.body"),
          footnote: t("magicLink.footnote", {
            minutes: email.expiresInMinutes,
          }),
        }
      : {
          body: t(`${email.kind}.body`, { name: email.name }),
          footnote: t(`${email.kind}.footnote`),
        };
  return {
    ...texts,
    locale,
    subject: t(`${email.kind}.subject`),
    heading: t(`${email.kind}.heading`),
    cta: t(`${email.kind}.cta`),
    footer: t("footer", { name: siteConfig.name }),
  };
}

/** Sends a translated auth email with a single action link (verification, password reset, magic link) */
export async function sendAuthEmail(
  email: AuthEmail,
  { to, url }: { to: string; url: string },
) {
  const { locale, subject, ...texts } = await authEmailTexts(email, url);

  await sendEmail({
    to,
    subject,
    react: <ActionEmail lang={locale} preview={subject} url={url} {...texts} />,
  });
}
