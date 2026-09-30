"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import type { z } from "zod";
import { authClient } from "@/lib/auth/client";
import { authRoutes, withLocale } from "@/lib/auth/routes";
import { useAuthForm } from "./use-auth-form";

type MagicLinkFields = { email: string; name?: string };

/**
 * Asks Better Auth to email a magic link. Opening it signs in (or creates
 * the account, if allowed) and lands on `callbackPath`; a used, expired or
 * refused link goes back to the sign-in page with the reason.
 */
export function useMagicLinkForm<
  Schema extends z.ZodType<MagicLinkFields, Record<string, unknown>>,
>({ schema, callbackPath }: { schema: Schema; callbackPath: string }) {
  const locale = useLocale();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useAuthForm({
    schema,
    submit: async ({ email, name }) => {
      const callbackURL = withLocale(locale, callbackPath);
      const result = await authClient.signIn.magicLink({
        email,
        name,
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL: withLocale(locale, authRoutes.signIn),
      });
      if (!result.error) setSentTo(email);
      return result;
    },
  });
  return { ...form, sentTo };
}
