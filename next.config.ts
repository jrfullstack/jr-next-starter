import type { NextConfig } from "next";

// Validate env vars when `next dev` / `next build` starts (fails fast if any is missing)
import "./src/env";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
