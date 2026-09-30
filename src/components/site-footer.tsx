import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";

/** Prerendered with the page; refreshed at most daily so the year rolls over without a deploy */
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const t = await getTranslations("SiteFooter");
  const year = await currentYear();

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>{t("rights", { year, name: siteConfig.name })}</p>
        <p>{t("madeBy", { author: siteConfig.author })}</p>
      </div>
    </footer>
  );
}
