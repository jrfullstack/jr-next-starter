import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Validate env vars when `next dev` / `next build` starts (fails fast if any is missing)
import "./src/env";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

// Wires src/i18n/request.ts into next-intl
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
