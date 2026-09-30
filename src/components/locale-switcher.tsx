"use client";

import { Languages } from "lucide-react";
import { type Locale, useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * The locale options. They read the current path, so they live inside the
 * menu content, which only mounts once the menu opens in the browser: the
 * header never reads the path while rendering on the server (with Cache
 * Components that would hold up rendering the page under it).
 */
function LocaleOptions() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Same page, different locale prefix
  const changeLocale = (nextLocale: Locale) => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <DropdownMenuRadioGroup
      value={locale}
      onValueChange={(value) => changeLocale(value as Locale)}
    >
      {routing.locales.map((cur) => (
        <DropdownMenuRadioItem key={cur} value={cur}>
          {t("locale", { locale: cur })}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
        <Languages />
        <span className="sr-only">{t("label")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <LocaleOptions />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
