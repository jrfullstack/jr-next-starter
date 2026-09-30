import { notFound } from "next/navigation";
import { parseLocale } from "@/i18n/locale";
import { redirect } from "@/i18n/navigation";
import { visibleSections } from "@/lib/admin/sections";
import { requireSession } from "@/lib/auth/session";

/** /admin opens the first section the user can see; without any it's the 404, like the layout */
export default async function AdminIndexPage({
  params,
}: PageProps<"/[locale]/admin">) {
  const locale = parseLocale((await params).locale);
  const { user } = await requireSession(locale, "/admin");
  const [first] = visibleSections(user.role);
  if (!first) notFound();
  return redirect({ href: first.href, locale });
}
