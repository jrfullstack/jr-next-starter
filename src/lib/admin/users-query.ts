import { db } from "@/lib/db";
import {
  USERS_PAGE_SIZE,
  type UsersQuery,
  usersOrderBy,
  usersWhere,
} from "./users";

/**
 * One page of users, filtered, sorted and counted in the database (never in the
 * browser). Server only; callers must check the `user: ["list"]` permission first.
 */
export async function findUsersPage(query: UsersQuery) {
  const where = usersWhere(query);
  const [users, total] = await db.$transaction([
    db.user.findMany({
      where,
      orderBy: usersOrderBy(query),
      skip: (query.page - 1) * USERS_PAGE_SIZE,
      take: USERS_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    }),
    db.user.count({ where }),
  ]);
  return { users, total };
}
