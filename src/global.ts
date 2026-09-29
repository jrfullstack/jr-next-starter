import type messages from "../messages/es.json";
import type { routing } from "./i18n/routing";

// Types next-intl: autocompletion and compile errors for locales and message keys
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
