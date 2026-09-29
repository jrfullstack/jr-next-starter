import { describe, expect, it } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("lists the home page in every locale with hreflang alternates", () => {
    const entries = sitemap();

    expect(entries.map((entry) => entry.url)).toEqual([
      "https://example.com/es",
      "https://example.com/en",
    ]);
    for (const entry of entries) {
      expect(entry.alternates?.languages).toEqual({
        es: "https://example.com/es",
        en: "https://example.com/en",
        "x-default": "https://example.com/es",
      });
    }
  });
});

describe("robots", () => {
  it("allows crawling and points to the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: "https://example.com/sitemap.xml",
    });
  });
});
