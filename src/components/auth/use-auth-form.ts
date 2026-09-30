"use client";

import { type FormEvent, useState, useTransition } from "react";
import type { z } from "zod";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRouter } from "@/i18n/navigation";
import { type AuthErrorKey, authErrorKey } from "@/lib/auth/errors";
import { type AuthField, invalidFields } from "@/lib/auth/schemas";

type AuthResult = { error: { code?: string; status?: number } | null };

type Href = Parameters<ReturnType<typeof useRouter>["push"]>[0];

/**
 * Shared submit flow of the auth forms: validate with Zod, call Better Auth,
 * translate its error, then navigate to `redirectTo` or flag `succeeded`.
 */
export function useAuthForm<Schema extends z.ZodType>({
  schema,
  submit,
  redirectTo,
  onSuccess: onSucceeded,
}: {
  schema: Schema;
  submit: (data: z.output<Schema>) => Promise<AuthResult>;
  /** Where to go on success; without it the form stays and `succeeded` becomes true */
  redirectTo?: Href | ((data: z.output<Schema>) => Href);
  /** Extra step after a success without redirect, e.g. closing a dialog */
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [invalid, setInvalid] = useState<Partial<Record<AuthField, true>>>({});
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [pending, startTransition] = useTransition();
  const hydrated = useHydrated();

  const onSuccess = (data: z.output<Schema>) => {
    if (!redirectTo) {
      setSucceeded(true);
      onSucceeded?.();
      return;
    }
    router.push(
      typeof redirectTo === "function" ? redirectTo(data) : redirectTo,
    );
    router.refresh();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setInvalid(invalidFields(parsed.error));
      return;
    }
    setInvalid({});
    setError(null);
    startTransition(async () => {
      const result = await submit(parsed.data);
      if (result.error) {
        setError(authErrorKey(result.error.code, result.error.status));
        return;
      }
      onSuccess(parsed.data);
    });
  };

  // Submitting before hydration would do a native form submit (reload, lost state):
  // keep the button disabled until React handles it
  return {
    onSubmit,
    invalid,
    error,
    succeeded,
    submitDisabled: pending || !hydrated,
  };
}
