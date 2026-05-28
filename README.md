# InmoMatch

MVP profesional de una plataforma SaaS inmobiliaria multiempresa para matching colaborativo entre demandas reales y propiedades. Está construido con Next.js 15 App Router, TypeScript, Tailwind CSS, componentes estilo shadcn/ui, Supabase Auth, Supabase Storage, PostgreSQL y Prisma ORM.

## Funcionalidades incluidas

- Auth real con Supabase: login, registro, logout, recuperación de contraseña y sesiones persistentes.
- Roles: `SUPER_ADMIN`, `ADMIN_REAL_ESTATE`, `AGENT`.
- Multi tenant por `real_estate_id` con controles de permisos en Server Actions.
- CRUD real de propiedades y clientes.
- Bloqueo de duplicados por dirección normalizada y nomenclatura catastral por inmobiliaria.
- Motor real de matching en `src/lib/matching-engine.ts`.
- Reglas excluyentes: presupuesto, tipo de bien, zona, financiación, permuta con tolerancia +-20%, apta crédito, dormitorios mínimos, aptitud de suelo para campos y estado activo.
- Penalizaciones por diferencias: servicios, conectividad, tipo de barrio, acceso, construcción, estado general, pileta, cochera, baños y superficies.
- Matches persistidos en PostgreSQL con diferencias, exclusiones, score y estados.
- Flujo de aceptación, compromiso de partición y apertura de contacto registrada.
- Limpieza de stock por rechazos 90%+ con estado `IN_REVIEW`.
- Upload real de múltiples imágenes a Supabase Storage con preview, validación de formato/tamaño, registro en DB y eliminación real.
- Panel Super Admin para validar matrículas, extender membresía 30 días, revisar stock y ver usuarios.
- Dashboards operativos para inmobiliarias.

## Instalación

```bash
npm install
cp .env.example .env.local
npm run prisma:generate
npm run dev
```

Abrí `http://localhost:3000`.

## Variables de entorno

Copiá `.env.example` a `.env.local` y configurá:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

No subas `.env.local` al repositorio.

## Supabase setup

1. Crear un proyecto en Supabase.
2. Copiar `Project URL`, `anon public key` y `service_role key`.
3. En Authentication, activar Email/Password.
4. En Storage, crear un bucket público llamado `property-images`.
5. Configurar URLs de redirección:

```text
http://localhost:3000/**
https://tu-dominio.vercel.app/**
```

6. Ejecutar las políticas preparadas en `supabase/rls.sql` cuando actives RLS en producción.

## Prisma y base de datos

Generar cliente:

```bash
npm run prisma:generate
```

Crear migración local:

```bash
npm run prisma:migrate
```

Deploy de migraciones:

```bash
npm run prisma:deploy
```

Seed demo:

```bash
npm run db:seed
```

El seed crea una inmobiliaria demo, un admin demo, una propiedad, un cliente y un match inicial. Para iniciar sesión con Supabase, creá también ese usuario en Supabase Auth o registrá uno desde la app.

## Deploy en Vercel

1. Subir el proyecto a GitHub.
2. Importar en Vercel.
3. Configurar las mismas variables de entorno.
4. Build command:

```bash
npm run build
```

5. En Supabase Auth, agregar el dominio de Vercel como redirect URL.
6. Ejecutar migraciones contra Supabase:

```bash
npm run prisma:deploy
```

## Estructura

```text
src/app/          Rutas App Router y Server Components
src/actions/      Server Actions seguras
src/components/   UI, formularios y shell
src/hooks/        Hooks compartidos
src/lib/          Prisma, Supabase, auth, matching engine
src/services/     Servicios de dominio
src/validators/   Esquemas Zod
prisma/           Schema y seed
supabase/         SQL auxiliar para RLS
```

## Verificación

```bash
npm run lint
npm run build
```

Ambos comandos pasan correctamente en esta entrega.
