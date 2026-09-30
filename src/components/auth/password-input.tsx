"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

/** Password input with a show/hide toggle (a toggle button: fixed label + aria-pressed) */
export function PasswordInput(
  props: Omit<ComponentProps<typeof InputGroupInput>, "type">,
) {
  const t = useTranslations("Auth");
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput type={visible ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={t("showPassword")}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
