-- Up Migration
CREATE TABLE system_setup(
  id uuid PRIMARY KEY,
  token_hash  TEXT NOT NULL,
  token_salt  TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
);

COMMENT ON TABLE system_setup IS 'Single-row table tracking application setup state. Populated once during initial migration and sseed, and never modified except to mark setup as complete.';
GRANT SELECT, INSERT, UPDATE, DELETE ON system_setup TO ${EVENTS_DB_USER};

-- Down Migration
DROP TABLE system_setup;
