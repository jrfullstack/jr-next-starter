import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="google-analytics" data-ga-id={gaId} />
  ),
}));

// Re-import so src/env.ts reads the stubbed variables
const loadAnalytics = async () => (await import("./analytics")).Analytics;

describe("Analytics", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders nothing when the measurement ID is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");
    const Analytics = await loadAnalytics();

    const { container } = render(<Analytics />);

    expect(container).toBeEmptyDOMElement();
  });

  it("loads Google Analytics with the measurement ID", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");
    const Analytics = await loadAnalytics();

    const { getByTestId } = render(<Analytics />);

    expect(getByTestId("google-analytics")).toHaveAttribute(
      "data-ga-id",
      "G-TEST123",
    );
  });
});
