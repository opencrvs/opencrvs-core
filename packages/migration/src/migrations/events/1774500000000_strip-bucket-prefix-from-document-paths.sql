-- Up Migration

UPDATE event_actions
SET created_by_signature = regexp_replace(created_by_signature, '^/${S3_BUCKET}/', '')
WHERE created_by_signature LIKE '/${S3_BUCKET}/%';

UPDATE event_actions
SET declaration = regexp_replace(
        declaration::text,
        '"/${S3_BUCKET}/',
        '"',
        'g'
    )::jsonb,
    annotation = regexp_replace(
        annotation::text,
        '"/${S3_BUCKET}/',
        '"',
        'g'
    )::jsonb
WHERE declaration::text LIKE '%"/${S3_BUCKET}/%'
   OR annotation::text LIKE '%"/${S3_BUCKET}/%';

UPDATE event_action_drafts
SET created_by_signature = regexp_replace(created_by_signature, '^/${S3_BUCKET}/', '')
WHERE created_by_signature LIKE '/${S3_BUCKET}/%';

UPDATE event_action_drafts
SET declaration = regexp_replace(
        declaration::text,
        '"/${S3_BUCKET}/',
        '"',
        'g'
    )::jsonb,
    annotation = regexp_replace(
        annotation::text,
        '"/${S3_BUCKET}/',
        '"',
        'g'
    )::jsonb
WHERE declaration::text LIKE '%"/${S3_BUCKET}/%'
   OR annotation::text LIKE '%"/${S3_BUCKET}/%';

-- One-way: which paths had the bucket prefix is not recorded, so it cannot be added back.
