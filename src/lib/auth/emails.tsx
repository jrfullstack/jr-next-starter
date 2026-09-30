import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { ActionEmail } from "@/emails/action-email";
import { sendEmail } from "@/lib/email/send";
import { localeFromAuthUrl } from "./routes";

type LinkEmail =
  | { kind: "verifyEmail" | "resetPassword"; name: string; url: string }
  /** No name: the address may not have an account yet */
  | { kind: "magicLink"; expiresInMinutes: number; url: string };

/** Second factor by email: a code instead of a link, so the locale comes separately */
type CodeEmail = { kind: "twoFactorCode"; code: string; locale: Locale };

type AuthEmail = LinkEmail | CodeEmail;

type Translator = Awaited<ReturnType<typeof getTranslations<"Emails">>>;

function bodyAndFootnote(t: Translator, email: AuthEmail) {
  switch (email.kind) {
    case "magicLink":
      return {
        body: t("magicLink.body"),
        footnote: t("magicLink.footnote", { minutes: email.expiresInMinutes }),
      };
    case "twoFactorCode":
      return {
        body: t("twoFactorCode.body"),
        footnote: t("twoFactorCode.footnote"),
      };
    default:
      return {
        body: t(`${email.kind}.body`, { name: email.name }),
        footnote: t(`${email.kind}.footnote`),
      };
  }
}

/**
 * Sends a translated auth email: a single action link (verification,
 * password reset, magic link) or a one-time code (second factor).
 */
export async function sendAuthEmail(email: AuthEmail, to: string) {
  // Links carry the locale in their callbackURL
  const locale =
    email.kind === "twoFactorCode"
      ? email.locale
      : localeFromAuthUrl(email.url);
  const t = await getTranslations({ locale, namespace: "Emails" });
  const subject = t(`${email.kind}.subject`);
  const texts = {
    lang: locale,
    preview: subject,
    heading: t(`${email.kind}.heading`),
    ...bodyAndFootnote(t, email),
    footer: t("footer", { name: siteConfig.name }),
  };

  await sendEmail({
    to,
    subject,
    react:
      email.kind === "twoFactorCode" ? (
        <ActionEmail {...texts} code={email.code} />
      ) : (
        <ActionEmail {...texts} cta={t(`${email.kind}.cta`)} url={email.url} />
      ),
  });
}
