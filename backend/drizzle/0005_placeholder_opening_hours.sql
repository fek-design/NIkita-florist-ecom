-- Placeholder opening hours (DD-18, hi-fi v2 S4c): Mon–Fri 10–17, Sat 10–14.
-- Only where no hours were ever set and the settings are still placeholders,
-- so the owner's own hours are never overwritten.
UPDATE "shop_settings"
SET "opening_hours" = '{"mon": ["10:00", "17:00"], "tue": ["10:00", "17:00"], "wed": ["10:00", "17:00"], "thu": ["10:00", "17:00"], "fri": ["10:00", "17:00"], "sat": ["10:00", "14:00"]}'::jsonb
WHERE "opening_hours" = '{}'::jsonb AND "is_placeholder" = true;
