import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { routing } from "./routing";

/** Narrows a route param to a supported Locale, or renders the 404 page */
export function parseLocale(value: string | undefined): Locale {
  if (!hasLocale(routing.locales, value)) notFound();
  return value;
}

/** `generateStaticParams` result that prerenders a route once per locale */
export function localeStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
