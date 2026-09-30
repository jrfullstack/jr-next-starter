import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import type { AuthPolicy } from "@/lib/system/policy";
import {
  assertPolicyAllows,
  disabledMethodRedirect,
} from "@/lib/system/policy-guard";
import { assertKeepsSignInMethod } from "./account-guard";
import {
  assertAssignableRole,
  assertNotSuperadminTarget,
  assertSafeAdminUserInput,
} from "./superadmin";
import { challengeSecondFactor, guardTwoFactor } from "./two-factor";

/** Runs before every Better Auth endpoint: policy, roles and account rules */
export function beforeHook(policy: AuthPolicy) {
  return createAuthMiddleware(async (ctx) => {
    // A link or Google's redirect gets the sign-in page with a message, not JSON
    const redirect = disabledMethodRedirect(policy, ctx.path, ctx.query);
    if (redirect) throw ctx.redirect(redirect);
    // Disabled methods are refused here, even when the API is called directly
    assertPolicyAllows(policy, ctx.path, ctx.body);
    if (ctx.path === "/admin/set-role" || ctx.path === "/admin/create-user") {
      assertAssignableRole(ctx.body?.role);
    }
    assertSafeAdminUserInput(ctx.path, ctx.body);
    if (ctx.path === "/unlink-account") {
      const session = await getSessionFromCtx(ctx);
      if (session) {
        await assertKeepsSignInMethod(
          policy,
          session.user.id,
          ctx.body?.accountId,
        );
      }
    }
    await assertNotSuperadminTarget(ctx.path, ctx.body?.userId);
    // Better Auth continues with the body the hook returns, if any
    const body = await guardTwoFactor(policy, ctx);
    return body ? { context: { body } } : undefined;
  });
}

/** Runs after every Better Auth endpoint: 2FA for sign-ins its plugin doesn't cover */
export function afterHook() {
  return createAuthMiddleware(challengeSecondFactor);
}
