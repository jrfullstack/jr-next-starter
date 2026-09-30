"use client";

import { useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";
import { adminSections } from "@/lib/admin/sections";

type SectionId = (typeof adminSections)[number]["id"];

/** Admin menu; receives only the sections the user's role can see (filtered on the server) */
export function AdminSidebar({ sectionIds }: { sectionIds: SectionId[] }) {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  const sections = adminSections.filter(({ id }) => sectionIds.includes(id));

  return (
    <Sidebar
      collapsible="none"
      // md:h-auto: stretch to the panel's height instead of the menu's content
      className="border-r max-md:w-full max-md:border-r-0 max-md:border-b md:h-auto"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("panelTitle")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map(({ id, href, icon: Icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(href)}
                    render={<Link href={href} />}
                  >
                    <Icon />
                    <span>{t(`sections.${id}`)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
