import { useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { MAGIC_LINK_MINUTES, PASSWORD_LENGTH } from "@/lib/system/policy";

export type SettingField =
  | "general.signUp"
  | "emailPassword.signUp"
  | "emailPassword.access"
  | "emailPassword.requireEmailVerification"
  | "emailPassword.minPasswordLength"
  | "magicLink.access"
  | "magicLink.signUp"
  | "magicLink.expiresInMinutes"
  | "google.access"
  | "google.signUp";

/** Settings edited as a number, with their bounds; the rest are switches */
export const numberSettings: Partial<
  Record<SettingField, { min: number; max: number }>
> = {
  "emailPassword.minPasswordLength": PASSWORD_LENGTH,
  "magicLink.expiresInMinutes": MAGIC_LINK_MINUTES,
};

/** DOM id of a setting's control, so its label points at it */
export function settingId(field: SettingField) {
  return field.replace(".", "-");
}

function SettingsCard({
  children,
  ...card
}: ComponentProps<typeof SectionCard>) {
  return (
    <SectionCard {...card}>
      <FieldGroup>{children}</FieldGroup>
    </SectionCard>
  );
}

function SettingRow({
  field,
  label,
  description,
  control,
}: {
  field: SettingField;
  label: string;
  description: string;
  control: ReactNode;
}) {
  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor={settingId(field)}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
      {control}
    </Field>
  );
}

/**
 * Cards and rows of the System settings. The form passes real controls and
 * the loading skeleton passes placeholders, so both share one layout.
 */
export function SystemSettingsLayout({
  control,
  googleConfigured = true,
}: {
  control: (field: SettingField) => ReactNode;
  /** Without credentials the Google card says so and how to enable it */
  googleConfigured?: boolean;
}) {
  const t = useTranslations("Admin.system");
  const row = (field: SettingField, label: string, description: string) => (
    <SettingRow
      field={field}
      label={label}
      description={description}
      control={control(field)}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <SettingsCard
        title={t("sections.general.title")}
        description={t("sections.general.description")}
      >
        {row(
          "general.signUp",
          t("fields.general.signUp.label"),
          t("fields.general.signUp.description"),
        )}
      </SettingsCard>
      <SettingsCard
        title={t("sections.emailPassword.title")}
        description={t("sections.emailPassword.description")}
      >
        {row(
          "emailPassword.signUp",
          t("fields.emailPassword.signUp.label"),
          t("fields.emailPassword.signUp.description"),
        )}
        {row(
          "emailPassword.access",
          t("fields.emailPassword.access.label"),
          t("fields.emailPassword.access.description"),
        )}
        {row(
          "emailPassword.requireEmailVerification",
          t("fields.emailPassword.requireEmailVerification.label"),
          t("fields.emailPassword.requireEmailVerification.description"),
        )}
        {row(
          "emailPassword.minPasswordLength",
          t("fields.emailPassword.minPasswordLength.label"),
          t("fields.emailPassword.minPasswordLength.description", {
            min: PASSWORD_LENGTH.min,
            max: PASSWORD_LENGTH.max,
          }),
        )}
      </SettingsCard>
      <SettingsCard
        title={t("sections.magicLink.title")}
        description={t("sections.magicLink.description")}
      >
        {row(
          "magicLink.access",
          t("fields.magicLink.access.label"),
          t("fields.magicLink.access.description"),
        )}
        {row(
          "magicLink.signUp",
          t("fields.magicLink.signUp.label"),
          t("fields.magicLink.signUp.description"),
        )}
        {row(
          "magicLink.expiresInMinutes",
          t("fields.magicLink.expiresInMinutes.label"),
          t("fields.magicLink.expiresInMinutes.description", {
            min: MAGIC_LINK_MINUTES.min,
            max: MAGIC_LINK_MINUTES.max,
          }),
        )}
      </SettingsCard>
      <SettingsCard
        title={t("sections.google.title")}
        description={t("sections.google.description")}
        action={
          !googleConfigured && (
            <Badge variant="secondary">{t("notConfigured")}</Badge>
          )
        }
      >
        {!googleConfigured && (
          <FieldDescription>{t("sections.google.setup")}</FieldDescription>
        )}
        {row(
          "google.access",
          t("fields.google.access.label"),
          t("fields.google.access.description"),
        )}
        {row(
          "google.signUp",
          t("fields.google.signUp.label"),
          t("fields.google.signUp.description"),
        )}
      </SettingsCard>
    </div>
  );
}
