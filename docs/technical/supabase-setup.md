# Instrucciones de Configuración Supabase ⚡

Para completar la integración del "Silent Sync", ejecuta este script en el **SQL Editor** de tu proyecto en Supabase:

```sql
-- 1. Crear Tabla de Recordatorios
create table public.reminders (
  id uuid not null default gen_random_uuid (),
  user_id text not null, -- ID del usuario de WordPress
  medication_name text not null,
  dosage text null,
  frequency text null,
  dates jsonb null,
  product_image text null,
  active boolean null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null default now(),
  constraint reminders_pkey primary key (id)
);

-- 2. Habilitar Seguridad (RLS)
alter table public.reminders enable row level security;

-- 3. Crear Política de Servicio
-- Permite que tu Backend (Next.js) lea y escriba todo usando la SERVICE_ROLE_KEY
create policy "Service Role has full access" on public.reminders
  as permissive for all
  to service_role
  using (true)
  with check (true);

-- 4. Crear Índice para Búsquedas Rápidas
create index idx_reminders_user_id on public.reminders (user_id);
```

## Verificación
Una vez ejecutado, verás la tabla `reminders` en tu "Table Editor".
El sistema comenzará a llenar datos automáticamente cuando los usuarios inicien sesión.
