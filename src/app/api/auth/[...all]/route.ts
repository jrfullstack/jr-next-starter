import { getAuth } from "@/lib/auth/server";

// Every Better Auth endpoint lives under /api/auth/*. The instance follows the
// current auth policy (Admin → System), so it's resolved on each request.
async function handle(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export { handle as GET, handle as POST };
