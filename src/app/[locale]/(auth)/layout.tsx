import type { Metadata } from "next";
import type { ReactNode } from "react";

// Auth pages are not useful in search results
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
