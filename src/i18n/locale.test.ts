import { describe, expect, it } from "vitest";
import { localeStaticParams, parseLocale } from "./locale";

describe("parseLocale", () => {
  it.each(["es", "en"])("returns the supported locale %s", (locale) => {
    expect(parseLocale(locale)).toBe(locale);
  });

  it.each(["fr", "", undefined])("throws Next's notFound for %j", (value) => {
    expect(() => parseLocale(value)).toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});

describe("localeStaticParams", () => {
  it("returns one param per supported locale", () => {
    expect(localeStaticParams()).toEqual([{ locale: "es" }, { locale: "en" }]);
  });
});
