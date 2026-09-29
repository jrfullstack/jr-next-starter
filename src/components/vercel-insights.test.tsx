// @vitest-environment node
// Node environment: VERCEL is a server-only variable (T3-env blocks it in jsdom)
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => <i data-testid="speed-insights" />,
}));
vi.mock("@vercel/analytics/next", () => ({
  Analytics: () => <i data-testid="vercel-analytics" />,
}));

// Re-import so src/env.ts reads the stubbed variables
const renderInsights = async () => {
  const { VercelInsights } = await import("./vercel-insights");
  return renderToStaticMarkup(<VercelInsights />);
};

describe("VercelInsights", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders nothing outside Vercel", async () => {
    vi.stubEnv("VERCEL", "");

    expect(await renderInsights()).toBe("");
  });

  it("loads Speed Insights and Web Analytics on Vercel", async () => {
    vi.stubEnv("VERCEL", "1");

    const html = await renderInsights();

    expect(html).toContain("speed-insights");
    expect(html).toContain("vercel-analytics");
  });
});
