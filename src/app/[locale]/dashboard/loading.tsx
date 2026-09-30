import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the dashboard: greeting (text-3xl), email line and role line (text-sm)
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12" aria-busy>
      <Skeleton className="h-9 w-72 max-w-full" />
      <Skeleton className="mt-2 h-6 w-96 max-w-full" />
      <Skeleton className="mt-1 h-5 w-32" />
    </main>
  );
}
