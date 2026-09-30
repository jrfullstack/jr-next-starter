import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton";

const PLACEHOLDER_EMAILS = 2;

// Real title and description; each email as a bordered card with subject, meta, links and preview
export default async function Loading() {
  const t = await getTranslations("DevOutbox");
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12" aria-busy>
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>
      <ul className="mt-8 flex flex-col gap-8">
        {Array.from({ length: PLACEHOLDER_EMAILS }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders, never reordered
          <li key={index} className="rounded-lg border p-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-1 h-5 w-72" />
            <Skeleton className="mt-3 h-5 w-16" />
            <Skeleton className="mt-1 h-5 w-full" />
            <Skeleton className="mt-4 h-96 w-full rounded-md" />
          </li>
        ))}
      </ul>
    </main>
  );
}
