"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { AuthFormField, EmailField } from "@/components/auth/auth-form-field";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { createUserSchema } from "@/lib/auth/schemas";

export function CreateUserDialog({ min }: { min: number }) {
  const t = useTranslations("Admin.users.create");
  const tAuth = useTranslations("Auth");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { onSubmit, invalid, error, submitDisabled } = useAuthForm({
    schema: createUserSchema(min),
    submit: (data) => authClient.admin.createUser({ ...data, role: "user" }),
    onSuccess: () => {
      setOpen(false);
      toast.success(t("created"));
      router.refresh();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>{t("open")}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form method="post" onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <AuthFormField
              name="name"
              autoComplete="off"
              label={tAuth("fields.name")}
              error={invalid.name && tAuth("validation.name")}
            />
            <EmailField invalid={invalid.email} />
            <AuthFormField
              name="password"
              type="password"
              autoComplete="new-password"
              label={tAuth("fields.password")}
              error={invalid.password && tAuth("validation.password", { min })}
            />
            {error && <FieldError>{tAuth(`errors.${error}`)}</FieldError>}
            <Button type="submit" disabled={submitDisabled}>
              {t("submit")}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
