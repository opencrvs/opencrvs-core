-- Up Migration
CREATE TABLE system_initialisation(
  id SERIAL PRIMARY KEY,
  token_hash  TEXT NOT NULL,
  token_salt  TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE system_initialisation IS 'Single-row table tracking application initialisation state. Populated once during initial migration, and never modified except to mark initialisation as completed.';

GRANT SELECT, INSERT, UPDATE, DELETE ON system_initialisation TO ${EVENTS_DB_USER};

-- Down Migration
DROP TABLE system_initialisation;
