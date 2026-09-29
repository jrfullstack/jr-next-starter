/**
 * ============================================================================
 *  T3-env: variables de entorno tipadas y validadas
 * ============================================================================
 *
 * ¿QUÉ PROBLEMA RESUELVE?
 *   Normalmente leemos variables con `process.env.ALGO`. Eso tiene 3 problemas:
 *     1. Su tipo es `string | undefined`: TypeScript no sabe si existe.
 *     2. Si falta o está mal escrita, no te enteras hasta que la app falla
 *        en producción (por ejemplo, al conectar a la base de datos).
 *     3. Es fácil filtrar un secreto al navegador por accidente.
 *
 * ¿CÓMO LO RESUELVE?
 *   Definimos aquí, con esquemas de Zod, qué variables necesita la app.
 *   Al arrancar (`pnpm dev`) o compilar (`pnpm build`), T3-env las valida:
 *   si falta alguna o tiene un formato incorrecto, se detiene con un
 *   error claro que dice cuál es y por qué.
 *
 * ¿CÓMO SE USA?
 *   En lugar de `process.env.DATABASE_URL`, importa el objeto `env`:
 *
 *     import { env } from "@/env";
 *     env.DATABASE_URL; // tipo `string`, garantizado que existe y es una URL
 *
 * ¿CÓMO AÑADO UNA VARIABLE NUEVA?
 *   1. Añádela a tu `.env` (y a `.env.example` con un valor de ejemplo).
 *   2. Declárala abajo en `server` o `client` con su esquema de Zod.
 *   3. Si es de `client`, añádela también en `experimental__runtimeEnv`.
 *
 * Documentación: https://env.t3.gg/docs/nextjs
 */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * SERVIDOR: variables secretas, solo disponibles en código de servidor
   * (Server Components, Server Actions, Route Handlers, `src/lib/db.ts`…).
   * Si intentas leer una de estas en un Client Component ("use client"),
   * T3-env lanza un error en vez de filtrar el secreto al navegador.
   */
  server: {
    // Conexión a PostgreSQL que usa Prisma. Debe ser una URL válida.
    DATABASE_URL: z.url(),
  },

  /**
   * CLIENTE: variables públicas que viajan al navegador.
   * Next.js obliga a que empiecen por `NEXT_PUBLIC_`, y T3-env lo comprueba.
   * ⚠️ Nunca pongas aquí claves secretas: cualquiera puede verlas.
   *
   * Ejemplo:
   *   NEXT_PUBLIC_APP_URL: z.url(),
   */
  client: {},

  /**
   * COMPARTIDAS: disponibles en servidor y cliente sin prefijo.
   */
  shared: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Next.js sustituye las variables `NEXT_PUBLIC_*` en el código del cliente
   * al compilar, pero solo si aparecen escritas literalmente
   * (`process.env.NEXT_PUBLIC_X`). Por eso hay que listar aquí las de
   * `client`. Las de `server` se leen solas de `process.env`.
   *
   * Ejemplo:
   *   NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },

  /**
   * Trata `VARIABLE=` (vacía) como si no existiera. Así una variable vacía
   * en `.env` falla la validación en lugar de colarse como "".
   */
  emptyStringAsUndefined: true,

  /**
   * Permite saltar la validación con `SKIP_ENV_VALIDATION=1`. Es útil en
   * CI o en builds de Docker donde las variables reales no están disponibles
   * (por ejemplo, para correr solo el lint). No lo uses en producción.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
