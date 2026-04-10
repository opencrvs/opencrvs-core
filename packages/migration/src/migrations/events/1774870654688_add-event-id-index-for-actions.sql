-- Up Migration
CREATE INDEX idx_event_actions_event_id ON app.event_actions (event_id);

-- Down Migration
DROP INDEX idx_event_actions_event_id;
