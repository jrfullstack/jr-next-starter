import { Skeleton } from "@/components/ui/skeleton";

// /admin only redirects to a section: a neutral section heading while the role is read
export default function Loading() {
  return (
    <div aria-busy>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-1 h-6 w-80 max-w-full" />
    </div>
  );
}
