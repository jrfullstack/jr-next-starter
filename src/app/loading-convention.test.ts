import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const appDir = join(process.cwd(), "src/app");

// Pages that never wait for anything to render, so a skeleton would never show
const withoutLoading: Record<string, string> = {
  "[locale]/page.tsx": "fully static: prerendered at build time",
  "[locale]/[...rest]/page.tsx": "only calls notFound()",
};

const pages = readdirSync(appDir, { recursive: true, encoding: "utf8" })
  .filter((file) => file.endsWith("page.tsx"))
  .map((file) => file.replaceAll("\\", "/"));

describe("loading.tsx convention (AGENTS.md)", () => {
  it.each(pages.filter((page) => !(page in withoutLoading)))(
    "%s has a loading.tsx skeleton next to it",
    (page) => {
      expect(existsSync(join(appDir, dirname(page), "loading.tsx"))).toBe(true);
    },
  );

  it("every exception still points to an existing page", () => {
    expect(pages).toEqual(expect.arrayContaining(Object.keys(withoutLoading)));
  });
});
