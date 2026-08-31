-- Up Migration
-- Allow NULL created_by_role to support new-style integrations (e.g. MOSIP)
-- that have no system role by design.
ALTER TABLE event_actions ALTER COLUMN created_by_role DROP NOT NULL;
ALTER TABLE event_action_drafts ALTER COLUMN created_by_role DROP NOT NULL;

-- Down Migration
ALTER TABLE event_actions ALTER COLUMN created_by_role SET NOT NULL;
ALTER TABLE event_action_drafts ALTER COLUMN created_by_role SET NOT NULL;
