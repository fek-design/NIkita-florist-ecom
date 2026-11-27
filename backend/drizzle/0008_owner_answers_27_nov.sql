-- The owner's answers of 27 Nov (docs/process/2026-11-27-owner-interview.md):
-- about 5 deliveries a day, orders by the day before (a cut-off of 00:00
-- leaves today never available), pickup 9–18 Monday to Saturday (days to
-- confirm, so the settings stay marked as placeholders). Only rows still
-- marked as placeholders change, so values she sets later are never undone.
UPDATE "shop_settings"
SET "daily_capacity" = 5,
    "same_day_cutoff" = '00:00',
    "opening_hours" = '{"mon": ["09:00", "18:00"], "tue": ["09:00", "18:00"], "wed": ["09:00", "18:00"], "thu": ["09:00", "18:00"], "fri": ["09:00", "18:00"], "sat": ["09:00", "18:00"]}'::jsonb
WHERE "is_placeholder" = true;
