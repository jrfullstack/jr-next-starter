import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  magicLinkClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, roles } from "./permissions";

/** Better Auth client for Client Components. Same origin, so no baseURL is needed. */
export const authClient = createAuthClient({
  // Forms handle the 2FA redirect themselves (they know where the user was going)
  plugins: [
    adminClient({ ac, roles }),
    magicLinkClient(),
    twoFactorClient(),
    passkeyClient(),
  ],
});
