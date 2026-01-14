-- Create table for Reminders (Pastillero)
create table public.reminders (
  id uuid not null default gen_random_uuid (),
  user_id text not null, -- WordPress User ID (string)
  medication_name text not null,
  dosage text null,
  frequency text null,
  dates jsonb null, -- Stores array of dates/times
  product_image text null,
  active boolean null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null default now(),
  constraint reminders_pkey primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.reminders enable row level security;

-- Policy: Allow Service Role (Backend) full access
-- Note: User's won't access this directly, so we don't need 'anon' policies for now.
-- But if we wanted to allow direct access later, we would add policies here.
create policy "Service Role has full access" on public.reminders
  as permissive for all
  to service_role
  using (true)
  with check (true);

-- Index for faster lookups by user_id
create index idx_reminders_user_id on public.reminders (user_id);
