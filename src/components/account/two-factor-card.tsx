"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { authErrorKey } from "@/lib/auth/errors";
import { BackupCodes } from "./backup-codes";
import { PasswordConfirm } from "./password-confirm";
import { TwoFactorSetup } from "./two-factor-setup";

type Action = "enable" | "disable" | "regenerate";

type Step =
  | { name: "idle" }
  | { name: "password"; action: Action }
  | { name: "scan"; totpURI: string; backupCodes: string[] }
  /** `activated`: the codes come right after turning 2FA on (not a regeneration) */
  | { name: "codes"; backupCodes: string[]; activated: boolean };

type ActionData = { totpURI?: string; backupCodes: string[] };

function callAction(action: Action, body: { password?: string }) {
  if (action === "enable") return authClient.twoFactor.enable(body);
  if (action === "disable") return authClient.twoFactor.disable(body);
  return authClient.twoFactor.generateBackupCodes(body);
}

type Props = {
  enabled: boolean;
  /** The policy requires it for this user: it can't be turned off */
  required: boolean;
  /** Accounts with a password confirm changes with it; the rest don't (allowPasswordless) */
  hasPassword: boolean;
};

/** Turn 2FA on (QR + first code + backup codes), regenerate backup codes, or turn it off */
export function TwoFactorCard({ enabled, required, hasPassword }: Props) {
  const t = useTranslations("Account.security.twoFactor");
  const tAuth = useTranslations("Auth");
  const router = useRouter();
  const hydrated = useHydrated();
  const [step, setStep] = useState<Step>({ name: "idle" });
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const finish = (message?: string) => {
    setStep({ name: "idle" });
    if (message) toast.success(message);
    router.refresh();
  };

  const run = (action: Action, password?: string) =>
    startTransition(async () => {
      setError(undefined);
      const result = await callAction(action, password ? { password } : {});
      if (result.error) {
        setError(
          tAuth(
            `errors.${authErrorKey(result.error.code, result.error.status)}`,
          ),
        );
        return;
      }
      if (action === "disable") return finish(t("deactivated"));
      const { totpURI, backupCodes } = result.data as ActionData;
      setStep(
        totpURI
          ? { name: "scan", totpURI, backupCodes }
          : { name: "codes", backupCodes, activated: false },
      );
    });

  const start = (action: Action) =>
    hasPassword ? setStep({ name: "password", action }) : run(action);

  return (
    <SectionCard
      title={t("title")}
      description={t("description")}
      action={
        <Badge variant={enabled ? "default" : "secondary"}>
          {t(enabled ? "enabled" : "disabledStatus")}
        </Badge>
      }
    >
      <TwoFactorStep
        step={step}
        enabled={enabled}
        required={required}
        locked={!hydrated || pending}
        error={error}
        onStart={start}
        onRun={run}
        onCancel={() => setStep({ name: "idle" })}
        onVerified={(backupCodes) =>
          setStep({ name: "codes", backupCodes, activated: true })
        }
        onDone={(activated) => finish(activated ? t("activated") : undefined)}
      />
    </SectionCard>
  );
}

/** What the card shows at each step of the flow */
function TwoFactorStep({
  step,
  enabled,
  required,
  locked,
  error,
  onStart,
  onRun,
  onCancel,
  onVerified,
  onDone,
}: {
  step: Step;
  enabled: boolean;
  required: boolean;
  locked: boolean;
  error?: string;
  onStart: (action: Action) => void;
  onRun: (action: Action, password: string) => void;
  onCancel: () => void;
  onVerified: (backupCodes: string[]) => void;
  onDone: (activated: boolean) => void;
}) {
  const t = useTranslations("Account.security.twoFactor");
  switch (step.name) {
    case "password":
      return (
        <PasswordConfirm
          error={error}
          pending={locked}
          onConfirm={(password) => onRun(step.action, password)}
          onCancel={onCancel}
        />
      );
    case "scan":
      return (
        <TwoFactorSetup
          totpURI={step.totpURI}
          onVerified={() => onVerified(step.backupCodes)}
        />
      );
    case "codes":
      return (
        <BackupCodes
          codes={step.backupCodes}
          onDone={() => onDone(step.activated)}
        />
      );
    default:
      break;
  }
  if (!enabled) {
    return (
      <Button disabled={locked} onClick={() => onStart("enable")}>
        {t("enable")}
      </Button>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={locked}
          onClick={() => onStart("regenerate")}
        >
          {t("regenerate")}
        </Button>
        <Button
          variant="outline"
          disabled={locked || required}
          onClick={() => onStart("disable")}
        >
          {t("disable")}
        </Button>
      </div>
      {required && <FieldDescription>{t("requiredForYou")}</FieldDescription>}
      {error && <FieldDescription role="alert">{error}</FieldDescription>}
    </div>
  );
}
