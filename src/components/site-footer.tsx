import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const t = useTranslations("SiteFooter");

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>
          {t("rights", {
            year: new Date().getFullYear(),
            name: siteConfig.name,
          })}
        </p>
        <p>{t("madeBy", { author: siteConfig.author })}</p>
      </div>
    </footer>
  );
}
