# JR Next Starter

Plantilla base para arrancar proyectos con **Next.js 16** en minutos: todo el stack instalado con sus CLIs oficiales, en sus últimas versiones estables, sin vulnerabilidades conocidas y listo para construir encima.

<p align="center">
  <a href="#-características"><strong>Características</strong></a> ·
  <a href="#-roadmap"><strong>Roadmap</strong></a> ·
  <a href="#-librerías"><strong>Librerías</strong></a> ·
  <a href="#-primeros-pasos"><strong>Primeros pasos</strong></a> ·
  <a href="#-scripts"><strong>Scripts</strong></a> ·
  <a href="#-convenciones-de-código"><strong>Convenciones</strong></a> ·
  <a href="#-variables-de-entorno"><strong>Variables</strong></a> ·
  <a href="#-internacionalización"><strong>i18n</strong></a> ·
  <a href="#️-seo"><strong>SEO</strong></a> ·
  <a href="#-testing"><strong>Testing</strong></a> ·
  <a href="#-commits"><strong>Commits</strong></a> ·
  <a href="#-ci"><strong>CI</strong></a> ·
  <a href="#-versionado-y-releases"><strong>Versionado</strong></a> ·
  <a href="#-estructura-del-proyecto"><strong>Estructura</strong></a> ·
  <a href="#-seguridad-y-dependencias"><strong>Seguridad</strong></a>
</p>

## 🎉 Características

- 🚀 Next.js 16 (App Router, Turbopack, React Compiler)
- ⚛️ React 19
- 📘 TypeScript 7
- 🎨 Tailwind CSS 4
- 🧩 shadcn/ui (estilo `base-nova` sobre Base UI) - Componentes personalizables
- 🔹 Iconos de Lucide
- 🗄️ Prisma 7 + PostgreSQL - ORM con driver adapter `pg`
- 🔍 Zod 4 - Validación de esquemas
- ⚙️ T3-env - Variables de entorno tipadas y validadas al arrancar
- 🌑 Dark mode con `next-themes` (claro / oscuro / sistema)
- 🌐 i18n con `next-intl` - Español e inglés con rutas `/es` y `/en`
- 🗺️ SEO - Metadata, Open Graph generada por idioma, `sitemap.xml`, `robots.txt` y `hreflang`
- 📊 Google Analytics 4 - Se activa solo si defines su ID en las variables de entorno
- ⚡ Vercel Speed Insights y Web Analytics - Se cargan solo al desplegar en Vercel
- 🔕 Telemetría de Next.js y Prisma desactivada
- 🧪 Vitest + React Testing Library - Tests unitarios y de componentes
- 🎭 Playwright - Tests end-to-end en navegador real
- 💅 Biome - Linter y formatter con reglas estrictas de código limpio
- 🧹 knip y jscpd - Detectan código sin usar y código duplicado
- 🎨 Clases de Tailwind siempre en su forma moderna (canónica, v4), ordenadas y sin duplicados, corregidas automáticamente
- 📝 Markdown sin avisos: markdownlint corrige los `.md` al guardar y en cada commit
- 🔤 Ortografía en español e inglés revisada con cspell (editor, commit y CI)
- 🚦 Hook pre-push: `pnpm check` antes de cada push
- 📐 Fuentes de verdad únicas y convenciones documentadas en [`AGENTS.md`](AGENTS.md)
- 🤖 GitHub Actions - Lint, typecheck, tests unitarios, e2e y commits en cada PR
- 🚀 Versionado semántico automático con release-please: CHANGELOG, tags y GitHub Releases
- 🐶 Husky + lint-staged - Lint y formato de los archivos en stage antes de cada commit
- 📝 Commitlint - Commits convencionales (`feat:`, `fix:`…)
- 📈 Alias de imports con el prefijo `@/`
- 🔒 Cadena de suministro protegida con pnpm 12 (`minimumReleaseAge`, builds aprobados)

## 📋 Roadmap

Seguimiento de lo que ya está listo y lo que viene. Cada fase se instala con el CLI oficial de cada librería y en su última versión estable.

### ✅ Fase 0 - Entorno

- [x] Node.js 24 LTS "Krypton" (fijado en `.nvmrc`)
- [x] pnpm 12 (fijado en `packageManager`)
- [x] Auditoría de dependencias sin vulnerabilidades

### ✅ Fase 1 - Base

- [x] Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 (`create-next-app`)
- [x] React Compiler activado
- [x] Biome como linter/formatter
- [x] shadcn/ui + Lucide (`shadcn init`)
- [x] Prisma 7 + PostgreSQL (`prisma init`) con cliente singleton en `src/lib/db.ts`
- [x] Zod
- [x] Scripts de base de datos, lint y typecheck
- [x] `.env.example`

### ✅ Fase 2 - Calidad y DX

- [x] Dark mode con `next-themes` + selector de tema (`ModeToggle`)
- [x] Husky + lint-staged - Biome revisa los archivos en stage antes de cada commit
- [x] Commitlint - Commits convencionales
- [x] T3-env - Variables de entorno tipadas y validadas (`src/env.ts`)

### ✅ Fase 3 - Testing

