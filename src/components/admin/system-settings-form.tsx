"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { useHydrated } from "@/hooks/use-hydrated";
import { saveAuthPolicy } from "@/lib/system/actions";
import {
  type AccessMethod,
  type AuthCapabilities,
  type AuthPolicy,
  authPolicySchema,
  disabledAccessMethods,
  effectivePolicy,
  type PolicyValue,
  policyViolations,
  type UserMethodGroup,
  usersLockedOut,
} from "@/lib/system/policy";
import { SettingControl } from "./system-setting-control";
import {
  type SettingField,
  SystemSettingsLayout,
} from "./system-settings-layout";

type Props = {
  /** Policy as saved; the form edits a copy until "Save" */
  policy: AuthPolicy;
  /** Methods linked to each superadmin, for the safeguards */
  superadminMethods: AccessMethod[][];
  /** Users grouped by linked methods, to count who'd be left without a way in */
  userGroups: UserMethodGroup[];
  /** Methods the deployment can offer (Google needs credentials) */
  capabilities: AuthCapabilities;
};

function settingValue(policy: AuthPolicy, field: SettingField) {
  const [section, key] = field.split(".") as [keyof AuthPolicy, string];
  return (policy[section] as Record<string, PolicyValue>)[key];
}

function withValue(
  policy: AuthPolicy,
  field: SettingField,
  value: PolicyValue,
): AuthPolicy {
  const [section, key] = field.split(".") as [keyof AuthPolicy, string];
  return { ...policy, [section]: { ...policy[section], [key]: value } };
}

export function SystemSettingsForm({
  policy: saved,
  superadminMethods,
  userGroups,
  capabilities,
}: Props) {
  const t = useTranslations("Admin.system");
  const [policy, setPolicy] = useState(saved);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const hydrated = useHydrated();

  const valid = authPolicySchema.safeParse(policy).success;
  // Safeguards judge the policy as it would apply (no Google without credentials)
  const applied = effectivePolicy(policy, capabilities);
  const violations = valid ? policyViolations(applied, superadminMethods) : [];
  const disabling = disabledAccessMethods(
    effectivePolicy(saved, capabilities),
    applied,
  );
  const dirty = JSON.stringify(policy) !== JSON.stringify(saved);
  const locked = !hydrated || pending;

  const save = () =>
    startTransition(async () => {
      const result = await saveAuthPolicy(policy);
      setConfirming(false);
      if (result.ok) toast.success(t("saved"));
      else toast.error(t(`errors.${result.error}`));
    });

  const control = (field: SettingField) => {
    const value = settingValue(policy, field);
    if (value === undefined) return null;
    const unavailable = field.startsWith("google.") && !capabilities.google;
    return (
      <SettingControl
        field={field}
        value={value}
        disabled={locked || unavailable}
        onChange={(next) => setPolicy(withValue(policy, field, next))}
      />
    );
  };

  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        if (disabling.length > 0) setConfirming(true);
        else save();
      }}
    >
      <SystemSettingsLayout
        control={control}
        googleConfigured={capabilities.google}
      />
      <div className="mt-4 flex flex-col items-end gap-2">
        {!valid && <FieldError>{t("invalid")}</FieldError>}
        {violations.map((violation) => (
          <FieldError key={violation}>
            {t(`violations.${violation}`)}
          </FieldError>
        ))}
        <Button
          type="submit"
          disabled={locked || !dirty || !valid || violations.length > 0}
        >
          {t("save")}
        </Button>
      </div>
      <ConfirmActionDialog
        open={confirming}
        title={t("confirm.title")}
        description={t("confirm.description", {
          count: usersLockedOut(applied, userGroups),
        })}
        pending={pending}
        onConfirm={save}
        onCancel={() => setConfirming(false)}
      />
    </form>
  );
}
