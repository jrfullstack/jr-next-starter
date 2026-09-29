import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("ignores falsy values", () => {
    const isActive = false;
    expect(cn("base", isActive && "active", undefined, null)).toBe("base");
  });

  it("resolves conflicting Tailwind classes keeping the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
