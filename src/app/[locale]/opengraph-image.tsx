import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { localeStaticParams, parseLocale } from "@/i18n/locale";

// Image shown when a page is shared (social networks, chats…). Also used for Twitter/X.
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const generateStaticParams = localeStaticParams;

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        gap: 24,
        background: "#0a0a0a",
        color: "#fafafa",
      }}
    >
      <div style={{ fontSize: 80, fontWeight: 700 }}>{siteConfig.name}</div>
      <div style={{ fontSize: 36, color: "#a1a1a1", maxWidth: 900 }}>
        {t("description")}
      </div>
    </div>,
    size,
  );
}
