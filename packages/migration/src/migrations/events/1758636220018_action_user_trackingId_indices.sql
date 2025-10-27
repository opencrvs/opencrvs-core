-- Up Migration
CREATE INDEX idx_action_created_by ON app.event_actions(created_by);
CREATE INDEX idx_event_tracking_id ON app.events(tracking_id);

-- Down Migration
DROP INDEX idx_action_created_by;
DROP INDEX idx_event_tracking_id;