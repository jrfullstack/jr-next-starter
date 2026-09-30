"use client";

import { KeyRound } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { type FormEvent, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useHydrated } from "@/hooks/use-hydrated";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { authErrorKey } from "@/lib/auth/errors";

export type ListedPasskey = {
  id: string;
  name?: string | null;
  createdAt: Date;
};

type Result = { error: { code?: string; status?: number } | null };

/** The user's passkeys: add one (named, e.g. "Laptop") or remove one */
export function PasskeysCard({
  passkeys,
  canRegister,
}: {
  passkeys: ListedPasskey[];
  /** From the policy: adding passkeys can be turned off (removing never is) */
  canRegister: boolean;
}) {
  const t = useTranslations("Account.security.passkeys");
  const tAuth = useTranslations("Auth");
  const format = useFormatter();
  const router = useRouter();
  const hydrated = useHydrated();
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string>();
  const [removing, setRemoving] = useState<ListedPasskey>();
  const [pending, startTransition] = useTransition();
  const locked = !hydrated || pending;

  const run = (action: () => Promise<Result>, done: string) =>
    startTransition(async () => {
      setError(undefined);
      const { error: failure } = await action();
      setRemoving(undefined);
      if (failure) {
        setError(tAuth(`errors.${authErrorKey(failure.code, failure.status)}`));
        return;
      }
      form.current?.reset();
      toast.success(done);
      router.refresh();
    });

  // Read from the form (uncontrolled): text typed before hydration isn't lost
  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    run(() => authClient.passkey.addPasskey({ name: name.trim() }), t("added"));
  };

  return (
    <SectionCard title={t("title")} description={t("description")}>
      <div className="flex flex-col gap-4">
        {passkeys.length === 0 ? (
          <FieldDescription>{t("empty")}</FieldDescription>
        ) : (
          <ul className="divide-y" aria-label={t("title")}>
            {passkeys.map((passkey) => (
              <li
                key={passkey.id}
                className="flex items-center justify-between gap-2 py-3 first:pt-0"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {passkey.name || t("unnamed")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("created", {
                        date: format.dateTime(passkey.createdAt, {
                          dateStyle: "medium",
                        }),
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={locked}
                  onClick={() => setRemoving(passkey)}
                >
                  {t("remove")}
                </Button>
              </li>
            ))}
          </ul>
        )}
        {canRegister ? (
          <form
            ref={form}
            method="post"
            onSubmit={add}
            className="flex flex-col gap-3"
          >
            <Field>
              <FieldLabel htmlFor="passkeyName">{t("name")}</FieldLabel>
              <Input
                id="passkeyName"
                name="name"
                placeholder={t("namePlaceholder")}
              />
            </Field>
            <Button type="submit" disabled={locked} className="self-start">
              {t("add")}
            </Button>
          </form>
        ) : (
          <FieldDescription>{t("registerOff")}</FieldDescription>
        )}
        {error && <FieldError>{error}</FieldError>}
      </div>
      <ConfirmActionDialog
        open={removing !== undefined}
        title={t("confirmTitle", { name: removing?.name || t("unnamed") })}
        description={t("confirmDescription")}
        pending={pending}
        onConfirm={() =>
          removing &&
          run(
            () => authClient.passkey.deletePasskey({ id: removing.id }),
            t("removed"),
          )
        }
        onCancel={() => setRemoving(undefined)}
      />
    </SectionCard>
  );
}
