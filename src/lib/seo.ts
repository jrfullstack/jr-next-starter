import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { env } from "@/env";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Href = Parameters<typeof getPathname>[0]["href"];

/** Open Graph locale codes. Typed by Locale: adding a locale fails to compile until it's added here */
export const ogLocales: Record<Locale, string> = {
  es: "es_ES",
  en: "en_US",
};

/** Absolute URL for a path, based on NEXT_PUBLIC_APP_URL */
export function absoluteUrl(path = "/") {
  return new URL(path, env.NEXT_PUBLIC_APP_URL).toString();
}

/** Localized path for a route: ("/about", "en") -> "/en/about" */
export function localizedPath(href: Href, locale: Locale) {
  return getPathname({ href, locale });
}

/**
 * hreflang map for a route in every locale, plus `x-default` pointing to the
 * default locale. Search engines use it to show the right language version.
 */
export function languageAlternates(href: Href) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(localizedPath(href, locale));
  }
  languages["x-default"] = absoluteUrl(
    localizedPath(href, routing.defaultLocale),
  );
  return languages;
}

/** `alternates` metadata for a page: canonical URL + hreflang links */
export function pageAlternates(
  href: Href,
  locale: Locale,
): Metadata["alternates"] {
  return {
    canonical: absoluteUrl(localizedPath(href, locale)),
    languages: languageAlternates(href),
  };
}
