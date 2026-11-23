-- Up Migration
CREATE TABLE IF NOT EXISTS system_clients(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  name TEXT NOT NULL,
  scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  sha_secret TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT system_clients_status_check CHECK (status IN ('active', 'disabled'))
);

CREATE UNIQUE INDEX IF NOT EXISTS system_clients_legacy_id_idx ON system_clients(legacy_id) WHERE legacy_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON system_clients TO ${EVENTS_DB_USER};

ALTER TABLE system_clients OWNER TO ${EVENTS_MIGRATION_USER};

-- Down Migration
DROP TABLE system_clients;