- [x] Vitest + React Testing Library + jest-dom (tests unitarios y de componentes)
- [x] Playwright (tests e2e con Chromium; arranca Next.js automáticamente)
- [x] Tests de ejemplo: `ModeToggle`, validación de `env` y página de inicio
- [x] lint-staged ejecuta los tests relacionados con los archivos del commit

### ✅ Fase 4 - Internacionalización

- [x] `next-intl` con rutas por idioma (`/es`, `/en`); español por defecto
- [x] `src/proxy.ts` redirige `/` al idioma del navegador
- [x] Locale leído con `next/root-params` (Next 16.3)
- [x] Mensajes tipados: autocompletado y errores de compilación en las claves
- [x] Selector de idioma (`LocaleSwitcher`) que mantiene la página actual
- [x] `ModeToggle` y página demo traducidos
- [x] Tests: paridad de claves entre idiomas, componentes y rutas e2e

### ✅ Fase 5 - SEO

- [x] Metadata global traducida (título con plantilla `%s | JR Next Starter`, descripción)
- [x] URL canónica y `hreflang` (incluido `x-default`) en cada página
- [x] Open Graph y Twitter/X card, con imagen generada por código para cada idioma
- [x] `sitemap.xml` con las versiones de cada idioma y `robots.txt`
- [x] `NEXT_PUBLIC_APP_URL` validada con T3-env como base de todas las URLs absolutas
- [x] Tests unitarios del helper SEO, sitemap y robots, y e2e de lo que sirve el servidor

### ✅ Fase 6 - Página de inicio

- [x] Landing propia: hero y tarjetas con el stack (shadcn `card` y `badge`)
- [x] Header (marca, idioma y tema) y footer en el layout
- [x] Página 404 traducida (`not-found.tsx` + ruta comodín `[...rest]`)
- [x] Eliminados los assets de la demo de Next.js
- [x] Corregida la fuente: `shadcn init` dejó `--font-sans` apuntándose a sí misma y se veía Times en vez de Geist
- [x] Tests del header, footer, landing, 404 y de regresión de la fuente

### ✅ Fase 7 - GitHub Actions

- [x] Workflow `CI` en cada push a `main` y en cada PR
- [x] Jobs en paralelo: calidad (lint, typecheck, unitarios), e2e contra el build de producción y commitlint de los commits del PR
- [x] Action compartida de setup: pnpm (desde `packageManager`), Node (desde `.nvmrc`), caché y `--frozen-lockfile`
- [x] Reporte de Playwright como artefacto si fallan los e2e, y fallos anotados en el PR
- [x] `typecheck` genera los tipos de rutas con `next typegen` (necesario en un clon limpio)
- [x] Workflow validado con actionlint y simulado localmente en un clon limpio

### ✅ Fase 8 - Analytics, variables de entorno y código limpio

