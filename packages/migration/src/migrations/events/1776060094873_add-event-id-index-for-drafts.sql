-- Up Migration
CREATE INDEX idx_drafts_event_id ON app.event_action_drafts (event_id);

-- Down Migration
DROP INDEX IF EXISTS idx_drafts_event_id;
