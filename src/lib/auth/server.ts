import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { after } from "next/server";
import { env } from "@/env";
import { db } from "@/lib/db";
import { sendAuthEmail } from "./emails";
import { ac, roles } from "./permissions";
import {
  assertAssignableRole,
  assertNotSuperadminTarget,
  syncSuperadminRole,
} from "./superadmin";

/** Better Auth server instance (docs/plans/auth.md). Import only from server code. */
export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // A password change signs out every other device
    revokeSessionsOnPasswordReset: true,
    // The reset link was sent to that inbox, so resetting proves the email is theirs
    onPasswordReset: async ({ user }) => {
      if (user.emailVerified) return;
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    },
    // Sent after the response so timing doesn't reveal whether the email exists
    sendResetPassword: async ({ user, url }) => {
      after(() =>
        sendAuthEmail("resetPassword", {
          to: user.email,
          name: user.name,
          url,
        }),
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    // Signing in unverified sends a fresh link
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      after(() =>
        sendAuthEmail("verifyEmail", { to: user.email, name: user.name, url }),
      );
    },
  },
  databaseHooks: {
    session: {
      // Every sign-in recomputes superadmin (docs/plans/auth.md §3)
      create: { after: (session) => syncSuperadminRole(session.userId) },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/admin/set-role" || ctx.path === "/admin/create-user") {
        assertAssignableRole(ctx.body?.role);
      }
      await assertNotSuperadminTarget(ctx.path, ctx.body?.userId);
    }),
  },
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
