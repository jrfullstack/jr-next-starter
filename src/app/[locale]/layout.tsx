import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Analytics } from "@/components/analytics";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { VercelInsights } from "@/components/vercel-insights";
import { siteConfig } from "@/config/site";
import { env } from "@/env";
import { localeStaticParams, parseLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { ogLocales } from "@/lib/seo";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Prerender every locale at build time
export const generateStaticParams = localeStaticParams;

// Site-wide metadata; each page adds its own title and `alternates`
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("Metadata");
  const siteName = siteConfig.name;

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: { default: siteName, template: `%s | ${siteName}` },
    description: t("description"),
    applicationName: siteName,
    openGraph: {
      type: "website",
      siteName,
      title: siteName,
      description: t("description"),
      locale: ogLocales[locale],
      alternateLocale: routing.locales
        .filter((cur) => cur !== locale)
        .map((cur) => ogLocales[cur]),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const locale = parseLocale((await params).locale);

  return (
    // suppressHydrationWarning: next-themes sets the theme class on <html> before hydration
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SiteHeader />
            {children}
            <SiteFooter />
            <VercelInsights />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
      <Analytics />
    </html>
  );
}
