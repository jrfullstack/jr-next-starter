import { SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { adminSections } from "@/lib/admin/sections";
import { AdminSidebarFrame } from "./admin-sidebar";

/** Same sidebar while the role is checked: real title, one placeholder per possible section */
export function AdminSidebarSkeleton() {
  return (
    <AdminSidebarFrame>
      {adminSections.map(({ id }) => (
        <SidebarMenuItem
          key={id}
          className="flex h-8 items-center gap-2 px-2"
          aria-busy
        >
          <Skeleton className="size-4 rounded-md" />
          <Skeleton className="h-4 w-24" />
        </SidebarMenuItem>
      ))}
    </AdminSidebarFrame>
  );
}
