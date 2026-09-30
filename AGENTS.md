<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Convenciones del proyecto

Reglas para cualquier persona o agente que escriba código aquí. Las marcadas con 🔒 las comprueban las herramientas (Biome, TypeScript, knip, jscpd), así que el commit o el CI fallan si no se cumplen.

### Fuentes de verdad

Cada dato vive en **un solo lugar**. Antes de escribir un valor, búscalo aquí; si no existe, créalo en el lugar correspondiente y reutilízalo.

| Qué | Dónde | Cómo se usa |
| --- | --- | --- |
| Datos del sitio (nombre, autor, enlaces) | `src/config/site.ts` | `siteConfig.name` |
| Textos visibles al usuario | `messages/*.json` | `useTranslations` / `getTranslations` 🔒 `noJsxLiterals` |
| Variables de entorno | `src/env.ts` (ficha completa en `.env.example`) | `import { env } from "@/env"` 🔒 `noProcessEnv` |
| Idiomas soportados | `src/i18n/routing.ts` | `routing.locales` |
| Validar un locale / params estáticos | `src/i18n/locale.ts` | `parseLocale`, `localeStaticParams` |
| Roles y permisos | `src/lib/auth/permissions.ts` | `can(role, { user: ["ban"] })` (cliente y servidor); `requirePermission` en páginas |
| Secciones del panel `/admin` | `src/lib/admin/sections.ts` | Añade aquí cada sección nueva con su permiso: menú y protección salen de ahí |
| Enlaces y navegación | `src/i18n/navigation.ts` | `Link`, `useRouter`, `redirect`… 🔒 `noRestrictedImports` |
| URLs absolutas, canonical, hreflang | `src/lib/seo.ts` | `absoluteUrl`, `pageAlternates` |
| Rutas indexables | `src/app/sitemap.ts` (`routes`) | Añade cada página pública nueva |
| Componentes base de UI | `src/components/ui` (shadcn) | `pnpm exec shadcn add <componente>`; no reinventar |
| Combinar clases de Tailwind | `cn` | `cn("px-2", cond && "px-4")` |

### Código limpio

- 🔒 **Exports con nombre.** Solo los archivos que Next.js exige (`page`, `layout`, configs…) usan `export default`.
- 🔒 **Archivos en `kebab-case`**: `site-header.tsx`, no `SiteHeader.tsx`.
- 🔒 **Funciones pequeñas**: máximo 80 líneas y complejidad cognitiva ≤ 15. Si crece, extrae funciones o componentes.
- 🔒 **Sin `any`, sin `!` (non-null assertion), sin `console`, sin ternarios anidados, sin `else` innecesario.**
- 🔒 **Nada sin usar**: imports, variables, parámetros, exports, archivos ni dependencias (Biome + knip).
- 🔒 **Sin código duplicado** (jscpd, umbral 0 %). Si copias un bloque, extráelo a una función compartida.
- 🔒 **Sin barrel files** (`index.ts` que solo reexporta): importa desde el archivo real.
- 🔒 **Clases de Tailwind en su forma canónica (v4)**, ordenadas, sin duplicados ni obsoletas (Oxlint + `eslint-plugin-better-tailwindcss`). Se corrigen solas con `pnpm lint:fix` y en el commit.
- 🔒 **Ortografía correcta en español e inglés** (cspell). Los términos técnicos válidos se añaden a `words` en `cspell.jsonc`, en orden alfabético.
- 🔒 **Markdown sin avisos** (markdownlint). Se corrige solo con `pnpm lint:fix` y en el commit.
- 🔒 **TypeScript estricto**: `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noImplicitOverride`.
- Nombres que expliquen la intención; evita abreviaturas.
- Comentarios solo para el **porqué**, no para el qué.
- **Controles interactivos de Client Components** (botones de envío, menús): desactivados hasta hidratar con `useHydrated()`; un clic antes de hidratar se pierde o hace un envío nativo.
- Server Components por defecto; `"use client"` solo cuando haga falta (estado, efectos, eventos).

### Listas de datos (paginación, búsqueda, filtros, orden)

**Los datos de una lista siempre se resuelven en el servidor.** Nunca se traen todos los registros para paginar, buscar, filtrar u ordenar en el navegador.

- **Paginación en la base de datos:** `limit`/`offset` (o cursor), y el `total` se cuenta en el servidor.
- **Búsqueda, filtros y orden en la consulta:** `WHERE` y `ORDER BY` en la base de datos, no `Array.filter`/`sort` en el cliente (tampoco con librerías de tablas en modo cliente).
- **El estado vive en la URL** (`?q=…&page=…&sort=…&order=…&status=…`): se puede compartir, el botón "atrás" funciona y la página se renderiza en el servidor.
- **Los parámetros de la URL se validan** con una función `parse…Query` con valores por defecto: página mínima 1, tamaño de página fijo o con un máximo, y **los campos de orden y filtro en una lista blanca** (nunca se pasa un nombre de columna de la URL directamente a la consulta).
- **URL canónica:** si llegan parámetros vacíos (un formulario GET los envía), por defecto o no permitidos, la página redirige a la URL limpia equivalente (`hasCanonicalParams` en `src/lib/search-params.ts`).
- **Orden estable:** además de la columna elegida, se ordena por `id`, para que ningún registro cambie de página entre peticiones.
- Ejemplo de referencia: `src/lib/admin/users.ts` (`parseUsersQuery`, `usersWhere`, `usersHref`), `src/lib/admin/users-query.ts` y `src/components/admin/users-list.tsx`.

