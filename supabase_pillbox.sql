-- Drop table to recreate with correct structure if it's empty/testing
-- drop table if exists pillbox_reminders; 

create table if not exists pillbox_reminders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_email text,
  
  -- Contact Info
  patient_name text not null,
  phone_number text not null, -- Renamed from phone to phone_number
  
  -- Product Info
  medication_name text not null,
  start_date date default CURRENT_DATE,
  first_dose_time time not null,
  frequency_hours int, -- e.g. 8 for "Every 8 hours"
  
  -- Inventory & Duration
  dose_quantity int default 1,
  duration_days int,
  
  manage_inventory boolean default false,
  current_stock int,
  stock_alert_threshold int,
  
  is_active boolean default true
);

-- RLS
alter table pillbox_reminders enable row level security;
