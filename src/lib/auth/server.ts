import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, magicLink } from "better-auth/plugins";
import { after } from "next/server";
import { env } from "@/env";
import { db } from "@/lib/db";
import { type AuthPolicy, canSignIn, canSignUp } from "@/lib/system/policy";
import {
  assertPolicyAllows,
  disabledMagicLinkRedirect,
} from "@/lib/system/policy-guard";
import { getAuthPolicy } from "@/lib/system/policy-store";
import { sendAuthEmail } from "./emails";
import { ac, roles } from "./permissions";
import {
  assertAssignableRole,
  assertNotSuperadminTarget,
  assertSafeAdminUserInput,
  syncSuperadminRole,
} from "./superadmin";

/** Email + password, shaped by the policy (docs/plans/auth.md §5) */
function emailAndPassword(policy: AuthPolicy) {
  return {
    enabled: true,
    disableSignUp: !canSignUp(policy, "emailPassword"),
    requireEmailVerification: policy.emailPassword.requireEmailVerification,
    minPasswordLength: policy.emailPassword.minPasswordLength,
    // A password change signs out every other device
    revokeSessionsOnPasswordReset: true,
    // The reset link was sent to that inbox, so resetting proves the email is theirs
    onPasswordReset: async ({
      user,
    }: {
      user: { id: string; emailVerified: boolean };
    }) => {
      if (user.emailVerified) return;
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    },
    // Sent after the response so timing doesn't reveal whether the email exists
    sendResetPassword: async ({
      user,
      url,
    }: {
      user: { email: string; name: string };
      url: string;
    }) => {
      after(() =>
        sendAuthEmail(
          { kind: "resetPassword", name: user.name },
          { to: user.email, url },
        ),
      );
    },
  };
}

const emailVerification = {
  sendOnSignUp: true,
  // Signing in unverified sends a fresh link
  sendOnSignIn: true,
  autoSignInAfterVerification: true,
  sendVerificationEmail: async ({
    user,
    url,
  }: {
    user: { email: string; name: string };
    url: string;
  }) => {
    after(() =>
      sendAuthEmail(
        { kind: "verifyEmail", name: user.name },
        { to: user.email, url },
      ),
    );
  },
};

/** Magic link, shaped by the policy; opening the link also verifies the email */
function magicLinkPlugin(policy: AuthPolicy) {
  const { expiresInMinutes } = policy.magicLink;
  return magicLink({
    disableSignUp: !canSignUp(policy, "magicLink"),
    expiresIn: expiresInMinutes * 60,
    sendMagicLink: async ({ email, url }) => {
      after(() =>
        sendAuthEmail(
          { kind: "magicLink", expiresInMinutes },
          { to: email, url },
        ),
      );
    },
  });
}

function createAuth(policy: AuthPolicy) {
  return betterAuth({
    baseURL: env.NEXT_PUBLIC_APP_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(db, { provider: "postgresql" }),
    emailAndPassword: emailAndPassword(policy),
    emailVerification,
    databaseHooks: {
      session: {
        // Every sign-in recomputes superadmin (docs/plans/auth.md §3)
        create: { after: (session) => syncSuperadminRole(session.userId) },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // A link opened in the browser gets the sign-in page with a message, not JSON
        if (
          ctx.path === "/magic-link/verify" &&
          !canSignIn(policy, "magicLink")
        ) {
          throw ctx.redirect(disabledMagicLinkRedirect(ctx.query));
        }
        // Disabled methods are refused here, even when the API is called directly
        assertPolicyAllows(policy, ctx.path, ctx.body);
        if (
          ctx.path === "/admin/set-role" ||
          ctx.path === "/admin/create-user"
        ) {
          assertAssignableRole(ctx.body?.role);
        }
        assertSafeAdminUserInput(ctx.path, ctx.body);
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
      magicLinkPlugin(policy),
      // Must be the last plugin: sets cookies from Server Actions
      nextCookies(),
    ],
  });
}

type Auth = ReturnType<typeof createAuth>;

let current: { policyKey: string; auth: Auth } | undefined;

/**
 * Better Auth instance for the current policy (docs/plans/auth.md §4).
 * Rebuilt only when the superadmin changes the policy, so Better Auth itself
 * enforces closed sign-ups, email verification and password length.
 * Import only from server code.
 */
export async function getAuth() {
  const policy = await getAuthPolicy();
  const policyKey = JSON.stringify(policy);
  if (current?.policyKey !== policyKey) {
    current = { policyKey, auth: createAuth(policy) };
  }
  return current.auth;
}
