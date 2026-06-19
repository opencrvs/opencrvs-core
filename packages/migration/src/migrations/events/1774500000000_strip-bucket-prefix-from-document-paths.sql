-- Up Migration

UPDATE event_actions
SET created_by_signature = regexp_replace(created_by_signature, '^/${MINIO_BUCKET}/', '')
WHERE created_by_signature LIKE '/${MINIO_BUCKET}/%';

UPDATE event_actions
SET declaration = regexp_replace(
        declaration::text,
        '"/${MINIO_BUCKET}/',
        '"',
        'g'
    )::jsonb,
    annotation = regexp_replace(
        annotation::text,
        '"/${MINIO_BUCKET}/',
        '"',
        'g'
    )::jsonb
WHERE declaration::text LIKE '%"/${MINIO_BUCKET}/%'
   OR annotation::text LIKE '%"/${MINIO_BUCKET}/%';

UPDATE event_action_drafts
SET created_by_signature = regexp_replace(created_by_signature, '^/${MINIO_BUCKET}/', '')
WHERE created_by_signature LIKE '/${MINIO_BUCKET}/%';

UPDATE event_action_drafts
SET declaration = regexp_replace(
        declaration::text,
        '"/${MINIO_BUCKET}/',
        '"',
        'g'
    )::jsonb,
    annotation = regexp_replace(
        annotation::text,
        '"/${MINIO_BUCKET}/',
        '"',
        'g'
    )::jsonb
WHERE declaration::text LIKE '%"/${MINIO_BUCKET}/%'
   OR annotation::text LIKE '%"/${MINIO_BUCKET}/%';

-- Down Migration
-- No-op