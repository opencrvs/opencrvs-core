-- Up Migration
UPDATE event_actions
SET created_by = users.id::text
FROM users
WHERE event_actions.created_by = users.legacy_id;

UPDATE event_actions
SET created_by = system_clients.id::text
FROM system_clients
WHERE event_actions.created_by = system_clients.legacy_id;

UPDATE event_actions
SET assigned_to = users.id::text
FROM users
WHERE event_actions.assigned_to = users.legacy_id;

UPDATE event_actions
SET assigned_to = system_clients.id::text
FROM system_clients
WHERE event_actions.assigned_to = system_clients.legacy_id;

ALTER TABLE event_actions
ALTER COLUMN assigned_to TYPE uuid
USING NULLIF(assigned_to, '')::uuid;

-- Down Migration
ALTER TABLE event_actions
ALTER COLUMN assigned_to TYPE text
USING assigned_to::text;

UPDATE event_actions
SET created_by = users.legacy_id
FROM users
WHERE event_actions.created_by = users.id::text;

UPDATE event_actions
SET created_by = system_clients.legacy_id
FROM system_clients
WHERE event_actions.created_by = system_clients.id::text;

UPDATE event_actions
SET assigned_to = users.legacy_id
FROM users
WHERE event_actions.assigned_to = users.id::text;

UPDATE event_actions
SET assigned_to = system_clients.legacy_id
FROM system_clients
WHERE event_actions.assigned_to = system_clients.id::text;
