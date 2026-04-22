-- Up Migration
CREATE TABLE system_initialisation(
  id SERIAL PRIMARY KEY,
  hash  TEXT,
  salt  TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT completion_tokens_consistent CHECK (
    (completed_at IS NULL AND hash IS NOT NULL AND salt IS NOT NULL) OR
    (completed_at IS NOT NULL AND hash IS NULL AND salt IS NULL)
  )
);

COMMENT ON TABLE system_initialisation IS 'Single-row table tracking application initialisation state. Populated once during initial migration, and never modified except to mark initialisation as completed.';

GRANT SELECT, INSERT, UPDATE, DELETE ON system_initialisation TO ${EVENTS_DB_USER};

-- Down Migration
DROP TABLE system_initialisation;
