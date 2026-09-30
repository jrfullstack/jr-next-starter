"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { type PolicyValue, twoFactorLevels } from "@/lib/system/policy";
import {
  numberSettings,
  type SettingField,
  settingId,
} from "./system-settings-layout";

function inRange(field: SettingField, value: number) {
  const bounds = numberSettings[field];
  return (
    Number.isInteger(value) &&
    bounds !== undefined &&
    value >= bounds.min &&
    value <= bounds.max
  );
}

/** The input of one System setting: a switch, a number or the 2FA level select */
export function SettingControl({
  field,
  value,
  disabled,
  onChange,
}: {
  field: SettingField;
  value: PolicyValue;
  disabled: boolean;
  onChange: (value: PolicyValue) => void;
}) {
  const t = useTranslations("Admin.system");
  const id = settingId(field);

  if (typeof value === "boolean") {
    return (
      <Switch
        id={id}
        checked={value}
        disabled={disabled}
        onCheckedChange={onChange}
      />
    );
  }
  if (typeof value === "string") {
    return (
      <NativeSelect
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value as (typeof twoFactorLevels)[number])
        }
      >
        {twoFactorLevels.map((level) => (
          <NativeSelectOption key={level} value={level}>
            {t(`twoFactorLevels.${level}`)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  }
  const bounds = numberSettings[field];
  return (
    <Input
      id={id}
      type="number"
      min={bounds?.min}
      max={bounds?.max}
      value={Number.isNaN(value) ? "" : value}
      aria-invalid={!inRange(field, value)}
      disabled={disabled}
      onChange={(event) => onChange(event.target.valueAsNumber)}
      className="w-20"
    />
  );
}
