import { getTranslations } from "next-intl/server";
import { SecuritySkeleton } from "@/components/account/security-skeleton";

export default async function Loading() {
  const t = await getTranslations("Account.security");
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12" aria-busy>
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>
      <div className="mt-8">
        <SecuritySkeleton />
      </div>
    </main>
  );
}
