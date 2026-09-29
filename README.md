# JR Next Starter

Plantilla base para arrancar proyectos con **Next.js 16** en minutos: todo el stack instalado con sus CLIs oficiales, en sus últimas versiones estables, sin vulnerabilidades conocidas y listo para construir encima.

<p align="center">
  <a href="#-características"><strong>Características</strong></a> ·
  <a href="#-roadmap"><strong>Roadmap</strong></a> ·
  <a href="#-librerías"><strong>Librerías</strong></a> ·
  <a href="#-primeros-pasos"><strong>Primeros pasos</strong></a> ·
  <a href="#-scripts"><strong>Scripts</strong></a> ·
  <a href="#-internacionalización"><strong>i18n</strong></a> ·
  <a href="#️-seo"><strong>SEO</strong></a> ·
  <a href="#-testing"><strong>Testing</strong></a> ·
  <a href="#-commits"><strong>Commits</strong></a> ·
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
- 🧪 Vitest + React Testing Library - Tests unitarios y de componentes
- 🎭 Playwright - Tests end-to-end en navegador real
- 💅 Biome - Linter y formatter ultrarrápido
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
- [x] Tests de ejemplo: `cn`, `ModeToggle`, validación de `env` y página de inicio
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

### 🔜 Próximas fases

- [ ] **Fase 6 - Página de inicio propia** (reemplazar la demo de Next.js) y página 404 traducida
- [ ] **Fase 7 - GitHub Actions:** lint, typecheck y tests en cada PR

### 🧭 Fase avanzada

- [ ] Autenticación

## 📦 Librerías

Versiones instaladas a fecha de la última actualización del README.

### Dependencias

| Librería | Versión | Para qué se usa |
|---|---|---|
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
| `next-intl` | 4.14.7 | Traducciones, formato de fechas/números y rutas por idioma para el App Router |
| `next-themes` | 0.4.6 | Tema claro/oscuro/sistema sin parpadeo; guarda la preferencia del usuario |
| `@t3-oss/env-nextjs` | 0.13.11 | Valida con Zod las variables de entorno al arrancar y las expone tipadas en `env` |
| `tw-animate-css` | 1.4.0 | Animaciones de Tailwind CSS 4 que usan los componentes de shadcn |

### Dependencias de desarrollo

| Librería | Versión | Para qué se usa |
|---|---|---|
| `typescript` | 7.0.2 | Tipado estático y comprobación de tipos |
| `tailwindcss` | 4.3.3 | Framework de CSS basado en utilidades |
| `@tailwindcss/postcss` | 4.3.3 | Integra Tailwind en el pipeline de CSS de Next.js |
| `@biomejs/biome` | 2.5.14 | Linter, formatter y ordenación de imports |
| `babel-plugin-react-compiler` | 1.0.0 | React Compiler: memoiza componentes automáticamente |
| `prisma` | 7.10.0 | CLI de Prisma: migraciones, generación del cliente y Prisma Studio |
| `dotenv` | 18.0.4 | Carga `.env` en `prisma.config.ts` |
| `husky` | 9.1.7 | Ejecuta scripts en los hooks de git (`pre-commit`, `commit-msg`) |
| `lint-staged` | 17.6.0 | Pasa Biome solo sobre los archivos en stage del commit |
| `@commitlint/cli` | 21.2.3 | Valida que el mensaje de commit siga el formato convencional |
| `@commitlint/config-conventional` | 21.2.3 | Reglas de Conventional Commits para commitlint |
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

### 1. Clona el proyecto

```bash
git clone <url-del-repositorio> mi-proyecto
```

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

Crea un archivo `.env` a partir de `.env.example` y define:

- `DATABASE_URL`: la conexión a tu PostgreSQL.
- `NEXT_PUBLIC_APP_URL`: la URL pública del sitio (`http://localhost:3000` en local).

Las variables se validan con T3-env en [`src/env.ts`](src/env.ts): si falta alguna o tiene un formato incorrecto, `pnpm dev` y `pnpm build` se detienen con un error que indica cuál. Para añadir una variable nueva, sigue las instrucciones comentadas en ese archivo.

### 5. Crea las tablas de la base de datos

```bash
pnpm db:migrate
```

### 6. Arranca el servidor de desarrollo

```bash
pnpm dev
```

y abre http://localhost:3000.

## 📜 Scripts

| Script | Descripción |
|---|---|
| `dev` | Servidor de desarrollo |
| `build` | Build de producción |
| `start` | Servidor de producción |
| `lint` | Revisa lint y formato con Biome |
| `lint:fix` | Corrige lint y formato automáticamente |
| `format` | Formatea el código con Biome |
| `typecheck` | Comprueba tipos con TypeScript sin generar archivos |
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

## 🌐 Internacionalización

Los textos viven en `messages/<idioma>.json`, agrupados por componente o página. `es.json` es la referencia de tipos: si usas una clave que no existe, TypeScript da error.

**Usar un texto**

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

**Añadir un idioma**

