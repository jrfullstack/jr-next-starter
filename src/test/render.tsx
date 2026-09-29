import { type RenderOptions, render } from "@testing-library/react";
import { type Locale, NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

const messages = { es, en };

type Options = Omit<RenderOptions, "wrapper"> & { locale?: Locale };

/** Render a component inside NextIntlClientProvider with the real messages */
export function renderWithIntl(
  ui: ReactElement,
  { locale = "es", ...options }: Options = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    ),
    ...options,
  });
}
