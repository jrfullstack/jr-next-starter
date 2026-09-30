import { can } from "@/lib/auth/permissions";

export const USERS_PAGE_SIZE = 20;

type SearchParams = Record<string, string | string[] | undefined>;

/** Search and page from the URL (?q=…&page=…); invalid pages fall back to the first */
export function parseUsersQuery(searchParams: SearchParams) {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = Number(searchParams.page);
  const currentPage = Number.isInteger(page) && page > 1 ? page : 1;
  return {
    search: q,
    page: currentPage,
    offset: (currentPage - 1) * USERS_PAGE_SIZE,
  };
}

type ListedUser = {
  id: string;
  role?: string | null;
  banned?: boolean | null;
  emailVerified: boolean;
};

export type UserStatus = "banned" | "unverified" | "active";

export function userStatus(user: ListedUser): UserStatus {
  if (user.banned) return "banned";
  if (!user.emailVerified) return "unverified";
  return "active";
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
