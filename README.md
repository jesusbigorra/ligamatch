# LigaMatch

Plataforma integral de fútbol amateur. Next.js (App Router) + Neon Auth (login con Google) + Neon (Postgres).

## Qué incluye esta fase

- Jornadas con tabla de posiciones, sedes, premios y catálogo público de patrocinios, leídos desde Neon.
- Inscripción de jugadores con Google. Una cédula equivale a un perfil (índice único en la base de datos).
- Panel de administración: el administrador verifica o rechaza perfiles. Teléfono y cédula solo se leen en el servidor y solo los ve el administrador.
- Los pagos de premios y patrocinios no se procesan en la plataforma.

Quedan para la siguiente fase: programar partidos y premios desde el admin, gestión de espacios publicitarios y solicitudes de empresas, foto de perfil propia (necesita almacenamiento), verificación de teléfono por código (el SMS tiene costo) y la rotación de patrocinadores.

## Puesta en marcha

1. **Neon.** Crea un proyecto en neon.com (plan gratuito) y copia la cadena de conexión.
2. **Neon Auth.** En el proyecto: Auth > Enable. Deja Google como único método (credenciales compartidas en pruebas; para producción, credenciales propias de Google Cloud). Copia la Auth URL.
3. **Variables.** Copia `.env.example` a `.env.local` y completa `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` y `ADMIN_EMAILS` (correo de Google del administrador).
4. **Base de datos y arranque.**

   ```bash
   npm install
   npm run db:init
   npm run db:seed
   npm run dev
   ```

5. **Vercel.** Importa el repositorio de GitHub, agrega las mismas variables y añade el dominio de Vercel como dominio de confianza en Neon Auth y despliega.

## Notas

- El plan Hobby de Vercel es para uso personal y no comercial. Sirve para probar. Antes de cobrar a patrocinadores hay que pasar a un plan que permita uso comercial.
- Las páginas que leen la base de datos usan `force-dynamic`, así que la compilación no necesita conexión a Neon.
- Para añadir otro administrador, agrega su correo a `ADMIN_EMAILS` (separados por coma).
