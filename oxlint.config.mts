import tailwind from "eslint-plugin-better-tailwindcss";
import { defineConfig } from "oxlint";

// Every recommended Tailwind rule as an error; fixable ones are applied by `pnpm lint:fix` and on commit
const recommendedAsErrors = Object.fromEntries(
  Object.keys(tailwind.configs.recommended.rules).map((rule) => [
    rule,
    "error",
  ]),
);

/**
 * Oxlint only checks Tailwind classes (Biome handles the rest of the linting).
 * Keeps classes canonical (Tailwind v4 syntax), sorted, deduplicated and known.
 */
export default defineConfig({
  categories: { correctness: "off" },
  ignorePatterns: ["src/generated/**"],
  settings: {
    "better-tailwindcss": { entryPoint: "src/app/globals.css" },
  },
  overrides: [
    {
      files: ["src/**/*.{ts,tsx}"],
      // Tests use made-up class names on purpose (e.g. cn("base", "active"))
      excludeFiles: ["src/**/*.test.{ts,tsx}"],
      jsPlugins: ["eslint-plugin-better-tailwindcss"],
      rules: {
        ...recommendedAsErrors,
        "better-tailwindcss/enforce-shorthand-classes": "error",
        "better-tailwindcss/enforce-consistent-important-position": "error",
        "better-tailwindcss/enforce-consistent-variable-syntax": "error",
        // "toaster" is Sonner's styling hook, not a Tailwind class
        "better-tailwindcss/no-unknown-classes": [
          "error",
          { ignore: ["^toaster$"] },
        ],
        // Formatting (line breaks) belongs to Biome
        "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      },
    },
  ],
});
