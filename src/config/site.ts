/**
 * Single source of truth for site-wide, non-translatable data.
 * Translatable text lives in messages/*.json; env-dependent values in src/env.ts.
 */
export const siteConfig = {
  name: "JR Next Starter",
  author: "Jimmy Reyes",
  links: {
    nextDocs: "https://nextjs.org/docs",
  },
} as const;
