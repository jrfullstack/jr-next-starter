"use client";

import { useTranslations } from "next-intl";

/** Translated labels for texts hardcoded in English in shadcn/ui components (e.g. "Close") */
export function UiLabel({
  id,
}: {
  id: "close" | "sidebar" | "sidebarDescription" | "toggleSidebar";
}) {
  const t = useTranslations("UI");
  return t(id);
}
