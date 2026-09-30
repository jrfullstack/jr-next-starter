"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";

/** Backup codes, shown once right after they're generated */
export function BackupCodes({
  codes,
  onDone,
}: {
  codes: string[];
  onDone: () => void;
}) {
  const t = useTranslations("Account.security.twoFactor");
  const copy = async () => {
    await navigator.clipboard.writeText(codes.join("\n"));
    toast.success(t("copied"));
  };
  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium">{t("backupTitle")}</p>
      <FieldDescription>{t("backupDescription")}</FieldDescription>
      <ul
        className="grid grid-cols-2 gap-2 rounded-md bg-muted p-3 font-mono text-sm"
        aria-label={t("backupTitle")}
      >
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button variant="outline" onClick={copy}>
          {t("copy")}
        </Button>
        <Button onClick={onDone}>{t("done")}</Button>
      </div>
    </div>
  );
}
