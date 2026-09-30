import { UsersPageHeader } from "@/components/admin/users-page-header";
import { UsersListSkeleton } from "@/components/admin/users-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <UsersPageHeader action={<Skeleton className="h-8 w-32 rounded-lg" />} />
      <UsersListSkeleton />
    </>
  );
}
