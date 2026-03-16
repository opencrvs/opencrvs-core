-- Up Migration

UPDATE event_actions
SET created_by_signature = regexp_replace(created_by_signature, '^/ocrvs/', '')
WHERE created_by_signature LIKE '/ocrvs/%';

UPDATE event_actions
SET declaration = regexp_replace(
        declaration::text,
        '"/ocrvs/',
        '"',
        'g'
    )::jsonb,
    annotation = regexp_replace(
        annotation::text,
        '"/ocrvs/',
        '"',
        'g'
    )::jsonb
WHERE declaration::text LIKE '%"/ocrvs/%'
   OR annotation::text LIKE '%"/ocrvs/%';

UPDATE event_action_drafts
SET created_by_signature = regexp_replace(created_by_signature, '^/ocrvs/', '')
WHERE created_by_signature LIKE '/ocrvs/%';

UPDATE event_action_drafts
SET declaration = regexp_replace(
        declaration::text,
        '"/ocrvs/',
        '"',
        'g'
    )::jsonb,
    annotation = regexp_replace(
        annotation::text,
        '"/ocrvs/',
        '"',
        'g'
    )::jsonb
WHERE declaration::text LIKE '%"/ocrvs/%'
   OR annotation::text LIKE '%"/ocrvs/%';

-- Down Migration
-- No-op: bucket prefix cannot be reliably restored as the bucket name is not known
