import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { env } from "@/env";
import { db } from "@/lib/db";
import { ac, roles } from "./permissions";

/** Better Auth server instance (docs/plans/auth.md). Import only from server code. */
export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  // Email verification becomes mandatory in step 2, together with the email service
  emailAndPassword: { enabled: true },
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: "user",
      adminRoles: ["admin", "superadmin"],
    }),
    // Must be the last plugin: sets cookies from Server Actions
    nextCookies(),
  ],
});
