-- Up Migration
CREATE INDEX idx_event_actions_event_id ON app.event_actions (event_id);
CREATE INDEX idx_event_actions_original_action_id ON app.event_actions (original_action_id);

-- Down Migration
DROP INDEX IF EXISTS idx_event_actions_event_id;
DROP INDEX IF EXISTS idx_event_actions_original_action_id;
