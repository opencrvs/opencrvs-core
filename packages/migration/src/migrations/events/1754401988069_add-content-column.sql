-- Up Migration
ALTER TABLE event_actions ADD COLUMN content jsonb;

-- Down Migration
ALTER TABLE event_actions DROP COLUMN content;
