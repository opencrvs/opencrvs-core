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

-- At this point the sibling origin actions have already had their `created_by`
-- rewritten from `legacy_id` to `users.id::text` / `system_clients.id::text` by
-- the UPDATE statements above. So we must match against `users.id::text` /
-- `system_clients.id::text`, NOT `legacy_id`.
UPDATE event_actions
SET created_by = origin_action.created_by
FROM event_actions origin_action, users
WHERE event_actions.created_by = ''
  AND origin_action.event_id = event_actions.event_id
  AND origin_action.action_type = 'DECLARE'
  AND origin_action.status = 'Accepted'
  AND users.id::text = origin_action.created_by;

UPDATE event_actions
SET created_by = origin_action.created_by
FROM event_actions origin_action, system_clients
WHERE event_actions.created_by = ''
  AND origin_action.event_id = event_actions.event_id
  AND origin_action.action_type = 'DECLARE'
  AND origin_action.status = 'Accepted'
  AND system_clients.id::text = origin_action.created_by;

UPDATE event_actions
SET created_by = origin_action.created_by
FROM event_actions origin_action, users
WHERE event_actions.created_by = ''
  AND origin_action.event_id = event_actions.event_id
  AND origin_action.action_type = 'NOTIFY'
  AND origin_action.status = 'Accepted'
  AND users.id::text = origin_action.created_by;

UPDATE event_actions
SET created_by = origin_action.created_by
FROM event_actions origin_action, system_clients
WHERE event_actions.created_by = ''
  AND origin_action.event_id = event_actions.event_id
  AND origin_action.action_type = 'NOTIFY'
  AND origin_action.status = 'Accepted'
  AND system_clients.id::text = origin_action.created_by;

UPDATE event_actions
SET created_by = origin_action.created_by
FROM event_actions origin_action, users
WHERE event_actions.created_by = ''
  AND origin_action.event_id = event_actions.event_id
  AND origin_action.custom_action_type = 'VALIDATE_DECLARATION'
  AND origin_action.status = 'Accepted'
  AND users.id::text = origin_action.created_by;

UPDATE event_actions
SET created_by = origin_action.created_by
FROM event_actions origin_action, system_clients
WHERE event_actions.created_by = ''
  AND origin_action.event_id = event_actions.event_id
  AND origin_action.custom_action_type = 'VALIDATE_DECLARATION'
  AND origin_action.status = 'Accepted'
  AND system_clients.id::text = origin_action.created_by;

ALTER TABLE event_actions
ALTER COLUMN created_by TYPE uuid
USING created_by::uuid;

ALTER TABLE event_actions
ALTER COLUMN assigned_to TYPE uuid
USING NULLIF(assigned_to, '')::uuid;

-- Down Migration
ALTER TABLE event_actions
ALTER COLUMN created_by TYPE text
USING created_by::text;

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
