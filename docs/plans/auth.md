# Plan: autenticación y panel de administración

> Estado: **aprobado**. Pasos 1 (Base), 2 (Emails y superadmin), 3 (Panel y usuarios) y 4 (Sistema) hechos; el resto, pendiente.

## 1. Objetivo

Autenticación completa con [Better Auth](https://www.better-auth.com) y un panel en `/admin` donde:

- el **desarrollador** (`superadmin`) configura, sin tocar código ni reiniciar, qué métodos de acceso están activos y con qué opciones;
- el **administrador de la web** (`admin`) gestiona los usuarios (y más adelante posts, medios, etc.).

## 2. Decisiones

| Tema | Decisión |
| --- | --- |
| Librería | Better Auth 1.7.x con Prisma sobre PostgreSQL. Auth.js está en mantenimiento y sus autores recomiendan Better Auth para proyectos nuevos |
| Métodos | Email + contraseña, magic link, Google (OAuth) y passkeys. Varios pueden estar activos a la vez |
| Credenciales OAuth | Variables de entorno. El panel solo activa proveedores que tengan credenciales |
| 2FA | Niveles desactivado / opcional / obligatorio. Factores: TOTP + códigos de respaldo; código por email disponible pero desactivado por defecto |
| Passkeys | Acceso sin contraseña. Entrar con passkey cuenta como acceso fuerte (equivale a 2FA) |
| Emails | Resend + React Email. En local, sin `RESEND_API_KEY`: consola + bandeja de desarrollo |
| Base de datos | `jr-next-starter-DEV`, recién creada. Se empieza a usar `prisma migrate` |
| Suplantar usuarios | Fuera de este plan. Fase posterior y solo para `superadmin` |

## 3. Roles y permisos

| Rol | Quién | Puede |
| --- | --- | --- |
| `superadmin` | El desarrollador | Todo lo de `admin` + sección **Sistema** (configuración de la app) + nombrar o quitar admins |
| `admin` | Administrador de la web | Sección **Usuarios**: listar, buscar, crear, bloquear/desbloquear, cerrar sesiones. No nombra admins |
| `user` | Usuarios registrados | Su cuenta y su seguridad |

Reglas:

- **`superadmin` no se concede, se calcula**: lo es quien tiene su email en `SUPER_ADMIN_EMAILS` **y** verificado. Se recalcula al iniciar sesión y en cada autorización; si un email sale de la variable, pierde el rol en su siguiente petición.
- Nadie puede asignar, modificar, bloquear ni suplantar a un `superadmin` desde la web, ni siquiera un `admin`. Se comprueba en el servidor.
- Los permisos se definen en un único archivo con el control de acceso de Better Auth (`createAccessControl`): `user`, `session`, `system` y, en el futuro, `post`, `media`…
- El menú del panel muestra las secciones según los permisos, pero la comprobación real está siempre en el servidor.

## 4. Arquitectura

1. **Capacidades (código):** se registran todos los métodos y plugins posibles (`emailAndPassword`, `magicLink`, `socialProviders`, `passkey`, `twoFactor`, `admin`). Un proveedor OAuth solo se registra si sus credenciales existen.
2. **Política (base de datos):** la configuración que decide el `superadmin`, validada con Zod y con caché corta que se invalida al guardar.
3. **Aplicación de la política:**
   - servidor: un *before hook* de Better Auth rechaza las peticiones de métodos desactivados, aunque se llame a la API directamente;
   - interfaz: login y registro muestran solo lo activo;
   - rutas: si el 2FA es obligatorio y falta configurarlo, se redirige a configurarlo.
4. **Protección de rutas:** `proxy.ts` comprueba la cookie de sesión (rápido) y cada layout protegido valida sesión, rol y 2FA pendiente en el servidor.

## 5. Sección Sistema (solo `superadmin`)

Cada método separa **registro** y **acceso**:

| Método | Opciones |
| --- | --- |
| General | Permitir registros nuevos |
| Email + contraseña | Registro · acceso · verificación de email obligatoria · longitud mínima de contraseña |
| Magic link | Registro automático (desactivado por defecto) · acceso · caducidad del enlace |
| Google | Registro · acceso (o "no configurado" si faltan credenciales) |
| Passkeys | Acceso · permitir que los usuarios registren passkeys |
| 2FA | Nivel · código por email · dispositivos de confianza (30 días) |

### Desactivar el acceso con un método

Desactivar el **registro** es inocuo. Desactivar el **acceso** puede dejar usuarios fuera, así que:

1. El panel muestra cuántos usuarios dependen **solo** de ese método y pide confirmación explícita.
2. Se bloquea sin excepción si dejaría a algún `superadmin` sin forma de entrar, o si no queda ningún método de recuperación activo.
3. Los afectados, al intentar entrar, reciben un mensaje claro y un camino de recuperación con su email verificado (fijar contraseña o magic link).
4. Sus sesiones abiertas siguen válidas hasta caducar, para que puedan vincular otro método en *Cuenta → Seguridad*.
5. Cada cambio queda registrado: quién, qué y cuándo.

## 6. 2FA

- Better Auth solo exige su 2FA en el acceso con credenciales. Con el nivel **obligatorio**, un hook propio lo exige también al entrar con Google o magic link. Es una parte sensible: se diseña y se prueba como flujo completo (e2e propio).
- Si el 2FA está activo, los `admin` y `superadmin` siempre deben usarlo.
- El acceso con passkey no pide un segundo factor adicional.

## 7. Emails

- Verificación de email, recuperar contraseña, magic link y código 2FA por email (si se activa).
- Plantillas con React Email, traducidas (es/en).
- En local, sin `RESEND_API_KEY`, los emails se muestran en consola y en `/dev/outbox` (solo en desarrollo), que también usan los tests e2e.

## 8. Páginas

| Ruta | Para qué |
| --- | --- |
| `/[locale]/sign-in`, `/sign-up` | Login y registro con los métodos activos |
| `/[locale]/forgot-password`, `/reset-password`, `/verify-email` | Recuperación y verificación |
| `/[locale]/two-factor` | Segundo factor al entrar |
| `/[locale]/dashboard` | Página protegida de ejemplo |
| `/[locale]/account/security` | Contraseña, 2FA, passkeys, sesiones y cuentas vinculadas del usuario |
| `/[locale]/admin/users` | Gestión de usuarios (`admin`) |
| `/[locale]/admin/system` | Configuración de la app (`superadmin`) |

## 9. Variables de entorno nuevas

| Variable | Obligatoria | Para qué |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Sí | Firma de sesiones y tokens |
| `SUPER_ADMIN_EMAILS` | Sí | Emails de los desarrolladores con rol `superadmin` (separados por comas) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | No | Activan el proveedor Google |
| `RESEND_API_KEY` | No | Sin ella, los emails van a consola y a la bandeja de desarrollo |
| `EMAIL_FROM` | Con Resend | Remitente de los emails |

La URL base y el dominio de las passkeys salen de `NEXT_PUBLIC_APP_URL`.

## 10. Seguridad

- Límite de intentos (integrado en Better Auth), más estricto en login y registro.
- Tokens de un solo uso con caducidad (verificación, reset, magic link).
- Métodos desactivados bloqueados en el servidor, no solo ocultos.
- Salvaguardas para no dejar a nadie fuera (ver sección 5).
- Registro de cambios de la sección Sistema.

## 11. Tests

Según el criterio de [`AGENTS.md`](../../AGENTS.md):

- **Unitarios:** hook de política, cálculo del rol `superadmin`, validación de la configuración, salvaguardas de dependencia.
- **E2E:** cada método nuevo pasa una prueba de **acceso, recuperación y permisos**. Passkeys con el autenticador virtual de Chromium; 2FA generando el código TOTP en el test; emails leídos de la bandeja de desarrollo. Google se cubre con unitarios (no se prueba contra Google real).

## 12. Entrega

Una rama por paso, revisada en local antes de subir:

1. **Base:** Better Auth + primera migración + email y contraseña (sin exigir verificación) + login, registro y logout + roles y permisos + `/dashboard`.
2. **Emails y superadmin:** Resend, React Email y bandeja de desarrollo + verificación + recuperar contraseña + rol `superadmin` calculado.
3. **Panel y Usuarios:** `/admin` con menú por permisos + gestión de usuarios.
4. **Sistema:** configuración en base de datos + hook de política + registro/acceso por separado + salvaguardas + opciones de email y contraseña.
5. **Magic link.**
6. **Google.**
7. **2FA.**
8. **Passkeys.**

Cada paso deja la app funcionando, con sus tests, y actualiza el README (roadmap, librerías, variables de entorno).

## 13. Paso 4 en detalle: Sistema

> Estado: **hecho**.

### Datos (una migración)

| Tabla | Contenido |
| --- | --- |
| `system_setting` | Una sola fila (`id = "global"`) con la política en JSON, `updatedAt` y `updatedById` |
| `system_audit_log` | Cada cambio: quién (id y email), antes, después y cuándo |

- La política se valida con un **esquema Zod con valores por defecto**: si la fila no existe o le faltan campos (métodos que se añadan en pasos futuros), se completan sin otra migración.
- Valores por defecto = comportamiento actual: registros abiertos, email + contraseña con registro y acceso, verificación obligatoria, contraseña mínima de 8.

### Aplicación de la política

- **Instancia de Better Auth construida a partir de la política** (`getAuth()`), memorizada por versión de la política. Así, registro cerrado, verificación obligatoria y longitud mínima los aplica Better Auth de forma nativa (`disableSignUp`, `requireEmailVerification`, `minPasswordLength`), sin reimplementar su lógica.
- **Before hook** para lo que Better Auth no separa: rechazar el **acceso** con un método desactivado (aunque se llame a la API directamente), con un código de error propio traducido.
- **Lectura con caché**: `"use cache"` + `cacheTag("auth-policy")` y vida corta; al guardar, `updateTag` la invalida al instante.
- **Interfaz**: el login y el registro reciben la política desde el servidor. Con los registros cerrados, `/sign-up` muestra un aviso y desaparecen los enlaces a registrarse; los formularios validan la longitud mínima configurada.

### Página `/admin/system` (solo `superadmin`, permiso `system`)

- Sección nueva en `src/lib/admin/sections.ts`; el menú la muestra solo al `superadmin`.
- Tarjetas **General** y **Email + contraseña** con las opciones de la sección 5. Los métodos de los pasos 5 a 8 añadirán su tarjeta.
- Guardado con **Server Action** (`requirePermission` de nuevo en el servidor, validación Zod, política y registro en una transacción).
- **Historial de cambios** debajo, con paginación en el servidor.
- `loading.tsx` con skeleton idéntico y Suspense, según `AGENTS.md`.

### Salvaguardas

- Desactivar el **acceso** de un método: el diálogo muestra cuántos usuarios dependen **solo** de él y pide confirmación.
- El servidor lo **rechaza** si deja a un `superadmin` sin forma de entrar o si no queda ningún método de recuperación. En este paso, email + contraseña es el único método, así que su acceso **no se puede desactivar** hasta que exista el magic link (paso 5). La salvaguarda queda programada y probada desde ya.
- Las sesiones abiertas siguen válidas.

### Tests

- **Unitarios**: esquema de la política (defaults, límites), salvaguardas (función pura: política nueva + usuarios afectados → errores), mapa ruta de la API → método/acción del hook.
- **E2E** (serie, restaurando la política al terminar): el `superadmin` cierra los registros → `/sign-up` muestra el aviso y la API lo rechaza → aparece en el historial → los vuelve a abrir; un `admin` recibe 404 en `/admin/system`. El `superadmin` de los e2e usa un email de `SUPER_ADMIN_EMAILS` (en CI, `dev@example.com`).

## 14. Fuera de alcance

- Suplantar usuarios (fase posterior, solo `superadmin`, con aviso visible, salida y registro).
- Otros proveedores OAuth (GitHub, Microsoft, Apple…): la arquitectura los admite, se añadirán cuando hagan falta.
- Secciones de contenido del panel (posts, medios).
