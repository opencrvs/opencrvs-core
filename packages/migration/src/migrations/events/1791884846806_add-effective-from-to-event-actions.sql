-- Up Migration
ALTER TABLE event_actions ADD COLUMN IF NOT EXISTS effective_from text;

ALTER TABLE event_actions DROP CONSTRAINT IF EXISTS event_actions_effective_from_check;
ALTER TABLE event_actions
  ADD CONSTRAINT event_actions_effective_from_check
  CHECK (effective_from IS NULL OR effective_from ~ '^\d{4}-\d{2}-\d{2}$');

COMMENT ON COLUMN event_actions.effective_from IS 'effectiveFrom of the action configuration version used. NULL: the version without effectiveFrom, or recorded before versioning.';

-- Down Migration
ALTER TABLE event_actions DROP CONSTRAINT IF EXISTS event_actions_effective_from_check;
ALTER TABLE event_actions DROP COLUMN IF EXISTS effective_from;
