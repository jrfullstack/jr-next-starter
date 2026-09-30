import { useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type AuthField, PASSWORD_MIN_LENGTH } from "@/lib/auth/schemas";
import { PasswordInput } from "./password-input";

type Props = Pick<
  ComponentProps<"input">,
  "type" | "autoComplete" | "placeholder"
> & {
  name: AuthField;
  label: string;
  /** Validation message; when set, the field is marked invalid */
  error?: string;
  hint?: string;
  /** Shown next to the label, e.g. a "Forgot your password?" link */
  aside?: ReactNode;
};

export function AuthFormField({
  name,
  label,
  error,
  hint,
  aside,
  type,
  ...input
}: Props) {
  const control = {
    id: name,
    name,
    "aria-invalid": error ? true : undefined,
    required: true,
    ...input,
  };
  return (
    <Field data-invalid={error ? true : undefined}>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        {aside}
      </div>
      {type === "password" ? (
        <PasswordInput {...control} />
      ) : (
        <Input type={type} {...control} />
      )}
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        hint && <FieldDescription>{hint}</FieldDescription>
      )}
    </Field>
  );
}

/** Email field shared by every auth form */
export function EmailField({ invalid }: { invalid?: boolean }) {
  const t = useTranslations("Auth");
  return (
    <AuthFormField
      name="email"
      type="email"
      autoComplete="email"
      label={t("fields.email")}
      placeholder={t("placeholders.email")}
      error={invalid ? t("validation.email") : undefined}
    />
  );
}

/** New password + confirmation, shared by sign-up and reset password */
export function NewPasswordFields({
  invalid,
}: {
  invalid: Partial<Record<AuthField, true>>;
}) {
  const t = useTranslations("Auth");
  const min = PASSWORD_MIN_LENGTH;
  return (
    <>
      <AuthFormField
        name="password"
        type="password"
        autoComplete="new-password"
        label={t("fields.password")}
        hint={t("signUp.passwordHint", { min })}
        error={invalid.password && t("validation.password", { min })}
      />
      <AuthFormField
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        label={t("fields.confirmPassword")}
        error={invalid.confirmPassword && t("validation.confirmPassword")}
      />
    </>
  );
}
