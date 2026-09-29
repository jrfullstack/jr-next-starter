import {
  Code,
  Database,
  FlaskConical,
  Languages,
  type LucideIcon,
  Palette,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getLocale } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    alternates: pageAlternates("/", locale),
  };
}

// Keys match HomePage.features in messages/*.json
const features = [
  { id: "nextjs", icon: Zap },
  { id: "typescript", icon: Code },
  { id: "ui", icon: Palette },
  { id: "database", icon: Database },
  { id: "i18n", icon: Languages },
  { id: "seo", icon: Search },
  { id: "testing", icon: FlaskConical },
  { id: "quality", icon: ShieldCheck },
] as const satisfies readonly { id: string; icon: LucideIcon }[];

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <main className="flex-1">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center sm:py-32">
        <Badge variant="secondary">{t("badge")}</Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
          {t("description")}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="#stack" className={buttonVariants({ size: "lg" })}>
            {t("primaryCta")}
          </a>
          <a
            href={siteConfig.links.nextDocs}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {t("secondaryCta")}
          </a>
        </div>
      </section>

      <section
        id="stack"
        aria-labelledby="stack-title"
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 pb-24"
      >
        <div className="mb-10 text-center">
          <h2
            id="stack-title"
            className="text-3xl font-bold tracking-tight text-balance"
          >
            {t("stackTitle")}
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            {t("stackDescription")}
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ id, icon: Icon }) => (
            <li key={id}>
              <Card className="h-full">
                <CardHeader>
                  <Icon className="mb-2 size-6 text-primary" aria-hidden />
                  <CardTitle>
                    <h3>{t(`features.${id}.title`)}</h3>
                  </CardTitle>
                  <CardDescription>
                    {t(`features.${id}.description`)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
