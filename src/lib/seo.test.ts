import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import {
  absoluteUrl,
  languageAlternates,
  localizedPath,
  ogLocales,
  pageAlternates,
} from "./seo";

describe("seo", () => {
  it("builds absolute URLs from NEXT_PUBLIC_APP_URL", () => {
    expect(absoluteUrl()).toBe("https://example.com/");
    expect(absoluteUrl("/es/about")).toBe("https://example.com/es/about");
  });

  it("prefixes paths with the locale", () => {
    expect(localizedPath("/", "es")).toBe("/es");
    expect(localizedPath("/about", "en")).toBe("/en/about");
  });

  it("lists every locale plus x-default in hreflang alternates", () => {
    expect(languageAlternates("/about")).toEqual({
      es: "https://example.com/es/about",
      en: "https://example.com/en/about",
      "x-default": "https://example.com/es/about",
    });
  });

  it("sets the canonical URL to the current locale", () => {
    expect(pageAlternates("/", "en")).toEqual({
      canonical: "https://example.com/en",
      languages: languageAlternates("/"),
    });
  });

  it("has an Open Graph locale for every locale", () => {
    expect(Object.keys(ogLocales).sort()).toEqual([...routing.locales].sort());
  });
});
