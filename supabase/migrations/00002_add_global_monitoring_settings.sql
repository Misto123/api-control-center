-- Add global monitoring settings
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS check_interval_seconds INTEGER DEFAULT 3600;
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS depletion_warning_days INTEGER DEFAULT 10;
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS low_credits_threshold INTEGER DEFAULT 20;
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS critical_credits_threshold INTEGER DEFAULT 10;

-- Insert default row if not exists
INSERT INTO global_settings (id, check_interval_seconds, depletion_warning_days, low_credits_threshold, critical_credits_threshold)
VALUES ('default', 3600, 10, 20, 10)
ON CONFLICT (id) DO NOTHING;
