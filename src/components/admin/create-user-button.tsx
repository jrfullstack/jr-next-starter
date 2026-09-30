import { Skeleton } from "@/components/ui/skeleton";
import { getAuthPolicy } from "@/lib/system/policy-store";
import { CreateUserDialog } from "./create-user-dialog";

/** "Create user" with the password minimum from the auth policy */
export async function CreateUserButton() {
  const policy = await getAuthPolicy();
  return <CreateUserDialog min={policy.emailPassword.minPasswordLength} />;
}

export function CreateUserButtonSkeleton() {
  return <Skeleton className="h-8 w-32 rounded-lg" />;
}
