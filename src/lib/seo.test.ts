import { describe, expect, it } from "vitest";
import { languageAlternates, pageAlternates } from "./seo";

describe("seo", () => {
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
});
