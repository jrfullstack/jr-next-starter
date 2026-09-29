"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

/**
 * next-themes injects an inline <script> that applies the theme before
 * hydration (no flash). It only has to run from the server HTML. When the root
 * layout remounts on the client (e.g. switching [locale]), React warns about
 * rendering a <script>; giving it a non-JS type on the client makes it an inert
 * data block. The server keeps the executable version.
 * Upstream: https://github.com/pacocoursey/next-themes/issues/397
 */
const clientScriptProps =
  typeof window === "undefined" ? undefined : { type: "application/json" };

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider scriptProps={clientScriptProps} {...props}>
      {children}
    </NextThemesProvider>
  );
}
