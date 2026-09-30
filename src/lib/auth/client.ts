import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, roles } from "./permissions";

/** Better Auth client for Client Components. Same origin, so no baseURL is needed. */
export const authClient = createAuthClient({
  plugins: [adminClient({ ac, roles })],
});
