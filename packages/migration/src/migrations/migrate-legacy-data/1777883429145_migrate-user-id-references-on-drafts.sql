-- Up Migration
UPDATE event_action_drafts
SET created_by = users.id::text
FROM users
WHERE event_action_drafts.created_by = users.legacy_id;

-- Down Migration
UPDATE event_action_drafts
SET created_by = users.legacy_id
FROM users
WHERE event_action_drafts.created_by = users.id::text;
