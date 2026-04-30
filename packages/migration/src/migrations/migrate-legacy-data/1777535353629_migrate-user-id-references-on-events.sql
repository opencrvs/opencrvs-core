-- Up Migration
UPDATE event_actions
SET created_by = users.id::text
FROM users
WHERE event_actions.created_by = users.legacy_id;

-- Down Migration
UPDATE event_actions
SET created_by = users.legacy_id
FROM users
WHERE event_actions.created_by = users.id::text;
