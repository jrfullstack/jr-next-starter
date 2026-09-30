import { AuthStatusSkeleton } from "@/components/auth/auth-skeletons";

// The title depends on the result (check inbox / verified / invalid link)
export default function Loading() {
  return <AuthStatusSkeleton />;
}
