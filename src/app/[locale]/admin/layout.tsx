import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminSidebarSkeleton } from "@/components/admin/admin-sidebar-skeleton";
import { SidebarProvider } from "@/components/ui/sidebar";
import { parseLocale } from "@/i18n/locale";
import { visibleSections } from "@/lib/admin/sections";
import { requireSession } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin");
  return {
    title: { default: t("metaTitle"), template: `%s · ${t("metaTitle")}` },
    robots: { index: false, follow: false },
  };
}

/**
 * Role gate: only roles that can see at least one section get the menu;
 * the rest get the 404 page. Each page still checks its own permission.
 */
async function AdminNavigation({ locale }: { locale: Locale }) {
  const { user } = await requireSession(locale, "/admin");
  const sections = visibleSections(user.role);
  if (sections.length === 0) notFound();
  return <AdminSidebar sectionIds={sections.map(({ id }) => id)} />;
}

/** Admin shell: prerendered; the session-dependent menu streams in behind its skeleton */
export default async function AdminLayout({
  children,
  params,
}: LayoutProps<"/[locale]/admin">) {
  const locale = parseLocale((await params).locale);

  return (
    <SidebarProvider className="min-h-0 flex-1 max-md:flex-col">
      <Suspense fallback={<AdminSidebarSkeleton />}>
        <AdminNavigation locale={locale} />
      </Suspense>
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</main>
    </SidebarProvider>
  );
}
