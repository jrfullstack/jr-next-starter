import type { Prisma } from "@/generated/prisma/client";
import { can } from "@/lib/auth/permissions";

export const USERS_PAGE_SIZE = 20;

/** Whitelists: nothing from the URL reaches the query unless it's listed here */
const userSortFields = ["createdAt", "name", "email"] as const;
export const userRoles = ["user", "admin", "superadmin"] as const;
export const userStatuses = ["verified", "unverified", "banned"] as const;

export type UserSortField = (typeof userSortFields)[number];
type UserRole = (typeof userRoles)[number];
export type UserStatus = (typeof userStatuses)[number];
type SortOrder = "asc" | "desc";

export type UsersQuery = {
  search: string;
  role?: UserRole;
  status?: UserStatus;
  sort: UserSortField;
  order: SortOrder;
  page: number;
};

const defaultSort = { sort: "createdAt", order: "desc" } as const;

type SearchParams = Record<string, string | string[] | undefined>;

function pick<T extends string>(value: unknown, allowed: readonly T[]) {
  return allowed.find((option) => option === value);
}

/** List state from the URL (?q=&role=&status=&sort=&order=&page=), validated with safe defaults */
export function parseUsersQuery(searchParams: SearchParams): UsersQuery {
  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = Number(searchParams.page);
  return {
    search,
    role: pick(searchParams.role, userRoles),
    status: pick(searchParams.status, userStatuses),
    sort: pick(searchParams.sort, userSortFields) ?? defaultSort.sort,
    order: pick(searchParams.order, ["asc", "desc"]) ?? defaultSort.order,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

const notBanned: Prisma.UserWhereInput = {
  OR: [{ banned: false }, { banned: null }],
};

const statusWhere: Record<UserStatus, Prisma.UserWhereInput> = {
  banned: { banned: true },
  unverified: { AND: [notBanned, { emailVerified: false }] },
  verified: { AND: [notBanned, { emailVerified: true }] },
};

/** Database filter for the query: search in name or email, role and status */
export function usersWhere(query: UsersQuery): Prisma.UserWhereInput {
  const conditions: Prisma.UserWhereInput[] = [];
  if (query.search) {
    const contains = { contains: query.search, mode: "insensitive" } as const;
    conditions.push({ OR: [{ name: contains }, { email: contains }] });
  }
  if (query.role) {
    // Users created before roles existed have no role: they count as "user"
    conditions.push(
      query.role === "user"
        ? { OR: [{ role: "user" }, { role: null }] }
        : { role: query.role },
    );
  }
  if (query.status) conditions.push(statusWhere[query.status]);
  return { AND: conditions };
}

/** Stable order: the chosen column, then id so equal values never swap between pages */
export function usersOrderBy(
  query: UsersQuery,
): Prisma.UserOrderByWithRelationInput[] {
  return [{ [query.sort]: query.order }, { id: "asc" }];
}

/**
 * Link to the list with some state changed. Changing search, filters or sort
 * goes back to page 1; defaults are left out to keep URLs short.
 */
export function usersHref(query: UsersQuery, changes: Partial<UsersQuery>) {
  const next = {
    ...query,
    ...("page" in changes ? {} : { page: 1 }),
    ...changes,
  };
  const isDefaultSort =
    next.sort === defaultSort.sort && next.order === defaultSort.order;
  return {
    pathname: "/admin/users" as const,
    query: {
      ...(next.search && { q: next.search }),
      ...(next.role && { role: next.role }),
      ...(next.status && { status: next.status }),
      ...(!isDefaultSort && { sort: next.sort, order: next.order }),
      ...(next.page > 1 && { page: String(next.page) }),
    },
  };
}

/** Clicking a column sorts by it ascending; clicking it again flips the order */
export function nextSort(query: UsersQuery, field: UserSortField) {
  const order: SortOrder =
    query.sort === field && query.order === "asc" ? "desc" : "asc";
  return { sort: field, order };
}

type ListedUser = {
  id: string;
  role?: string | null;
  banned?: boolean | null;
  emailVerified: boolean;
};

export function userStatus(user: ListedUser): UserStatus {
  if (user.banned) return "banned";
  if (!user.emailVerified) return "unverified";
  return "verified";
}

/**
 * What the current admin may do on a row. Superadmin accounts and your own
 * account are never managed from the table (the server enforces it too).
 */
export function rowPermissions(
  actor: { id: string; role?: string | null },
  target: ListedUser,
) {
  const manageable = target.role !== "superadmin" && target.id !== actor.id;
  return {
    manageable,
    ban: manageable && can(actor.role, { user: ["ban"] }),
    revokeSessions: manageable && can(actor.role, { session: ["revoke"] }),
    setRole: manageable && can(actor.role, { user: ["set-role"] }),
  };
}
