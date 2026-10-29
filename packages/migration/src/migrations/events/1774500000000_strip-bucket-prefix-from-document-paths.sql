-- Up Migration

UPDATE event_actions
SET created_by_signature = regexp_replace(created_by_signature, '^//', '')
WHERE created_by_signature LIKE '//%';

UPDATE event_actions
SET declaration = regexp_replace(
        declaration::text,
        '"//',
        '"',
        'g'
    )::jsonb,
    annotation = regexp_replace(
        annotation::text,
        '"//',
        '"',
        'g'
    )::jsonb
WHERE declaration::text LIKE '%"//%'
   OR annotation::text LIKE '%"//%';

UPDATE event_action_drafts
SET created_by_signature = regexp_replace(created_by_signature, '^//', '')
WHERE created_by_signature LIKE '//%';

UPDATE event_action_drafts
SET declaration = regexp_replace(
        declaration::text,
        '"//',
        '"',
        'g'
    )::jsonb,
    annotation = regexp_replace(
        annotation::text,
        '"//',
        '"',
        'g'
    )::jsonb
WHERE declaration::text LIKE '%"//%'
   OR annotation::text LIKE '%"//%';

-- One-way: which paths had the bucket prefix is not recorded, so it cannot be added back.
