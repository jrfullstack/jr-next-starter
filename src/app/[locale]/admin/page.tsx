import { parseLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import { visibleSections } from "@/lib/admin/sections";
import { requireSession } from "@/lib/auth/session";

/** /admin opens the first section the user can see (the layout already 404s if there's none) */
export default async function AdminIndexPage({
  params,
}: PageProps<"/[locale]/admin">) {
  const locale = parseLocale((await params).locale);
  const { user } = await requireSession(locale, "/admin");
  const [first] = visibleSections(user.role);
  return redirect({ href: first?.href ?? "/", locale });
}
