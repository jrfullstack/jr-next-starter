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
 *   1. Añádela a `.env.example` con su ficha (qué es, si es obligatoria,
 *      formato, dónde se obtiene y dónde se usa) y a tu `.env`.
 *   2. Declárala abajo en `server` o `client` con su esquema de Zod y un
 *      comentario con la misma ficha resumida.
 *   3. Si es de `client`, añádela también en `experimental__runtimeEnv`.
 *   4. Añade un test en `src/env.test.ts` si tiene un formato especial.
 *
 * `.env.example` es la documentación completa de cada variable.
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
    /**
     * DATABASE_URL · obligatoria
     * Conexión a PostgreSQL. La usan `src/lib/db.ts` (cliente de Prisma)
     * y `prisma.config.ts` (CLI de Prisma).
     * Formato: postgresql://usuario:contraseña@host:5432/base?schema=public
     */
    DATABASE_URL: z.url(),

    /**
     * BETTER_AUTH_SECRET · obligatoria
     * Clave con la que Better Auth firma y cifra sesiones y tokens.
     * Mínimo 32 caracteres aleatorios. Si cambia, se cierran todas las sesiones.
     * Generar: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     */
    BETTER_AUTH_SECRET: z.string().min(32),

    /**
     * SUPER_ADMIN_EMAILS · obligatoria
     * Emails de los desarrolladores, separados por comas. Una cuenta es
     * `superadmin` solo si su email está aquí Y está verificado; se recalcula
     * en cada inicio de sesión (quitar un email retira el rol).
     */
    SUPER_ADMIN_EMAILS: z
      .string()
      .transform((value) =>
        value
          .split(",")
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean),
      )
      .pipe(z.array(z.email()).min(1)),

    /**
     * GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET · opcionales (las dos o ninguna)
     * Credenciales OAuth de Google (Google Cloud → APIs y servicios →
     * Credenciales). Sin ellas, el acceso con Google no aparece.
     * URI de redirección autorizada: {NEXT_PUBLIC_APP_URL}/api/auth/callback/google
     */
    GOOGLE_CLIENT_ID: z
      .string()
      .endsWith(".apps.googleusercontent.com")
      .optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

    /**
     * RESEND_API_KEY · opcional
     * Clave de Resend para enviar emails. Sin ella, los emails se muestran en
     * la consola y en la bandeja de desarrollo (`/dev/outbox`).
     * Formato: re_xxxxxxxx (Resend → API Keys).
     */
    RESEND_API_KEY: z.string().startsWith("re_").optional(),

    /**
     * EMAIL_FROM · obligatoria si hay RESEND_API_KEY
     * Remitente de los emails, con un dominio verificado en Resend.
     * Formato: "Nombre <no-reply@tu-dominio.com>"
     */
    EMAIL_FROM: z.string().min(3).optional(),

    /**
     * EMAIL_DEV_OUTBOX · opcional · solo CI
     * Con "1", activa la bandeja de desarrollo también en un build de
     * producción. La usa el CI para que los e2e lean los enlaces de los emails.
     * Nunca en un despliegue real: expondría los enlaces de verificación.
     */
    EMAIL_DEV_OUTBOX: z.literal("1").optional(),

    /**
     * VERCEL · la define Vercel automáticamente (no la pongas en `.env`)
     * Vale "1" en los builds y servidores de Vercel. Activa Speed Insights
     * y Web Analytics de Vercel (`<VercelInsights />`); fuera de Vercel no
     * se cargan.
     */
    VERCEL: z.literal("1").optional(),
  },

  /**
   * CLIENTE: variables públicas que viajan al navegador.
   * Next.js obliga a que empiecen por `NEXT_PUBLIC_`, y T3-env lo comprueba.
   * ⚠️ Nunca pongas aquí claves secretas: cualquiera puede verlas.
   */
  client: {
    /**
     * NEXT_PUBLIC_APP_URL · obligatoria
     * URL pública del sitio, sin "/" final. Base de todas las URLs absolutas
     * del SEO: canonical, hreflang, sitemap.xml, robots.txt y Open Graph.
     * Local: http://localhost:3000 · Producción: https://tu-dominio.com
     */
    NEXT_PUBLIC_APP_URL: z.url(),

    /**
     * NEXT_PUBLIC_GA_MEASUREMENT_ID · opcional
     * ID de Google Analytics 4. Si tiene valor, `<Analytics />` (en el
     * layout) carga Google Analytics; si no existe, no se carga nada.
     * Formato: G-XXXXXXXXXX
     */
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z
      .string()
      .regex(/^G-[A-Z0-9]+$/, "Debe tener el formato G-XXXXXXXXXX")
      .optional(),
  },

  /**
   * COMPARTIDAS: disponibles en servidor y cliente sin prefijo.
   */
  shared: {
    /**
     * NODE_ENV · la define Next.js automáticamente
     * "development" con `pnpm dev`, "production" con `pnpm build`/`start`
     * y "test" en Vitest. No hace falta ponerla en `.env`.
     */
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Next.js sustituye las variables `NEXT_PUBLIC_*` en el código del cliente
   * al compilar, pero solo si aparecen escritas literalmente
   * (`process.env.NEXT_PUBLIC_X`). Por eso hay que listar aquí las de
   * `client`. Las de `server` se leen solas de `process.env`.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },

  /**
   * Reglas entre variables: las credenciales de Google van juntas (solo en el
   * servidor; en el navegador no existen).
   */
  createFinalSchema: (shape, isServer) =>
    z.object(shape).superRefine((values, ctx) => {
      if (!isServer) return;
      const hasId = values.GOOGLE_CLIENT_ID !== undefined;
      const hasSecret = values.GOOGLE_CLIENT_SECRET !== undefined;
      if (hasId === hasSecret) return;
      ctx.addIssue({
        code: "custom",
        path: [hasId ? "GOOGLE_CLIENT_SECRET" : "GOOGLE_CLIENT_ID"],
        message: "GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET van juntas",
      });
    }),

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
