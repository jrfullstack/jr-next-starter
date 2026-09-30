import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AuthCard } from "./auth-card";

/**
 * Placeholder for a line of text inside a paragraph: the card footer is a <p>,
 * where shadcn's Skeleton (a <div>) would be invalid HTML and break hydration.
 */
function TextSkeleton({ className }: { className: string }) {
  return (
    <span
      data-slot="skeleton"
      className={cn(
        "inline-block animate-pulse rounded-md bg-muted",
        className,
      )}
    />
  );
}

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
  secondaryAction,
  google,
}: {
  title: string;
  description: string;
  fields: number;
  withFooter?: boolean;
  /** Sign-in: the "or" separator and the magic link button (on by default in the policy) */
  secondaryAction?: string;
  /** With Google credentials: its button and the "or" separator go first */
  google?: { separator: string };
}) {
  return (
    <AuthCard
      title={title}
      description={description}
      footer={withFooter && <TextSkeleton className="h-4 w-48 align-middle" />}
    >
      {google && (
        <>
          <Skeleton className="h-8 w-full rounded-lg" />
          <FieldSeparator>{google.separator}</FieldSeparator>
        </>
      )}
      <FieldGroup aria-busy>
        {Array.from({ length: fields }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders, never reordered
          <FieldSkeleton key={index} />
        ))}
        <Skeleton className="h-8 w-full rounded-lg" />
        {secondaryAction && (
          <>
            <FieldSeparator>{secondaryAction}</FieldSeparator>
            <Skeleton className="h-8 w-full rounded-lg" />
          </>
        )}
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
