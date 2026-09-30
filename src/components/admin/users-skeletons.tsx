import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { UsersQuery } from "@/lib/admin/users";
import { UsersTableHeader } from "./users-table";

const PLACEHOLDER_ROWS = 5;

/** Same controls and sizes as UsersFilters: search (w-64), two selects and the button */
function UsersFiltersSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-2" aria-busy>
      <Skeleton className="h-8 w-64 rounded-lg" />
      <Skeleton className="h-8 w-36 rounded-lg" />
      <Skeleton className="h-8 w-36 rounded-lg" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

/**
 * Real header, placeholder rows and pagination. With the query being loaded
 * the sort links work; before the URL is read they render inert.
 */
export function UsersTableSkeleton({ query }: { query?: UsersQuery }) {
  return (
    <div aria-busy>
      <Table>
        <UsersTableHeader query={query} />
        <TableBody>
          {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders, never reordered
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-4xl" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto size-7 rounded-lg" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}

/** Everything below the page header while the session and the URL are read */
export function UsersListSkeleton() {
  return (
    <>
      <div className="mt-6">
        <UsersFiltersSkeleton />
      </div>
      <div className="mt-6">
        <UsersTableSkeleton />
      </div>
    </>
  );
}
