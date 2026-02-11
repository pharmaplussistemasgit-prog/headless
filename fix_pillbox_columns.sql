-- Fix Column Names (Renaming to match code)
ALTER TABLE pillbox_reminders RENAME COLUMN phone TO phone_number;
ALTER TABLE pillbox_reminders RENAME COLUMN dosage_time TO first_dose_time;

-- Add Missing Columns
ALTER TABLE pillbox_reminders ADD COLUMN IF NOT EXISTS start_date date DEFAULT CURRENT_DATE;
ALTER TABLE pillbox_reminders ADD COLUMN IF NOT EXISTS frequency_hours int;

-- Force schema cache reload
NOTIFY pgrst, 'reload config';
