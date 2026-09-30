# Plan: autenticación y panel de administración

> Estado: **aprobado**. Pasos 1 (Base), 2 (Emails y superadmin), 3 (Panel y usuarios), 4 (Sistema), 5 (Magic link), 6 (Google) y 7 (Cuenta → Seguridad y 2FA) hechos; el resto, pendiente.

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

## 14. Paso 5 en detalle: Magic link

> Estado: **hecho**. El login usa un solo formulario (un campo de email) con dos botones, para no duplicar el campo.

### Política (sin migración)

Nueva tarjeta **Magic link** en Sistema; los campos nuevos entran con su valor por defecto:

| Opción | Por defecto |
| --- | --- |
| Acceso (entrar con un enlace por email) | Activado |
| Registro automático (un email desconocido crea la cuenta) | Desactivado |
| Caducidad del enlace | 5 minutos (entre 1 y 60) |

- Better Auth lo aplica de forma nativa: `magicLink({ disableSignUp, expiresIn })` sale de la política, como email + contraseña.
- El hook rechaza `/sign-in/magic-link` y `/magic-link/verify` con el acceso desactivado (un enlace ya enviado deja de valer).
- Entrar con el enlace **verifica el email** (lo hace Better Auth): el enlace llegó a esa bandeja.

### Salvaguardas, ahora con dos métodos

- El magic link sirve a **cualquier cuenta** (solo hace falta el email), así que cuenta como método de **acceso y de recuperación** para todos.
- Consecuencia: con el magic link activo, ya **se puede desactivar el acceso con contraseña**. Los afectados entran con el enlace y siguen pudiendo fijar contraseña si se reactiva.
- El diálogo de confirmación cuenta los usuarios que se quedarían **sin ningún** método con la configuración nueva (no solo "los que usan este método").

### Interfaz

- **Login**: si el magic link está activo, debajo del formulario aparece "o" y un formulario "Enviar enlace de acceso" (solo email) que confirma "Revisa tu email". Si el acceso con contraseña está desactivado, solo se muestra el del enlace.
- **Registro**: si el registro con contraseña está cerrado pero el registro automático por enlace está abierto, `/sign-up` muestra el formulario del enlace con nombre + email.
- **Enlace caducado o usado**: vuelve al login con un aviso traducido para pedir otro.
- **Email** con React Email (es/en), como los de verificación y recuperación; en local, a la bandeja de desarrollo.

### Tests del magic link

- **Unitarios**: salvaguardas con dos métodos (la contraseña se puede desactivar si el enlace está activo, nunca los dos), conteo de afectados, rutas del hook.
- **E2E**: entrar con el enlace leído de la bandeja de desarrollo; el superadmin desactiva el acceso con contraseña → el login con contraseña lo rechaza con su mensaje y el enlace sigue funcionando → lo reactiva.

## 15. Paso 6 en detalle: Google

> Estado: **hecho**.

### Credenciales y capacidad

- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `src/env.ts` y `.env.example`: opcionales, pero **las dos o ninguna** (T3-env lo valida al arrancar).
- Sin credenciales, Google **no se registra** en Better Auth y cuenta como **no disponible** en todo: login, registro y salvaguardas. La tarjeta de Sistema lo muestra como "No configurado", con los interruptores desactivados y qué variables faltan.
- URL de redirección que hay que dar de alta en Google Cloud: `${NEXT_PUBLIC_APP_URL}/api/auth/callback/google`. El README explica cómo crear las credenciales.

### Política de Google (sin migración)

| Opción | Por defecto |
| --- | --- |
| Acceso con Google | Activado (solo si hay credenciales) |
| Registro con Google (primera vez con una cuenta nueva) | Activado |

- Better Auth lo aplica de forma nativa (`disableSignUp` del proveedor sale de la política).
- El hook rechaza `/sign-in/social` con Google y su callback (`/callback/google`) con el acceso desactivado; el callback vuelve al login con un aviso, como el magic link.

### Cuentas existentes

- Si alguien entra con Google con el email de una cuenta que ya existe, **se vinculan solas** solo si Google confirma el email **y** la cuenta local está verificada (lo que Better Auth hace por defecto). Si la cuenta local no está verificada, no se vincula: aviso para entrar con su método habitual y verificar el email.
- Vincular o desvincular Google desde la propia cuenta llega con *Cuenta → Seguridad* (paso 7).

### Salvaguardas con Google

