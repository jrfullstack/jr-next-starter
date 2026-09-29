import type { Locale } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import { routing } from "./routing";

// Typed by Locale: adding a locale without its messages file fails to compile
const messages: Record<Locale, object> = { es, en };

// Flatten nested messages into dot paths: { A: { b: "" } } -> ["A.b"]
const keysOf = (obj: object, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? keysOf(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

describe("messages", () => {
  it("has a messages file for every locale", () => {
    expect(Object.keys(messages).sort()).toEqual([...routing.locales].sort());
  });

  it.each(routing.locales.filter((locale) => locale !== routing.defaultLocale))(
    "%s has the same keys as the default locale",
    (locale) => {
      const expected = keysOf(messages[routing.defaultLocale]).sort();

      expect(keysOf(messages[locale]).sort()).toEqual(expected);
    },
  );

  it.each(routing.locales)("%s has no empty messages", (locale) => {
    const flat = (obj: object): unknown[] =>
      Object.values(obj).flatMap((v) =>
        typeof v === "object" && v !== null ? flat(v) : [v],
      );

    expect(flat(messages[locale])).not.toContain("");
  });
});
