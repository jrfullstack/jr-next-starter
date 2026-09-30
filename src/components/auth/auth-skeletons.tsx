import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthCard } from "./auth-card";

/** Label + input, same spacing as AuthFormField (Field) with an h-8 input */
function FieldSkeleton() {
  return (
    <Field>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-full rounded-lg" />
    </Field>
  );
}

/**
 * Loading state of an auth form page: the real card with its real (static)
 * title and description, and skeletons for the fields, button and footer.
 */
export function AuthFormSkeleton({
  title,
  description,
  fields,
  withFooter = true,
}: {
  title: string;
  description: string;
  fields: number;
  withFooter?: boolean;
}) {
  return (
    <AuthCard
      title={title}
      description={description}
      footer={withFooter && <Skeleton className="mx-auto h-4 w-48" />}
    >
      <FieldGroup aria-busy>
        {Array.from({ length: fields }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders, never reordered
          <FieldSkeleton key={index} />
        ))}
        <Skeleton className="h-8 w-full rounded-lg" />
      </FieldGroup>
    </AuthCard>
  );
}

/** Status pages (verify email) whose title depends on the request: real Card, skeleton text */
export function AuthStatusSkeleton() {
  return (
    <Card aria-busy>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}