- [x] Google Analytics 4 opcional: se carga solo si existe `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [x] Cada variable de entorno documentada en `.env.example` y `src/env.ts`
- [x] Fuentes de verdad: `src/config/site.ts` (datos del sitio) y helpers `parseLocale` / `localeStaticParams`
- [x] Biome estricto: exports con nombre, kebab-case, funciones pequeñas, sin `any`/`!`/`console`, sin textos fuera de `messages/`, sin `process.env` fuera de `src/env.ts`, navegación solo desde `@/i18n/navigation`
- [x] TypeScript más estricto (`noUncheckedIndexedAccess`, `noImplicitReturns`, `noImplicitOverride`)
- [x] knip (código sin usar) y jscpd (duplicados, umbral 0 %) en `pnpm check` y en el CI
- [x] Convenciones documentadas en `AGENTS.md`, para personas y agentes de IA

### ✅ Fase 9 - Rendimiento, telemetría y autofix

- [x] Vercel Speed Insights y Web Analytics, solo en Vercel (`VERCEL=1`)
- [x] Telemetría de Next.js y Prisma desactivada y documentada
- [x] Oxlint + `eslint-plugin-better-tailwindcss`: clases canónicas de Tailwind 4, ordenadas, sin duplicados ni obsoletas
- [x] markdownlint con configuración compartida por el editor y el CLI
- [x] Los arreglos automáticos se aplican al guardar (editor), con `pnpm lint:fix` y en cada commit

### ✅ Fase 10 - Versionado

- [x] release-please: versión semántica calculada a partir de los Conventional Commits
- [x] Release PR automático con el `CHANGELOG.md` en español y el bump de `package.json`
- [x] Al fusionarlo: tag `vX.Y.Z` y GitHub Release

### 🧭 Fase avanzada

- [ ] Autenticación

## 📦 Librerías

Versiones instaladas a fecha de la última actualización del README.

### Dependencias

| Librería | Versión | Para qué se usa |
| --- | --- | --- |
| `next` | 16.3.6 | Framework: rutas (App Router), renderizado en servidor, build y servidor |
| `react` / `react-dom` | 19.3.0 | Librería de UI y renderizado en el DOM |
| `@prisma/client` | 7.10.0 | Cliente tipado para consultar la base de datos (se genera en `src/generated/prisma`) |
| `@prisma/adapter-pg` | 7.10.0 | Conecta Prisma con PostgreSQL a través del driver `pg` |
| `pg` | 8.23.0 | Driver nativo de PostgreSQL para Node.js |
| `zod` | 4.6.5 | Validación de datos y esquemas con inferencia de tipos |
| `@base-ui/react` | 1.8.0 | Primitivas de UI accesibles sin estilos, base de los componentes de shadcn |
| `shadcn` | 4.21.0 | CLI para añadir componentes y estilos base de Tailwind (`shadcn/tailwind.css`) |
| `class-variance-authority` | 0.7.1 | Define variantes de componentes (tamaño, color…) con clases de Tailwind |
| `cn` | 0.4.0 | Combina clases de Tailwind resolviendo conflictos (reemplaza clsx + tailwind-merge) |
| `lucide-react` | 1.48.0 | Iconos SVG como componentes de React |
| `@next/third-parties` | 16.3.6 | Integraciones oficiales de Next.js con servicios externos (Google Analytics) cargadas sin bloquear el renderizado |
| `@vercel/speed-insights` | 2.0.0 | Mide Core Web Vitals de usuarios reales en Vercel (solo se carga en Vercel) |
| `@vercel/analytics` | 2.0.1 | Analítica de visitas de Vercel, sin cookies (solo se carga en Vercel) |
| `next-intl` | 4.14.7 | Traducciones, formato de fechas/números y rutas por idioma para el App Router |
| `next-themes` | 0.4.6 | Tema claro/oscuro/sistema sin parpadeo; guarda la preferencia del usuario |
| `@t3-oss/env-nextjs` | 0.13.11 | Valida con Zod las variables de entorno al arrancar y las expone tipadas en `env` |
| `tw-animate-css` | 1.4.0 | Animaciones de Tailwind CSS 4 que usan los componentes de shadcn |

### Dependencias de desarrollo

| Librería | Versión | Para qué se usa |
| --- | --- | --- |
| `typescript` | 7.0.2 | Tipado estático y comprobación de tipos |
| `tailwindcss` | 4.3.3 | Framework de CSS basado en utilidades |
| `@tailwindcss/postcss` | 4.3.3 | Integra Tailwind en el pipeline de CSS de Next.js |
| `@biomejs/biome` | 2.5.14 | Linter, formatter y ordenación de imports |
| `babel-plugin-react-compiler` | 1.0.0 | React Compiler: memoiza componentes automáticamente |
| `prisma` | 7.10.0 | CLI de Prisma: migraciones, generación del cliente y Prisma Studio |
| `dotenv` | 18.0.4 | Carga `.env` en `prisma.config.ts` |
| `husky` | 9.1.7 | Ejecuta scripts en los hooks de git (`pre-commit`, `commit-msg`, `pre-push`) |
| `lint-staged` | 17.6.0 | Pasa Biome solo sobre los archivos en stage del commit |
| `@commitlint/cli` | 21.2.3 | Valida que el mensaje de commit siga el formato convencional |
| `@commitlint/config-conventional` | 21.2.3 | Reglas de Conventional Commits para commitlint |
| `oxlint` | 1.86.0 | Linter en Rust; aquí solo ejecuta las reglas de clases de Tailwind |
| `eslint-plugin-better-tailwindcss` | 4.7.0 | Reglas de Tailwind: clases canónicas (v4), orden, duplicados, obsoletas, desconocidas y conflictivas |
| `cspell` | 10.3.5 | Corrector ortográfico de código y documentación (mismo motor que la extensión Code Spell Checker) |
| `@cspell/dict-es-es` | 3.0.8 | Diccionario de español para cspell |
| `markdownlint-cli2` | 0.23.3 | Lint y autofix de Markdown (misma configuración que la extensión del editor) |
| `knip` | 6.38.0 | Detecta archivos, exports y dependencias que no se usan |
| `jscpd` | 5.3.3 | Detecta bloques de código duplicado (copy-paste) |
| `vitest` | 5.0.2 | Ejecutor de tests unitarios y de componentes (API compatible con Jest) |
| `@vitejs/plugin-react` | 6.1.1 | Permite a Vitest transformar JSX/TSX de React |
| `jsdom` | 30.1.1 | Simula el DOM del navegador dentro de Node para los tests de componentes |
| `@testing-library/react` | 16.3.3 | Renderiza componentes y los consulta como lo haría un usuario (por rol, texto…) |
| `@testing-library/dom` | 10.4.2 | Base de consultas del DOM que usa Testing Library |
| `@testing-library/user-event` | 14.6.7 | Simula interacciones reales: clics, teclado, escritura |
| `@testing-library/jest-dom` | 7.0.1 | Aserciones del DOM como `toBeInTheDocument()` o `toHaveClass()` |
| `@playwright/test` | 1.63.0 | Tests end-to-end en navegadores reales (Chromium, Firefox, WebKit) |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/pg` | - | Tipos de TypeScript |

## 🎯 Primeros pasos

> Requiere **Node.js 24** (ver `.nvmrc`) y **pnpm 12**.

### 1. Crea tu proyecto a partir del starter

Elige una de estas tres formas:

