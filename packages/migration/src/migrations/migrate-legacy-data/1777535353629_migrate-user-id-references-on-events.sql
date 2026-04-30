-- Up Migration
UPDATE event_actions
SET created_by = users.id::text
FROM users
WHERE event_actions.created_by = users.legacy_id;

UPDATE event_actions
SET created_by = system_clients.id::text
FROM system_clients
WHERE event_actions.created_by = system_clients.legacy_id;


-- Down Migration
UPDATE event_actions
SET created_by = users.legacy_id
FROM users
WHERE event_actions.created_by = users.id::text;

UPDATE event_actions
SET created_by = system_clients.legacy_id
FROM system_clients
WHERE event_actions.created_by = system_clients.id::text;
