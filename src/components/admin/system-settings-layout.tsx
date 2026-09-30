import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  | "magicLink.expiresInMinutes";

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
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>{children}</FieldGroup>
      </CardContent>
    </Card>
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
}: {
  control: (field: SettingField) => ReactNode;
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
    </div>
  );
}
