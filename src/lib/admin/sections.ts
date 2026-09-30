import { type LucideIcon, Users } from "lucide-react";
import { can, type Permission } from "@/lib/auth/permissions";

type AdminSection = {
  /** Key in Admin.sections of messages/*.json */
  id: "users";
  href: `/admin/${string}`;
  icon: LucideIcon;
  /** Needed to see the section and open its page */
  permission: Permission;
};

/** Single source of truth for the admin panel: menu entries and page guards. System arrives in step 4. */
export const adminSections = [
  {
    id: "users",
    href: "/admin/users",
    icon: Users,
    permission: { user: ["list"] },
  },
] as const satisfies readonly AdminSection[];

export function visibleSections(role: string | null | undefined) {
  return adminSections.filter((section) => can(role, section.permission));
}
