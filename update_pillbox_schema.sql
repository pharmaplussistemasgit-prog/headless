-- Run this in the Supabase SQL Editor to update the table structure

ALTER TABLE pillbox_reminders ADD COLUMN IF NOT EXISTS current_stock int;
ALTER TABLE pillbox_reminders ADD COLUMN IF NOT EXISTS stock_alert_threshold int;
ALTER TABLE pillbox_reminders ADD COLUMN IF NOT EXISTS manage_inventory boolean default false;
ALTER TABLE pillbox_reminders ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE pillbox_reminders ADD COLUMN IF NOT EXISTS dose_quantity int default 1;
ALTER TABLE pillbox_reminders ADD COLUMN IF NOT EXISTS duration_days int;

-- Force schema cache reload just in case
NOTIFY pgrst, 'reload config';