1. Añade el código en `locales` de `src/i18n/routing.ts`.
2. Crea `messages/<idioma>.json` con las mismas claves que `es.json`.
3. Añade su nombre en `LocaleSwitcher.locale` de cada archivo de mensajes.
4. Añade su código de Open Graph en `ogLocales` de `src/lib/seo.ts` (TypeScript te avisa si falta).

## 🗺️ SEO

Todas las URLs absolutas (canonical, `hreflang`, sitemap, Open Graph) se construyen con `NEXT_PUBLIC_APP_URL`. **En producción debe ser tu dominio real** (por ejemplo, `https://midominio.com`).

| Qué | Dónde |
|---|---|
| Metadata global (título, descripción, Open Graph) | `generateMetadata` de `src/app/[locale]/layout.tsx` |
| Textos de la metadata | `Metadata` en `messages/*.json` |
| Imagen Open Graph (1200×630, una por idioma) | `src/app/[locale]/opengraph-image.tsx` |
| `sitemap.xml` | `src/app/sitemap.ts` |
| `robots.txt` | `src/app/robots.ts` |
| Helpers: `absoluteUrl`, `pageAlternates`… | `src/lib/seo.ts` |

**Al crear una página nueva**

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
|---|---|---|---|
| Unitarios y de componentes | Vitest + Testing Library | Junto al archivo que prueban: `button.tsx` → `button.test.tsx` | Funciones, hooks y componentes aislados. Rápidos. |
| End-to-end | Playwright | Carpeta `e2e/` (`*.spec.ts`) | Flujos completos en un navegador real: páginas, navegación, formularios. |

```bash
pnpm test          # unitarios, una vez
pnpm test:watch    # unitarios en modo watch
pnpm e2e           # e2e (arranca `pnpm dev` si no está corriendo)
pnpm e2e:ui        # e2e con interfaz visual
```

- La primera vez, descarga el navegador de Playwright con `pnpm exec playwright install chromium`.
- Si ya tienes `pnpm dev` corriendo, Playwright lo reutiliza (Next 16 no permite dos `next dev` en la misma carpeta). Para probar el build de producción en otro puerto: `CI=1 PORT=3100 pnpm e2e`.
- Para renderizar componentes que usan traducciones, usa `renderWithIntl` de `@/test/render`: carga los mensajes reales.
- Con `CI=1`, Playwright prueba el build de producción (`pnpm build && pnpm start`).
- **Limitación:** Vitest no puede renderizar Server Components `async`. Esos se prueban con Playwright.
- En cada commit, lint-staged ejecuta `vitest related --run`: solo los tests afectados por los archivos que cambiaste.

## 📝 Commits

Cada commit pasa por dos hooks de Husky:

1. **`pre-commit`**: lint-staged ejecuta `biome check --write` sobre los archivos en stage (corrige lo que puede) y los tests de Vitest relacionados. Bloquea el commit si queda algún error o falla algún test.
2. **`commit-msg`**: commitlint exige el formato [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/): `tipo: descripción`.

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un bug |
| `docs` | Solo documentación |
| `style` | Formato, sin cambios de lógica |
| `refactor` | Cambio de código que no añade funcionalidad ni corrige bugs |
| `test` | Añadir o corregir tests |
| `chore` | Mantenimiento, dependencias, configuración |

Ejemplo: `feat: add dark mode toggle`

## 📁 Estructura del proyecto

```bash
.
├── .husky                          # Hooks de git (pre-commit, commit-msg)
├── .vscode                         # Biome como formateador por defecto y extensiones recomendadas
├── e2e                             # Tests end-to-end de Playwright (*.spec.ts)
├── messages                        # Traducciones por idioma (es.json, en.json)
├── prisma
│   └── schema.prisma               # Modelos de la base de datos
├── public                          # Archivos estáticos
├── src
│   ├── app
│   │   ├── [locale]                # Layout raíz, páginas e imagen Open Graph, por idioma
│   │   ├── globals.css             # Estilos globales y tema de Tailwind
│   │   ├── robots.ts               # robots.txt
│   │   └── sitemap.ts              # sitemap.xml
│   ├── components
│   │   ├── ui                      # Componentes de shadcn/ui
│   │   ├── locale-switcher.tsx     # Selector de idioma
│   │   ├── mode-toggle.tsx         # Selector de tema claro/oscuro/sistema
│   │   └── theme-provider.tsx      # Provider de next-themes
│   ├── generated/prisma            # Cliente de Prisma generado (ignorado por git)
│   ├── i18n
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
├── biome.json                      # Configuración de Biome
├── commitlint.config.mjs           # Configuración de commitlint
├── components.json                 # Configuración de shadcn/ui
├── playwright.config.ts            # Configuración de Playwright
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
- **Overrides.** Hay `overrides` en `pnpm-workspace.yaml` que corrigen vulnerabilidades en dependencias del CLI de Prisma. Se pueden quitar cuando Prisma las actualice (`pnpm audit`).

## 🤝 Contribución

1. Crea una rama nueva.
2. Haz tus cambios y confírmalos con un commit.
3. Sube la rama y abre un pull request.

---

Hecho por Jimmy Reyes
