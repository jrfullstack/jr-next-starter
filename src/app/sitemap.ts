import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { absoluteUrl, languageAlternates, localizedPath } from "@/lib/seo";

// Public routes to index. Add new pages here.
const routes = ["/"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(localizedPath(route, locale)),
      lastModified: new Date(),
      alternates: { languages: languageAlternates(route) },
    })),
  );
}
