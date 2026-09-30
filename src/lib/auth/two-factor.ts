import type { GenericEndpointContext } from "better-auth";
import { APIError, getSessionFromCtx } from "better-auth/api";
import { deleteSessionCookie } from "better-auth/cookies";
import { generateRandomString } from "better-auth/crypto";
import { twoFactor } from "better-auth/plugins";
import { after } from "next/server";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { type AuthPolicy, twoFactorRequired } from "@/lib/system/policy";
import { sendAuthEmail } from "./emails";
import { splitLocale } from "./routes";

const TRUSTED_DEVICE_SECONDS = 30 * 24 * 60 * 60;
/** Time to complete the second factor after the first one (Better Auth's default) */
const CHALLENGE_SECONDS = 10 * 60;

/** Locale of the page that asked for the email code (it has no link to read it from) */
function localeFromReferer(referer: string | null) {
  if (!referer) return routing.defaultLocale;
  return splitLocale(new URL(referer).pathname).locale ?? routing.defaultLocale;
}

/** Better Auth's twoFactor plugin, shaped by the policy (docs/plans/auth.md §6) */
export function twoFactorPlugin(policy: AuthPolicy) {
  return twoFactor({
    issuer: siteConfig.name,
    // Accounts without a password (magic link, Google) can use it too
    allowPasswordless: true,
    trustDeviceMaxAge: TRUSTED_DEVICE_SECONDS,
    twoFactorCookieMaxAge: CHALLENGE_SECONDS,
    otpOptions: policy.twoFactor.emailOtp
      ? {
          sendOTP: async ({ user, otp }, ctx) => {
            const locale = localeFromReferer(
              ctx?.request?.headers.get("referer") ?? null,
            );
            after(() =>
              sendAuthEmail(
                { kind: "twoFactorCode", code: otp, locale },
                user.email,
              ),
            );
          },
        }
      : undefined,
  });
}

function forbidden(code: string, message: string) {
  return new APIError("FORBIDDEN", { code, message });
}

/** Admin endpoints act with elevated rights: they need the second factor set up when it's required */
async function assertAdminHasTwoFactor(
  policy: AuthPolicy,
  ctx: GenericEndpointContext,
) {
  const session = await getSessionFromCtx(ctx);
  if (!session || !twoFactorRequired(policy, session.user.role)) return;
  if (!(session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled) {
    throw forbidden("TWO_FACTOR_SETUP_REQUIRED", "Set up 2FA first");
  }
}

/**
 * Before hook for 2FA endpoints: what the policy allows. Returns a body to
 * use instead of the request's (it drops "remember this device" when off).
 */
export async function guardTwoFactor(
  policy: AuthPolicy,
  ctx: GenericEndpointContext,
) {
  const { path } = ctx;
  if (path.startsWith("/admin/")) await assertAdminHasTwoFactor(policy, ctx);
  if (path === "/two-factor/enable" && policy.twoFactor.level === "off") {
    throw forbidden("TWO_FACTOR_OFF", "2FA is turned off");
  }
  if (path === "/two-factor/send-otp" && !policy.twoFactor.emailOtp) {
    throw forbidden("TWO_FACTOR_OFF", "Email codes are turned off");
  }
  if (path === "/two-factor/disable") {
    const session = await getSessionFromCtx(ctx);
    if (session && twoFactorRequired(policy, session.user.role)) {
      throw forbidden("TWO_FACTOR_REQUIRED", "2FA is required");
    }
  }
  if (path.startsWith("/two-factor/verify-") && !policy.twoFactor.trustDevice) {
    return { ...(ctx.body as object), trustDevice: false };
  }
  return undefined;
}

/** Sign-ins Better Auth's plugin doesn't challenge (it only covers the password) */
const challengedPaths = new Set(["/magic-link/verify", "/callback/google"]);

/** Where the sign-in was going, from the redirect the endpoint answered with */
function redirectTarget(ctx: GenericEndpointContext) {
  // Set by Better Auth for after hooks: the endpoint's result, here its redirect
  // error. Read by shape: APIError can come from another copy of the package
  const { returned } = ctx.context as { returned?: { headers?: HeadersInit } };
  const location = returned?.headers
    ? new Headers(returned.headers).get("location")
    : null;
  if (!location) return "/";
  return new URL(location, ctx.context.baseURL).pathname;
}

/**
 * After hook: 2FA for magic link and Google (docs/plans/auth.md §16). Same
 * steps as Better Auth's own hook for passwords: drop the new session, open
 * its challenge (signed cookie + verification records) and send the browser
 * to /two-factor. Verifying the code stays with Better Auth. Its e2e covers
 * this in case a Better Auth update changes the challenge format.
 */
export async function challengeSecondFactor(ctx: GenericEndpointContext) {
  if (!challengedPaths.has(ctx.path)) return;
  const created = ctx.context.newSession;
  const enabled = (created?.user as { twoFactorEnabled?: boolean } | undefined)
    ?.twoFactorEnabled;
  if (!(created && enabled)) return;
  const target = redirectTarget(ctx);
  deleteSessionCookie(ctx, true);
  await ctx.context.internalAdapter.deleteSession(created.session.token);
  ctx.context.setNewSession(null);

  const identifier = `2fa-${generateRandomString(20)}`;
  const expiresAt = new Date(Date.now() + CHALLENGE_SECONDS * 1000);
  await ctx.context.internalAdapter.createVerificationValue({
    value: created.user.id,
    identifier,
    expiresAt,
  });
  await ctx.context.internalAdapter.createVerificationValue({
    value: "0",
    identifier: `2fa-attempts-${identifier}`,
    expiresAt,
  });
  const cookie = ctx.context.createAuthCookie("two_factor", {
    maxAge: CHALLENGE_SECONDS,
  });
  await ctx.setSignedCookie(
    cookie.name,
    identifier,
    ctx.context.secret,
    cookie.attributes,
  );

  const { locale = routing.defaultLocale, path } = splitLocale(target);
  const params = new URLSearchParams({ callbackUrl: path });
  throw ctx.redirect(`/${locale}/two-factor?${params}`);
}
