import type { Locale } from "next-intl";
import { adminSection } from "@/lib/admin/sections";
import { requirePermission } from "@/lib/auth/authorization";
import {
  countUsersOnlyWith,
  getAuthPolicy,
  superadminAccessMethods,
} from "@/lib/system/policy-store";
import { SystemSettingsForm } from "./system-settings-form";

const section = adminSection("system");

/** Reads the session and the saved policy, so it streams inside a Suspense boundary */
export async function SystemSettings({ locale }: { locale: Locale }) {
  await requirePermission(locale, section.permission, section.href);
  const [policy, superadminMethods, onlyEmailPassword] = await Promise.all([
    getAuthPolicy(),
    superadminAccessMethods(),
    countUsersOnlyWith("emailPassword"),
  ]);

  return (
    <SystemSettingsForm
      policy={policy}
      superadminMethods={superadminMethods}
      usersOnlyWith={{ emailPassword: onlyEmailPassword }}
    />
  );
}