1. **Como plantilla de GitHub:** pulsa **Use this template → Create a new repository** en [el repositorio](https://github.com/jrfullstack/jr-next-starter) y después clona el tuyo. Empiezas con un historial limpio.
2. **Con `create-next-app`:**

   ```bash
   npx create-next-app@latest mi-proyecto -e https://github.com/jrfullstack/jr-next-starter --use-pnpm
   ```

3. **Con `git clone`:**

   ```bash
   git clone https://github.com/jrfullstack/jr-next-starter.git mi-proyecto
   ```

Después, en tu proyecto: cambia `name` y `author` en `src/config/site.ts`, `name` en `package.json` y la versión en `package.json` y `.release-please-manifest.json` (por ejemplo, `0.1.0`).

> **Editor:** instala las extensiones recomendadas (Biome y Tailwind CSS IntelliSense). `.vscode/settings.json` configura Biome para formatear al guardar. Si tu editor usa Prettier, desactívalo en este proyecto: los dos formateadores chocan.

### 2. Activa la versión de Node

```bash
nvm use
```

### 3. Instala las dependencias

```bash
pnpm install
```

Al instalar se ejecutan automáticamente:

- `prepare`: activa los hooks de git con Husky.
- `postinstall`: genera el cliente de Prisma.

### 4. Configura las variables de entorno

Crea un archivo `.env` a partir de `.env.example` y rellena los valores. Consulta la sección [Variables de entorno](#-variables-de-entorno).

### 5. Crea las tablas de la base de datos

```bash
pnpm db:migrate
```

### 6. Arranca el servidor de desarrollo

```bash
pnpm dev
```

y abre <http://localhost:3000>.

## 📜 Scripts

| Script | Descripción |
| --- | --- |
| `dev` | Servidor de desarrollo |
| `build` | Build de producción |
| `start` | Servidor de producción |
| `lint` | Revisa todo: Biome (código y formato), clases de Tailwind, Markdown y ortografía |
| `lint:fix` | Corrige automáticamente todo lo que se pueda corregir |
| `lint:tw` | Revisa solo las clases de Tailwind (Oxlint) |
| `lint:md` | Revisa solo los archivos Markdown |
| `lint:spell` | Revisa la ortografía (español e inglés) con cspell |
| `format` | Formatea el código con Biome |
| `typecheck` | Genera los tipos de rutas de Next (`next typegen`) y comprueba tipos con TypeScript |
| `knip` | Busca código, exports, archivos y dependencias sin usar |
| `dup` | Busca código duplicado con jscpd |
| `check` | Todo lo anterior junto: lint, typecheck, knip, dup y tests unitarios. Ejecútalo antes de cada commit |
| `test` | Ejecuta los tests unitarios con Vitest |
| `test:watch` | Vitest en modo watch: repite los tests al guardar |
| `e2e` | Ejecuta los tests end-to-end con Playwright |
| `e2e:ui` | Abre la interfaz de Playwright para ver y depurar los tests e2e |
| `db:generate` | Genera el cliente de Prisma |
| `db:migrate` | Crea y aplica migraciones en desarrollo |
| `db:push` | Sincroniza el esquema con la base de datos sin migraciones |
| `db:studio` | Abre Prisma Studio para ver y editar datos |
| `postinstall` | Genera el cliente de Prisma tras cada `pnpm install` |
| `prepare` | Activa los hooks de git de Husky tras cada `pnpm install` |

## 📐 Convenciones de código

Las reglas completas están en [`AGENTS.md`](AGENTS.md), la fuente de verdad que leen tanto las personas como los agentes de IA. En resumen:

- **Cada dato vive en un solo lugar**: datos del sitio en `src/config/site.ts`, textos en `messages/`, variables de entorno en `src/env.ts`, idiomas en `src/i18n/`, URLs del SEO en `src/lib/seo.ts`.
- **Código limpio verificado automáticamente**: si no se cumple, fallan el commit o el CI.

| Herramienta | Qué verifica |
| --- | --- |
| Oxlint | Clases de Tailwind canónicas (v4), ordenadas, sin duplicados, obsoletas ni desconocidas |
| markdownlint | Markdown consistente |
| cspell | Ortografía en español e inglés |
| Biome | Reglas estrictas: exports con nombre, archivos en kebab-case, funciones ≤ 80 líneas y complejidad ≤ 15, sin `any`/`!`/`console`, sin textos fuera de `messages/`, sin `process.env` fuera de `src/env.ts`, navegación con idioma |
| TypeScript | `strict` + `noUncheckedIndexedAccess`, `noImplicitReturns`, `noImplicitOverride` |
| knip | Nada sin usar: archivos, exports, dependencias (excepciones justificadas en `knip.jsonc`) |
| jscpd | Nada duplicado (umbral 0 %, configurado en `.jscpd.json`) |

Ejecuta `pnpm check` antes de cada commit.

### Arreglos automáticos

Lo que se puede corregir solo se corrige en tres momentos:

| Cuándo | Cómo |
| --- | --- |
| **Al guardar** (VS Code, Windsurf, Cursor) | `.vscode/settings.json` ejecuta Biome, Oxlint y markdownlint. Instala las extensiones recomendadas |
| **A mano** | `pnpm lint:fix` |
| **En cada commit** | lint-staged corrige los archivos en stage e incluye los cambios |

**Tailwind:** Oxlint con `eslint-plugin-better-tailwindcss` usa la API oficial de Tailwind 4 para convertir las clases a su forma canónica (la misma sugerencia que ves en Tailwind IntelliSense), ordenarlas y reemplazar las obsoletas. Ejemplo: `text-sm  border-t backdrop-blur !mt-4 h-[14px] w-[14px]` → `mt-4! size-[14px] border-t text-sm backdrop-blur-sm`. Como Oxlint aplica una sola corrección por cadena en cada pasada, `scripts/oxlint-fix.mjs` repite las pasadas hasta que no queda nada por corregir.

**Markdown:** la configuración (`.markdownlint-cli2.jsonc`) la comparten el CLI y la extensión de markdownlint del editor, así que ambos muestran lo mismo.

## 🔑 Variables de entorno

[`.env.example`](.env.example) es la documentación completa: cada variable tiene una ficha con qué es, si es obligatoria, su formato, dónde se obtiene y dónde se usa. Todas se validan al arrancar en [`src/env.ts`](src/env.ts) con T3-env.

| Variable | Tipo | Obligatoria | Para qué |
| --- | --- | --- | --- |
| `DATABASE_URL` | Servidor (secreta) | Sí | Conexión a PostgreSQL para Prisma |
| `NEXT_PUBLIC_APP_URL` | Pública | Sí | URL del sitio, base de las URLs absolutas del SEO |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Pública | No | ID de Google Analytics 4 (`G-XXXXXXXXXX`). Si está vacía, Analytics no se carga |
| `NEXT_TELEMETRY_DISABLED` | Herramienta | No (recomendado `1`) | Desactiva la telemetría anónima de Next.js |
| `CHECKPOINT_DISABLE` | Herramienta | No (recomendado `1`) | Desactiva la telemetría y el aviso de versiones del CLI de Prisma |
| `VERCEL` | Plataforma | La define Vercel | Vale `1` en Vercel y activa Speed Insights y Web Analytics |
| `SKIP_ENV_VALIDATION` | - | No | Desactiva la validación (CI/Docker). Nunca en producción |

- **Pública** (`NEXT_PUBLIC_*`): se incluye en el JavaScript del navegador. Nunca pongas secretos en ellas.
- **Servidor**: solo existe en el servidor. T3-env da error si se intenta leer desde un Client Component.
- En el código usa siempre `import { env } from "@/env"`, nunca `process.env` directamente.

**Añadir una variable:** sigue los pasos comentados al principio de `src/env.ts` (ficha en `.env.example`, esquema en `src/env.ts` y, si tiene formato especial, un test en `src/env.test.ts`).

### Telemetría

`NEXT_TELEMETRY_DISABLED=1` en `.env` cubre `next build` y el servidor de desarrollo, pero el proceso principal de `next dev` envía un último evento al cerrarse antes de leer `.env`. Para desactivarla del todo en tu equipo, ejecuta una vez:

```bash
pnpm exec next telemetry disable
```

En CI, las dos variables de telemetría están definidas en el workflow.

### Vercel Speed Insights y Web Analytics

[`<VercelInsights />`](src/components/vercel-insights.tsx) solo se carga cuando la app corre en Vercel (`VERCEL=1`, que define Vercel automáticamente). En local u otros servidores no añade ningún script. Para que recojan datos, actívalos en el panel del proyecto en Vercel: **Speed Insights → Enable** y **Analytics → Enable**.

### Google Analytics

Define `NEXT_PUBLIC_GA_MEASUREMENT_ID` con tu ID (`G-XXXXXXXXXX`) y el componente [`<Analytics />`](src/components/analytics.tsx) del layout cargará Google Analytics 4 en todas las páginas. Si la variable está vacía, no se carga nada. Recomendación: defínela solo en producción, para no mezclar tus visitas de desarrollo con las reales.

## 🌐 Internacionalización

Los textos viven en `messages/<idioma>.json`, agrupados por componente o página. `es.json` es la referencia de tipos: si usas una clave que no existe, TypeScript da error.

### Usar un texto

```tsx
// Server o Client Component
import { useTranslations } from "next-intl";

const t = useTranslations("HomePage");
t("title");

// Server Component async o generateMetadata
import { getTranslations } from "next-intl/server";

const t = await getTranslations("HomePage");
```

**Enlaces y navegación:** importa `Link`, `redirect`, `useRouter` y `usePathname` desde `@/i18n/navigation` (no desde `next/link` ni `next/navigation`) para que mantengan el idioma actual.

**Añadir un texto:** agrégalo con la misma clave en todos los archivos de `messages/`. Un test comprueba que todos los idiomas tengan las mismas claves y que ninguna esté vacía.

### Añadir un idioma

1. Añade el código en `locales` de `src/i18n/routing.ts`.
2. Crea `messages/<idioma>.json` con las mismas claves que `es.json`.
3. Añade su nombre en `LocaleSwitcher.locale` de cada archivo de mensajes.
4. Añade su código de Open Graph en `ogLocales` de `src/lib/seo.ts` (TypeScript te avisa si falta).

## 🗺️ SEO

Todas las URLs absolutas (canonical, `hreflang`, sitemap, Open Graph) se construyen con `NEXT_PUBLIC_APP_URL`. **En producción debe ser tu dominio real** (por ejemplo, `https://midominio.com`).

| Qué | Dónde |
| --- | --- |
| Metadata global (título, descripción, Open Graph) | `generateMetadata` de `src/app/[locale]/layout.tsx` |
| Textos de la metadata | `Metadata` en `messages/*.json` |
| Imagen Open Graph (1200×630, una por idioma) | `src/app/[locale]/opengraph-image.tsx` |
| `sitemap.xml` | `src/app/sitemap.ts` |
| `robots.txt` | `src/app/robots.ts` |
| Helpers: `absoluteUrl`, `pageAlternates`… | `src/lib/seo.ts` |

### Al crear una página nueva

1. Exporta `generateMetadata` con su título y `alternates: pageAlternates("/ruta", locale)`, para que tenga su URL canónica y sus `hreflang`.
2. Añade la ruta a `routes` en `src/app/sitemap.ts`.

```tsx
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("AboutPage");

  return {
    title: t("title"), // se muestra como "Título | JR Next Starter"
    alternates: pageAlternates("/about", locale),
  };
}
```

## 🧪 Testing

| Tipo | Herramienta | Dónde van | Para qué |
| --- | --- | --- | --- |
| Unitarios y de componentes | Vitest + Testing Library | Junto al archivo que prueban: `button.tsx` → `button.test.tsx` | Funciones, hooks y componentes aislados. Rápidos. |
| End-to-end | Playwright | Carpeta `e2e/` (`*.spec.ts`) | Flujos completos en un navegador real: páginas, navegación, formularios. |

```bash
pnpm test          # unitarios, una vez
pnpm test:watch    # unitarios en modo watch
pnpm e2e           # e2e (arranca `pnpm dev` si no está corriendo)
pnpm e2e:ui        # e2e con interfaz visual
```

- La primera vez, descarga el navegador de Playwright con `pnpm exec playwright install chromium`.
- Si ya tienes `pnpm dev` corriendo, Playwright lo reutiliza (Next 16 no permite dos `next dev` en la misma carpeta).
- Para renderizar componentes que usan traducciones, usa `renderWithIntl` de `@/test/render`: carga los mensajes reales.
- Con `CI=1`, Playwright prueba el build de producción con `pnpm start`, así que antes hay que ejecutar `pnpm build`: `pnpm build && CI=1 PORT=3100 pnpm e2e`.
- **Limitación:** Vitest no puede renderizar Server Components `async`. Esos se prueban con Playwright.
- En cada commit, lint-staged ejecuta `vitest related --run`: solo los tests afectados por los archivos que cambiaste.
- **Qué testear y qué no:** criterio en [`AGENTS.md`](AGENTS.md#qué-testear-y-qué-no). En resumen: solo lógica o configuración propia, flujos de usuario en e2e agrupados, y nada que ya garanticen TypeScript o las librerías.

## 📝 Commits

Husky ejecuta tres hooks de git:

1. **`pre-commit`**: lint-staged corrige automáticamente los archivos en stage (las correcciones se incluyen en el commit):
   - `.ts`/`.tsx`: clases de Tailwind a su forma moderna y ordenadas (Oxlint) y lint/formato (Biome).
   - `.md`: markdownlint.
   - `.json`/`.css`: Biome.
   - Tests de Vitest relacionados con los archivos cambiados.

   Si queda algo que no se puede corregir solo (por ejemplo, una clase de Tailwind que no existe) o falla un test, el commit se bloquea.
2. **`commit-msg`**: commitlint exige el formato [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/): `tipo: descripción`.
3. **`pre-push`**: ejecuta `pnpm check` (lint, typecheck, knip, jscpd y tests unitarios) antes de subir nada. Así no llega a GitHub un commit que el CI vaya a rechazar. En caso de urgencia, `git push --no-verify` lo salta.

| Tipo | Cuándo usarlo |
| --- | --- |
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un bug |
| `docs` | Solo documentación |
| `style` | Formato, sin cambios de lógica |
| `refactor` | Cambio de código que no añade funcionalidad ni corrige bugs |
| `test` | Añadir o corregir tests |
| `chore` | Mantenimiento, dependencias, configuración |

Ejemplo: `feat: add dark mode toggle`

### Ortografía

cspell revisa el código y la documentación en **español e inglés** (`cspell.jsonc`). Lo usan tanto el CLI (`pnpm lint:spell`, pre-commit y CI) como la extensión **Code Spell Checker** del editor, así que ambos muestran lo mismo.

Si marca una palabra correcta (un nombre de librería, un término técnico), añádela a `words` en `cspell.jsonc`, en orden alfabético. En el editor también puedes usar la acción rápida *Add to workspace settings* sobre la palabra.

## 🤖 CI

`.github/workflows/ci.yml` se ejecuta en cada push a `main` y en cada pull request:

| Job | Qué hace |
| --- | --- |
| **Lint, typecheck, dead code, duplicates & unit tests** | `pnpm lint`, `pnpm typecheck`, `pnpm knip`, `pnpm dup` y `pnpm test` |
| **E2E tests** | Instala Chromium, compila (`pnpm build`) y ejecuta `pnpm e2e` contra el build de producción. Sube `playwright-report` como artefacto (7 días). |
| **Commit messages** | Solo en PRs: valida con commitlint todos los commits del PR |

- Usa valores de ejemplo para `DATABASE_URL` y `NEXT_PUBLIC_APP_URL` (y no define `NEXT_PUBLIC_GA_MEASUREMENT_ID`), para que pase la validación de T3-env. Ningún job se conecta a una base de datos. Si en el futuro necesitas secretos reales, añádelos en **Settings → Secrets and variables → Actions**.
- La configuración común (pnpm, Node, caché e instalación) está en la action `.github/actions/setup`.

### Cómo se usa GitHub Actions

1. **Sube el repo a GitHub.** Los workflows de `.github/workflows/` se activan solos; no hay nada que instalar.
2. **Configura el repositorio** (una sola vez), en **Settings**:
   - **Actions → General → Workflow permissions**: marca *Allow GitHub Actions to create and approve pull requests* (lo necesita release-please).
   - **Branches → Add branch ruleset** para `main`: *Require a pull request before merging* y *Require status checks to pass*, y elige los checks `Lint, typecheck, dead code, duplicates & unit tests`, `E2E tests` y `Commit messages`. Así nada entra en `main` sin pasar el CI.
3. **Trabaja con ramas y PRs:**

   ```bash
   git switch -c feat/mi-cambio
   git commit -m "feat: add contact page"
   git push -u origin feat/mi-cambio
   ```

   Abre el PR en GitHub. En la pestaña **Checks** (o en **Actions**) ves cada job en vivo, con su log. Si un e2e falla, descarga el artefacto `playwright-report` del resumen del run y abre `index.html`.
4. **Re-ejecutar:** en el run, **Re-run jobs** (útil si falló algo puntual de red).
5. **Secretos:** si un job necesita credenciales reales, añádelas en **Settings → Secrets and variables → Actions** y úsalas como `${{ secrets.NOMBRE }}`.

## 🚀 Versionado y releases

La versión sigue [Semantic Versioning](https://semver.org/lang/es/) (`MAYOR.MENOR.PARCHE`) y la calcula [release-please](https://github.com/googleapis/release-please) a partir de los mensajes de commit, que commitlint ya obliga a escribir en formato convencional.

| Commit | Efecto en la versión (desde 1.0.0) | Mientras la versión sea 0.x |
| --- | --- | --- |
| `fix: …` | Parche: 1.2.3 → 1.2.4 | 0.1.0 → 0.1.1 |
| `feat: …` | Menor: 1.2.3 → 1.3.0 | 0.1.0 → 0.2.0 |
| `feat!: …` o `BREAKING CHANGE:` en el cuerpo | Mayor: 1.2.3 → 2.0.0 | 0.1.0 → 0.2.0 |
| `docs`, `refactor`, `perf` | Aparecen en el CHANGELOG; sin nuevas funcionalidades suben el parche | |
| `chore`, `ci`, `test`, `style`, `build` | No generan release | |

### Flujo

1. Fusionas PRs en `main` con commits convencionales.
2. El workflow **Release** (`.github/workflows/release.yml`) abre o actualiza un PR llamado **"chore(main): release X.Y.Z"** con la nueva versión en `package.json` y las notas en `CHANGELOG.md`.
3. Cuando quieras publicar, **fusionas ese PR**: release-please crea el tag `vX.Y.Z` y la **GitHub Release** con las notas.

No hay que tocar la versión a mano. Para forzar una versión concreta, añade `Release-As: 1.0.0` en el cuerpo de un commit.

| Archivo | Para qué |
| --- | --- |
| `release-please-config.json` | Tipo de proyecto (`node`) y secciones del CHANGELOG en español |
| `.release-please-manifest.json` | Última versión publicada (lo actualiza release-please) |
| `CHANGELOG.md` | Lo genera release-please; no lo edites a mano |

> **CI en el PR de release:** los PRs creados con el `GITHUB_TOKEN` por defecto no disparan otros workflows. Si quieres que el CI también se ejecute en el PR de release, crea un *fine-grained personal access token* (permisos: Contents y Pull requests, lectura y escritura) y guárdalo como secreto `RELEASE_PLEASE_TOKEN`; el workflow lo usará automáticamente.

## 📁 Estructura del proyecto

```bash
.
├── .github
│   ├── actions/setup               # Setup compartido: pnpm, Node, caché e instalación
│   └── workflows
│       ├── ci.yml                  # Pipeline de CI (en cada push a main y PR)
│       └── release.yml             # release-please: PR de release, tags y GitHub Releases
├── .husky                          # Hooks de git (pre-commit, commit-msg, pre-push)
├── .vscode                         # Biome como formateador por defecto y extensiones recomendadas
├── e2e                             # Tests end-to-end de Playwright (*.spec.ts)
├── messages                        # Traducciones por idioma (es.json, en.json)
├── prisma
│   └── schema.prisma               # Modelos de la base de datos
├── public                          # Archivos estáticos
├── src
│   ├── app
│   │   ├── [locale]                # Layout raíz, páginas, 404 e imagen Open Graph, por idioma
│   │   │   └── [...rest]           # Envía las rutas desconocidas al 404 traducido
│   │   ├── globals.css             # Estilos globales y tema de Tailwind
│   │   ├── robots.ts               # robots.txt
│   │   └── sitemap.ts              # sitemap.xml
│   ├── components
│   │   ├── ui                      # Componentes de shadcn/ui
│   │   ├── analytics.tsx           # Google Analytics (solo si hay ID)
│   │   ├── locale-switcher.tsx     # Selector de idioma
│   │   ├── mode-toggle.tsx         # Selector de tema claro/oscuro/sistema
│   │   ├── site-footer.tsx         # Pie de página
│   │   ├── site-header.tsx         # Cabecera con marca, idioma y tema
│   │   ├── vercel-insights.tsx     # Speed Insights y Web Analytics (solo en Vercel)
│   │   └── theme-provider.tsx      # Provider de next-themes
│   ├── config
│   │   └── site.ts                 # Datos del sitio: nombre, autor, enlaces
│   ├── generated/prisma            # Cliente de Prisma generado (ignorado por git)
│   ├── i18n
│   │   ├── locale.ts               # parseLocale y localeStaticParams
│   │   ├── navigation.ts           # Link, useRouter… con idioma
│   │   ├── request.ts              # Carga los mensajes del idioma actual
│   │   └── routing.ts              # Idiomas soportados e idioma por defecto
│   ├── lib
│   │   ├── db.ts                   # Cliente de Prisma singleton
│   │   ├── seo.ts                  # URLs absolutas, canonical y hreflang
│   │   └── utils.ts                # Utilidades (cn)
│   ├── test
│   │   └── render.tsx              # renderWithIntl para tests de componentes
│   ├── env.ts                      # Variables de entorno validadas (T3-env)
│   ├── global.ts                   # Tipos de next-intl (idiomas y claves de mensajes)
│   ├── proxy.ts                    # Redirección por idioma (antes middleware.ts)
│   └── **/*.test.ts(x)             # Tests unitarios junto a su archivo
├── scripts
│   └── oxlint-fix.mjs              # Repite `oxlint --fix` hasta que no quede nada corregible
├── .jscpd.json                     # Configuración de detección de duplicados
├── .markdownlint-cli2.jsonc        # Reglas de Markdown (CLI y extensión del editor)
├── .release-please-manifest.json   # Versión actual publicada (release-please)
├── AGENTS.md                       # Convenciones del proyecto (personas y agentes de IA)
├── biome.json                      # Configuración de Biome (reglas estrictas)
├── commitlint.config.mjs           # Configuración de commitlint
├── components.json                 # Configuración de shadcn/ui
├── cspell.jsonc                    # Idiomas y vocabulario del corrector ortográfico
├── knip.jsonc                      # Configuración de knip (excepciones justificadas)
├── oxlint.config.mts               # Reglas de clases de Tailwind
├── playwright.config.ts            # Configuración de Playwright
├── release-please-config.json      # Configuración del versionado y del CHANGELOG
├── prisma.config.ts                # Configuración del CLI de Prisma
├── pnpm-workspace.yaml             # Políticas de pnpm (builds permitidos, overrides)
├── vitest.config.mts               # Configuración de Vitest
├── vitest.setup.ts                 # Setup de tests (jest-dom, limpieza)
└── .nvmrc                          # Versión de Node.js
```

## 🔒 Seguridad y dependencias

- **Siempre las últimas versiones estables.** Antes de añadir o actualizar algo, comprueba con `npm view <paquete> dist-tags` que `latest` no apunte a una prerelease.
- **Prisma fijado en `7.10.0`.** En npm, el `latest` de `prisma` apunta a `8.0.0-rc`, una release candidate que no coincide con `@prisma/client` 7.x. Por eso `pnpm outdated` lo muestra a propósito.
- **`minimumReleaseAge`.** pnpm 12 rechaza por defecto paquetes publicados hace menos de 24 h. Si falla la instalación por esto, ejecuta `pnpm clean --lockfile && pnpm install`.
- **Builds aprobados.** Solo los paquetes listados en `allowBuilds` de `pnpm-workspace.yaml` pueden ejecutar scripts de instalación (`pnpm approve-builds`). Los denegados (`sharp`, `@swc/core`, `@parcel/watcher`…) ya traen sus binarios precompilados y no los necesitan.
- **Overrides.** Hay `overrides` en `pnpm-workspace.yaml` que corrigen vulnerabilidades en dependencias del CLI de Prisma y un conflicto de versiones de `valibot`. Se pueden quitar cuando Prisma las actualice (`pnpm audit`, `pnpm peers check`).
- **Nunca añadas excepciones a `minimumReleaseAge`** (`minimumReleaseAgeExclude`) para instalar una versión recién publicada: espera 24 h.

## 🤝 Contribución

1. Crea una rama nueva.
2. Haz tus cambios y confírmalos con un commit.
3. Sube la rama y abre un pull request.

---

Hecho por Jimmy Reyes
