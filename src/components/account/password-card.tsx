"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { toast } from "sonner";
import {
  AuthFormField,
  NewPasswordFields,
} from "@/components/auth/auth-form-field";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { useRouter } from "@/i18n/navigation";
import { setAccountPassword } from "@/lib/account/actions";
import { authClient } from "@/lib/auth/client";
import { changePasswordSchema, resetPasswordSchema } from "@/lib/auth/schemas";

type Props = { minPasswordLength: number };

function ChangePasswordForm({ minPasswordLength }: Props) {
  const t = useTranslations("Auth");
  const tCard = useTranslations("Account.security.password");
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const { onSubmit, invalid, error, submitDisabled } = useAuthForm({
    schema: changePasswordSchema(minPasswordLength),
    // Other devices are signed out; this one gets a fresh session
    submit: ({ currentPassword, password }) =>
      authClient.changePassword({
        currentPassword,
        newPassword: password,
        revokeOtherSessions: true,
      }),
    onSuccess: () => {
      form.current?.reset();
      toast.success(tCard("changed"));
      router.refresh();
    },
  });

  return (
    <form ref={form} method="post" onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <AuthFormField
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          label={t("fields.currentPassword")}
          error={invalid.currentPassword && t("validation.currentPassword")}
        />
        <NewPasswordFields invalid={invalid} min={minPasswordLength} />
        {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
        <Button type="submit" disabled={submitDisabled} className="self-start">
          {tCard("change")}
        </Button>
      </FieldGroup>
    </form>
  );
}

function SetPasswordForm({ minPasswordLength }: Props) {
  const t = useTranslations("Auth");
  const tCard = useTranslations("Account.security.password");
  const router = useRouter();
  const { onSubmit, invalid, error, submitDisabled } = useAuthForm({
    schema: resetPasswordSchema(minPasswordLength),
    submit: ({ password }) => setAccountPassword(password),
    // The page re-renders with the "change password" form
    onSuccess: () => {
      toast.success(tCard("created"));
      router.refresh();
    },
  });

  return (
    <form method="post" onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <NewPasswordFields invalid={invalid} min={minPasswordLength} />
        {error && <FieldError>{t(`errors.${error}`)}</FieldError>}
        <Button type="submit" disabled={submitDisabled} className="self-start">
          {tCard("set")}
        </Button>
      </FieldGroup>
    </form>
  );
}

/** Change the password, or create one if the account signed up without it */
export function PasswordCard({
  hasPassword,
  minPasswordLength,
}: Props & { hasPassword: boolean }) {
  const t = useTranslations("Account.security.password");
  return (
    <SectionCard
      title={t("title")}
      description={t(hasPassword ? "changeDescription" : "setDescription")}
    >
      {hasPassword ? (
        <ChangePasswordForm minPasswordLength={minPasswordLength} />
      ) : (
        <SetPasswordForm minPasswordLength={minPasswordLength} />
      )}
    </SectionCard>
  );
}
