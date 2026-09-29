# JR Next Starter

Plantilla base para arrancar proyectos con **Next.js 16** en minutos: todo el stack instalado con sus CLIs oficiales, en sus últimas versiones estables, sin vulnerabilidades conocidas y listo para construir encima.

<p align="center">
  <a href="#-características"><strong>Características</strong></a> ·
  <a href="#-roadmap"><strong>Roadmap</strong></a> ·
  <a href="#-librerías"><strong>Librerías</strong></a> ·
  <a href="#-primeros-pasos"><strong>Primeros pasos</strong></a> ·
  <a href="#-scripts"><strong>Scripts</strong></a> ·
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
- 💅 Biome - Linter y formatter ultrarrápido
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

### ⏳ Fase 2 - Calidad y DX

- [ ] Dark mode con `next-themes`
- [ ] Husky + lint-staged - Revisar los archivos antes de cada commit
- [ ] Commitlint - Commits convencionales
- [ ] T3-env - Variables de entorno tipadas y validadas

### 🔜 Próximas fases (por definir)

- [ ] Testing unitario (Vitest/Jest + React Testing Library)
- [ ] Testing e2e con Playwright
- [ ] Autenticación
- [ ] Internacionalización con `next-intl`
- [ ] SEO: metadata, Open Graph, `sitemap.xml` y `robots.txt`
- [ ] GitHub Actions - Lint, typecheck y tests en cada PR
- [ ] Página de inicio propia (reemplazar la demo de Next.js)

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
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/pg` | - | Tipos de TypeScript |

## 🎯 Primeros pasos

> Requiere **Node.js 24** (ver `.nvmrc`) y **pnpm 12**.

### 1. Clona el proyecto

```bash
git clone <url-del-repositorio> mi-proyecto
```

### 2. Activa la versión de Node

```bash
nvm use
```

### 3. Instala las dependencias

```bash
pnpm install
```

El `postinstall` genera automáticamente el cliente de Prisma.

### 4. Configura las variables de entorno

Crea un archivo `.env` a partir de `.env.example` y define `DATABASE_URL` con la conexión a tu PostgreSQL.

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
| `db:generate` | Genera el cliente de Prisma |
| `db:migrate` | Crea y aplica migraciones en desarrollo |
| `db:push` | Sincroniza el esquema con la base de datos sin migraciones |
| `db:studio` | Abre Prisma Studio para ver y editar datos |
| `postinstall` | Genera el cliente de Prisma tras cada `pnpm install` |

## 📁 Estructura del proyecto

```bash
.
├── prisma
│   └── schema.prisma               # Modelos de la base de datos
├── public                          # Archivos estáticos
├── src
│   ├── app                         # Next.js App Router (layout, páginas, estilos globales)
│   ├── components
│   │   └── ui                      # Componentes de shadcn/ui
│   ├── generated/prisma            # Cliente de Prisma generado (ignorado por git)
│   └── lib
│       ├── db.ts                   # Cliente de Prisma singleton
│       └── utils.ts                # Utilidades (cn)
├── biome.json                      # Configuración de Biome
├── components.json                 # Configuración de shadcn/ui
├── prisma.config.ts                # Configuración del CLI de Prisma
├── pnpm-workspace.yaml             # Políticas de pnpm (builds permitidos, overrides)
└── .nvmrc                          # Versión de Node.js
```

## 🔒 Seguridad y dependencias

- **Siempre las últimas versiones estables.** Antes de añadir o actualizar algo, comprueba con `npm view <paquete> dist-tags` que `latest` no apunte a una prerelease.
- **Prisma fijado en `7.10.0`.** En npm, el `latest` de `prisma` apunta a `8.0.0-rc`, una release candidate que no coincide con `@prisma/client` 7.x. Por eso `pnpm outdated` lo muestra a propósito.
- **`minimumReleaseAge`.** pnpm 12 rechaza por defecto paquetes publicados hace menos de 24 h. Si falla la instalación por esto, ejecuta `pnpm clean --lockfile && pnpm install`.
- **Builds aprobados.** Solo los paquetes listados en `allowBuilds` de `pnpm-workspace.yaml` pueden ejecutar scripts de instalación (`pnpm approve-builds`).
- **Overrides.** Hay `overrides` en `pnpm-workspace.yaml` que corrigen vulnerabilidades en dependencias del CLI de Prisma. Se pueden quitar cuando Prisma las actualice (`pnpm audit`).

## 🤝 Contribución

1. Crea una rama nueva.
2. Haz tus cambios y confírmalos con un commit.
3. Sube la rama y abre un pull request.

---

Hecho por Jimmy Reyes
