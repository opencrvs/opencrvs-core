-- Up Migration

UPDATE system_clients
SET scopes = COALESCE((
  SELECT jsonb_agg(DISTINCT to_jsonb(mapped_scope))
  FROM (
    SELECT
      CASE elem #>> '{}'
        WHEN 'recordsearch' THEN 'type=record.search'
        WHEN 'notification-api' THEN 'type=record.notify'
        WHEN 'nationalid' THEN NULL
        WHEN 'webhook' THEN NULL
        WHEN 'demo' THEN NULL
        ELSE elem #>> '{}'
      END AS mapped_scope
    FROM jsonb_array_elements(scopes) AS elem
  ) sub
  WHERE mapped_scope IS NOT NULL
), '[]'::jsonb);

-- Down Migration
-- Cannot be reversed safely
