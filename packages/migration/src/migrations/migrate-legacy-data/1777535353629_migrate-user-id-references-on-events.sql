-- Up Migration
UPDATE event_actions
SET created_by = users.id::text
FROM users
WHERE event_actions.created_by = users.legacy_id;

UPDATE event_actions
SET created_by = system_clients.id::text
FROM system_clients
WHERE event_actions.created_by = system_clients.legacy_id;

ALTER TABLE event_actions
ALTER COLUMN created_by TYPE uuid
USING created_by::uuid;


-- Down Migration
ALTER TABLE event_actions
ALTER COLUMN created_by TYPE text
USING created_by::text;

UPDATE event_actions
SET created_by = users.legacy_id
FROM users
WHERE event_actions.created_by = users.id::text;

UPDATE event_actions
SET created_by = system_clients.legacy_id
FROM system_clients
WHERE event_actions.created_by = system_clients.id::text;
