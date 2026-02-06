-- Up Migration
ALTER TABLE event_actions ALTER COLUMN created_by_role DROP NOT NULL;
ALTER TABLE event_action_drafts ALTER COLUMN created_by_role DROP NOT NULL;

-- Down Migration
UPDATE event_actions SET created_by_role = 'UNKNOWN' WHERE created_by_role IS NULL;
UPDATE event_action_drafts SET created_by_role = 'UNKNOWN' WHERE created_by_role IS NULL
ALTER TABLE event_actions ALTER COLUMN created_by_role SET NOT NULL;
ALTER TABLE event_action_drafts ALTER COLUMN created_by_role SET NOT NULL;
