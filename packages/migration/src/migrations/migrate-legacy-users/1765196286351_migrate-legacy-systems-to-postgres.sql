-- Up Migration
INSERT INTO system_clients(id, legacy_id, name, scopes, created_by, secret_hash, salt, sha_secret, status, created_at)
SELECT
  gen_random_uuid(),
  ls._id,
  ls.name,
  -- Migrate legacy scopes to new scopes and deduplicate:
  -- 'notification-api' -> 'record.notify'
  -- 'recordsearch' -> 'record.search'
  (
    SELECT jsonb_agg(DISTINCT replaced_scope)
    FROM (
      SELECT
        CASE elem::text
          WHEN '"notification-api"' THEN '"record.notify"'::jsonb
          WHEN '"recordsearch"' THEN '"record.search"'::jsonb
          ELSE elem
        END AS replaced_scope
      FROM jsonb_array_elements(ls.scope::jsonb) AS elem
    ) sub
  ),
  u.id,
  ls."secretHash",
  ls.salt,
  ls.sha_secret,
  CASE
    WHEN UPPER(ls.status) = 'ACTIVE' THEN 'active'
    ELSE 'disabled'
  END,
  to_timestamp(ls."creationDate" / 1000.0)
FROM legacy_systems ls
LEFT JOIN users u ON u.legacy_id = ls."createdBy";

-- Down Migration
DELETE FROM system_clients
WHERE legacy_id IN (SELECT _id FROM legacy_systems);
