ALTER TABLE services
  ADD COLUMN IF NOT EXISTS status_detail TEXT;
