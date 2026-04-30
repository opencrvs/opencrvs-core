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
SET created_by = users.id::text
FROM event_actions accepted_declare_actions, users
WHERE event_actions.created_by = ''
  AND accepted_declare_actions.event_id = event_actions.event_id
  AND accepted_declare_actions.action_type = 'DECLARE'
  AND accepted_declare_actions.status = 'Accepted'
  AND users.legacy_id = accepted_declare_actions.created_by;

UPDATE event_actions
SET created_by = system_clients.id::text
FROM event_actions accepted_declare_actions, system_clients
WHERE event_actions.created_by = ''
  AND accepted_declare_actions.event_id = event_actions.event_id
  AND accepted_declare_actions.action_type = 'DECLARE'
  AND accepted_declare_actions.status = 'Accepted'
  AND system_clients.legacy_id = accepted_declare_actions.created_by;

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
