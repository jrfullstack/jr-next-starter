import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { env } from "@/env";

/**
 * Vercel Speed Insights (real-user Core Web Vitals) and Web Analytics.
 * They only work on Vercel, so they load only there (VERCEL=1).
 * Server Component: reads a server-only env var.
 */
export function VercelInsights() {
  if (env.VERCEL !== "1") return null;

  return (
    <>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
