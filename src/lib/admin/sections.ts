import { type LucideIcon, Settings, Users } from "lucide-react";
import { can, type Permission } from "@/lib/auth/permissions";

type AdminSection = {
  /** Key in Admin.sections of messages/*.json */
  id: "users" | "system";
  href: `/admin/${string}`;
  icon: LucideIcon;
  /** Needed to see the section and open its page */
  permission: Permission;
};

/** Single source of truth for the admin panel: menu entries and page guards */
export const adminSections = [
  {
    id: "users",
    href: "/admin/users",
    icon: Users,
    permission: { user: ["list"] },
  },
  {
    id: "system",
    href: "/admin/system",
    icon: Settings,
    permission: { system: ["read"] },
  },
] as const satisfies readonly AdminSection[];

export function visibleSections(role: string | null | undefined) {
  return adminSections.filter((section) => can(role, section.permission));
}

/** The section a page belongs to, for its permission guard */
export function adminSection(id: AdminSection["id"]) {
  const section = adminSections.find((candidate) => candidate.id === id);
  if (!section) throw new Error(`Unknown admin section: ${id}`);
  return section;
}
