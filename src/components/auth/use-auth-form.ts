"use client";

import { type FormEvent, useState, useTransition } from "react";
import type { z } from "zod";
import { useRouter } from "@/i18n/navigation";
import { type AuthErrorKey, authErrorKey } from "@/lib/auth/errors";
import { type AuthField, invalidFields } from "@/lib/auth/schemas";

type AuthResult = { error: { code?: string } | null };

/**
 * Shared submit flow of the auth forms: validate with Zod, call Better Auth,
 * translate its error or navigate on success.
 */
export function useAuthForm<Schema extends z.ZodType>({
  schema,
  submit,
  redirectTo,
}: {
  schema: Schema;
  submit: (data: z.output<Schema>) => Promise<AuthResult>;
  redirectTo: string;
}) {
  const router = useRouter();
  const [invalid, setInvalid] = useState<Partial<Record<AuthField, true>>>({});
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [pending, startTransition] = useTransition();

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
        setError(authErrorKey(result.error.code));
        return;
      }
      router.push(redirectTo);
      router.refresh();
    });
  };

  return { onSubmit, invalid, error, pending };
}
