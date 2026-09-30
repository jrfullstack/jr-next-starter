import type { Locale } from "next-intl";
import { adminSection } from "@/lib/admin/sections";
import { requirePermission } from "@/lib/auth/authorization";
import {
  authCapabilities,
  getStoredAuthPolicy,
  superadminAccessMethods,
  userMethodGroups,
} from "@/lib/system/policy-store";
import { SystemSettingsForm } from "./system-settings-form";

const section = adminSection("system");

/** Reads the session and the saved policy, so it streams inside a Suspense boundary */
export async function SystemSettings({ locale }: { locale: Locale }) {
  await requirePermission(locale, section.permission, section.href);
  const [policy, superadminMethods, userGroups] = await Promise.all([
    getStoredAuthPolicy(),
    superadminAccessMethods(),
    userMethodGroups(),
  ]);

  return (
    <SystemSettingsForm
      policy={policy}
      superadminMethods={superadminMethods}
      userGroups={userGroups}
      capabilities={authCapabilities()}
    />
  );
}
