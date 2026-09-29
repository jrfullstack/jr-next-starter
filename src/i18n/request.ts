import * as rootParams from "next/root-params";
import { getRequestConfig } from "next-intl/server";
import { parseLocale } from "./locale";

export default getRequestConfig(async ({ locale }) => {
  // `locale` is only passed explicitly (e.g. getTranslations({ locale })); otherwise read the [locale] segment
  const resolved = locale ?? parseLocale(await rootParams.locale());

  return {
    locale: resolved,
    messages: (await import(`../../messages/${resolved}.json`)).default,
  };
});