### Carga: Cache Components, `loading.tsx` y Suspense

`cacheComponents` está activo: en el build se prerenderiza el **shell estático** de cada página y lo que depende de la petición (sesión, `searchParams`, base de datos, `new Date()`) llega en streaming dentro de un `<Suspense>`. Next.js falla en el build si algo dinámico queda fuera de un límite.

- 🔒 **Cada `page.tsx` tiene su `loading.tsx`** (lo comprueba `src/app/loading-convention.test.ts`). Excepciones, justificadas en ese test: páginas que nunca esperan nada (totalmente estáticas o que solo llaman a `notFound()`).
- **El skeleton es idéntico al diseño:** mismos componentes de shadcn (`Card`, `Table`, `Sidebar`…), mismos tamaños y espaciados; los textos estáticos (títulos, cabeceras de tabla) se renderizan de verdad y solo los datos llevan `Skeleton`. Si cambias el diseño de una página o componente, **actualiza su skeleton en el mismo cambio**.
- **Suspense granular:** lo estático fuera del límite (se ve al instante) y cada bloque con datos en su propio `<Suspense>` con su skeleton como `fallback`. Ejemplo: el título de usuarios es estático; la lista (sesión + URL) y la tabla (base de datos) tienen límites separados.
- **Listas: el `<Suspense>` de resultados lleva `key` con la consulta** (`key={JSON.stringify(query)}`), para que cada búsqueda, filtro, orden o página muestre el skeleton en lugar de las filas anteriores.
- **Un skeleton no enlaza a sitios equivocados:** si aún no conoce el estado (p. ej. la consulta de la URL), sus controles se muestran inertes.
- **Sesión fuera de los layouts:** no hagas `await` de la sesión en el nivel superior de un layout; muévelo a un componente dentro de un `<Suspense>` (ver `src/app/[locale]/admin/layout.tsx`). Un `notFound()`/`redirect()` dentro de un límite responde con estado 200 y la página de 404 (Next.js añade `noindex`).
- **Datos que cambian con el tiempo** en contenido estático: función con `"use cache"` + `cacheLife(...)` (ver el año en `src/components/site-footer.tsx`).
- Los skeletons viven junto a su componente (`users-skeletons.tsx`, `auth-skeletons.tsx`…) y reutilizan sus piezas (`UsersTableHeader`, `AdminSidebarFrame`, `AuthCard`).

### Qué testear (y qué no)

Un test se escribe solo si protege **lógica o configuración nuestra** que podría romperse sin que nadie lo note.

| ✅ Sí | ❌ No |
| --- | --- |
| Lógica propia: helpers, validaciones, condiciones (`parseLocale`, `pageAlternates`, `<Analytics />` solo con ID) | Librerías de terceros (`cn`, next-intl generando `/en/...`, `z.url()`) |
| Esquemas de `src/env.ts` con formato especial | Lo que TypeScript ya garantiza (p. ej. `Record<Locale, …>`) |
| Flujos de usuario en e2e: navegación, idioma, tema, 404 | Textos concretos traducidos (lo cubre la paridad de `messages/`) |
| Regresiones de bugs reales (fuente Geist, aviso de `<script>`) | Componentes puramente de presentación sin lógica |
| | Lo mismo en dos niveles: si hay unitario, no repetirlo en e2e |

- **e2e: pocos y completos.** Cada test abre una página (es lo más lento): agrupa en un mismo test los pasos de un flujo.
- **Unitarios junto al archivo** (`*.test.ts(x)`); `it.each` para variantes del mismo caso.

### Flujo de trabajo

1. **Librerías:** instálalas con su CLI oficial y en su **última versión estable** (`npm view <pkg> dist-tags`). Después, adapta los archivos que generen. Respeta `minimumReleaseAge` de pnpm (24 h): nunca añadas excepciones para instalar algo recién publicado.
2. **Tests con cada cambio que lo merezca** (ver "Qué testear"): unitarios junto al archivo y e2e en `e2e/` para flujos.
3. **Antes del commit:** `pnpm check` (el hook pre-push lo ejecuta de todos modos) (lint, typecheck, knip, jscpd y tests unitarios). Si cambian páginas o rutas, ejecuta también `pnpm e2e`.
4. **README:** actualiza el roadmap, la tabla de librerías, los scripts y la estructura.
5. **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`…) 🔒 commitlint. El tipo decide la versión (release-please): `fix` → parche, `feat` → menor, `!`/`BREAKING CHANGE` → mayor. No edites la versión de `package.json` ni `CHANGELOG.md` a mano.
