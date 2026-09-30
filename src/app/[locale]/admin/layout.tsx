import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
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

/** Admin shell: only for roles that can see at least one section; others get a 404 */
export default async function AdminLayout({
  children,
  params,
}: LayoutProps<"/[locale]/admin">) {
  const locale = parseLocale((await params).locale);
  const { user } = await requireSession(locale, "/admin");
  const sections = visibleSections(user.role);
  if (sections.length === 0) notFound();

  return (
    <SidebarProvider className="min-h-0 flex-1 max-md:flex-col">
      <AdminSidebar sectionIds={sections.map(({ id }) => id)} />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</main>
      <Toaster />
    </SidebarProvider>
  );
}
