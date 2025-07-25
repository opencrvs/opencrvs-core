-- Up Migration

ALTER TABLE event_actions
ADD COLUMN is_immediate_correction boolean;

-- Down Migration

ALTER TABLE event_actions
DROP COLUMN IF EXISTS is_immediate_correction;