import { describe, expect, it } from "vitest";
import { hasCanonicalParams } from "./search-params";

describe("hasCanonicalParams", () => {
  it("accepts exactly the canonical params", () => {
    expect(
      hasCanonicalParams({ q: "ada", page: "2" }, { q: "ada", page: "2" }),
    ).toBe(true);
    expect(hasCanonicalParams({}, {})).toBe(true);
  });

  it.each([
    ["empty fields from a GET form", { q: "ada", role: "" }],
    ["values outside the whitelist", { q: "ada", sort: "password" }],
    ["repeated params", { q: ["ada", "grace"] }],
  ])("rejects %s", (_case, params) => {
    expect(hasCanonicalParams(params, { q: "ada" })).toBe(false);
  });
});
