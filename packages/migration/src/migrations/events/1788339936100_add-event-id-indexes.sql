-- Up Migration
-- idx_event_actions_event_id serves reads and the delete in deleteEventById;
-- idx_event_actions_original_action_id serves the self-referencing foreign key
-- check that same delete triggers, which dominated its cost.
--
-- 2.0 already creates all three, in migrations of its own. IF NOT EXISTS keeps
-- this one a no-op when 1.9 is merged forward onto a database that has run those.
CREATE INDEX IF NOT EXISTS idx_event_actions_event_id ON app.event_actions (event_id);
CREATE INDEX IF NOT EXISTS idx_event_actions_original_action_id ON app.event_actions (original_action_id);
-- idx_drafts_event_id is for parity only: the UNIQUE (event_id, created_by)
-- constraint on event_action_drafts already indexes event_id as its leading column.
CREATE INDEX IF NOT EXISTS idx_drafts_event_id ON app.event_action_drafts (event_id);

-- Down Migration
DROP INDEX IF EXISTS idx_event_actions_event_id;
DROP INDEX IF EXISTS idx_event_actions_original_action_id;
DROP INDEX IF EXISTS idx_drafts_event_id;
