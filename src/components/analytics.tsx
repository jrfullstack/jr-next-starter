import { GoogleAnalytics } from "@next/third-parties/google";
import { env } from "@/env";

/**
 * Loads Google Analytics 4 only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
 * gtag.js is fetched after hydration, so it doesn't block rendering.
 */
export function Analytics() {
  const measurementId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return null;

  return <GoogleAnalytics gaId={measurementId} />;
}
