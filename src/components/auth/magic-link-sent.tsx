import { useTranslations } from "next-intl";
import { FieldDescription } from "@/components/ui/field";

/** Same message whether the address has an account or not */
export function MagicLinkSent({
  email,
  minutes,
}: {
  email: string;
  minutes: number;
}) {
  const t = useTranslations("Auth.magicLink");
  return (
    <FieldDescription role="status">
      {t("sent", { email, minutes })}
    </FieldDescription>
  );
}
