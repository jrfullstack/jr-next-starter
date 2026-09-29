import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AuthField } from "@/lib/auth/schemas";

type Props = Pick<
  ComponentProps<"input">,
  "type" | "autoComplete" | "placeholder"
> & {
  name: AuthField;
  label: string;
  /** Validation message; when set, the field is marked invalid */
  error?: string;
  hint?: string;
};

export function AuthFormField({ name, label, error, hint, ...input }: Props) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        required
        {...input}
      />
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
