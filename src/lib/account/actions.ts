"use server";

import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth/server";

/**
 * Creates the password of an account that signed up without one (magic link,
 * Google). Better Auth only allows it from the server, for the signed-in user
 * with a recent session. Same result shape as the Better Auth client.
 */
export async function setAccountPassword(newPassword: string) {
  const auth = await getAuth();
  try {
    await auth.api.setPassword({
      body: { newPassword },
      headers: await headers(),
    });
    return { error: null };
  } catch (error) {
    if (!isAPIError(error)) throw error;
    const code = (error.body as { code?: string } | undefined)?.code;
    return { error: { code, status: error.statusCode } };
  }
}