- Google cuenta como método **vinculado** (cuenta `google` en la base de datos), no universal: desactivarlo solo afecta a quienes no tengan otro método activo. Como el magic link sirve a todos, con el enlace activo nadie se queda fuera.

### Interfaz de Google

- **Login y registro**: botón "Continuar con Google" (logo oficial de Google) encima del formulario, con "o" de separador, cuando está disponible y activo.
- **Errores** de Google (registro cerrado, cuenta sin vincular, cancelado por el usuario) → aviso traducido en el login.
- Skeletons actualizados.

### Tests del paso 6

- **Unitarios**: disponibilidad según credenciales (política efectiva), salvaguardas con un método vinculado, rutas del hook para Google, mensajes de error de OAuth, validación "las dos o ninguna" de las variables.
- **E2E**: sin credenciales en CI, el login no muestra Google y Sistema lo marca como no configurado. El flujo real con Google no se prueba contra Google (plan §11).

## 16. Paso 7 en detalle: Cuenta → Seguridad y 2FA

> Estado: **propuesto**, pendiente de aprobación.

Es el paso más grande y el más sensible, así que se entrega en **dos PR encadenados**:

### 7a. Cuenta → Seguridad (`/account/security`) · hecho

Página del usuario (cualquier rol), necesaria antes del 2FA porque es donde se configura:

| Bloque | Qué permite |
| --- | --- |
| Contraseña | Cambiarla (pide la actual y cierra las demás sesiones) o **crearla** si la cuenta no tiene (entró con magic link o Google) |
| Cuentas vinculadas | Vincular o desvincular Google; nunca se puede quitar el último método con el que entrar |
| Sesiones | Dispositivos con sesión abierta (navegador, IP, fecha); cerrar una o todas las demás |

- Enlace desde el menú de la cuenta; skeleton y Suspense como el resto.
- E2E: cambiar contraseña, crear contraseña tras entrar con magic link, cerrar otra sesión.

### 7b. 2FA · hecho

> Valores por defecto revisados al empezar el 7b: nivel **opcional** (obligatorio para admins y superadmins), código por email y recordar dispositivo **desactivados**, y el magic link pasa a **desactivado** por defecto.

Política (tarjeta **2FA** en Sistema, sin migración de la política):

| Opción | Por defecto |
| --- | --- |
| Nivel: desactivado / opcional / obligatorio | Desactivado |
| Código por email como segundo factor | Desactivado |
| Recordar dispositivo 30 días | Activado |

- **Factores**: app de autenticación (TOTP, con QR) + 10 códigos de respaldo; código por email solo si se activa.
- **Datos**: el plugin `twoFactor` de Better Auth añade su tabla y un campo al usuario (una migración).
- **Opcional**: cada usuario lo activa en Cuenta → Seguridad. **Obligatorio**: quien no lo tenga, al entrar solo puede ir a configurarlo.
- **Admins y superadmins**: con el 2FA en opcional u obligatorio, siempre deben tenerlo (plan §6).
- **Página `/two-factor`**: pide el código (o uno de respaldo / por email) y "recordar este dispositivo".

**Parte sensible: 2FA también con magic link y Google.** Better Auth solo lo exige al entrar con contraseña. Para los otros métodos, un *after hook* propio hace lo mismo que su plugin: si el usuario tiene 2FA y el dispositivo no es de confianza, anula la sesión recién creada, abre el reto de 2FA de Better Auth y redirige a `/two-factor`. Así la verificación la sigue haciendo Better Auth (límite de intentos, bloqueo de cuenta, dispositivos de confianza). Como depende de detalles internos del plugin, un **e2e completo por cada método** (contraseña, magic link) protege contra cambios al actualizar Better Auth; Google, con unitarios.

#### Salvaguardas y recuperación del 2FA

- Los códigos de respaldo se muestran una sola vez y se pueden regenerar (pide contraseña o código).
- Un superadmin no puede pasar a obligatorio si él mismo no tiene 2FA configurado.
- Un admin puede **quitar el 2FA a un usuario** que perdió su móvil (desde Usuarios, queda en el historial); nunca a un superadmin.

**Tests**: unitarios de la política y del hook; e2e generando el código TOTP en el propio test (con contraseña y con magic link, código de respaldo, dispositivo de confianza, nivel obligatorio).

## 17. Fuera de alcance

- Suplantar usuarios (fase posterior, solo `superadmin`, con aviso visible, salida y registro).
- Otros proveedores OAuth (GitHub, Microsoft, Apple…): la arquitectura los admite, se añadirán cuando hagan falta.
- Secciones de contenido del panel (posts, medios).
