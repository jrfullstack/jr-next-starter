"use client";

import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

/** Asks for the password before a sensitive 2FA change (Better Auth checks it) */
export function PasswordConfirm({
  error,
  pending,
  onConfirm,
  onCancel,
}: {
  error?: string;
  pending: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("Account.security.twoFactor");
  // Read from the form (uncontrolled), like the other forms
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password"));
    if (password) onConfirm(password);
  };
  return (
    <form method="post" onSubmit={submit} className="flex flex-col gap-3">
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor="twoFactorPassword">
          {t("passwordPrompt")}
        </FieldLabel>
        <PasswordInput
          id="twoFactorPassword"
          autoComplete="current-password"
          name="password"
          aria-invalid={error ? true : undefined}
        />
        {error && <FieldError>{error}</FieldError>}
      </Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {t("continue")}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
