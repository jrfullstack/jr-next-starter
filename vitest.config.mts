import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Vite 8 resolves the `@/*` alias from tsconfig.json natively
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // next-intl imports `next/navigation` without extension; let Vite resolve it
    server: { deps: { inline: ["next-intl"] } },
    // Fixed values so tests don't depend on the local .env
    env: {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
      NEXT_PUBLIC_APP_URL: "https://example.com",
    },
  },
});
