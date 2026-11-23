-- Up Migration
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL,
  client_type user_type NOT NULL,
  operation text NOT NULL,
  request_data jsonb,
  response_summary jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

GRANT SELECT, INSERT ON audit_log TO ${EVENTS_DB_USER};

COMMENT ON TABLE audit_log IS 'Stores an audit trail of operations performed by users and system integrations, including request data and a curated response summary.';
COMMENT ON COLUMN audit_log.client_id IS 'ID of the integration client or user making the request.';
COMMENT ON COLUMN audit_log.client_type IS 'Whether the client is a human user or a system integration.';
COMMENT ON COLUMN audit_log.operation IS 'The operation that was performed.';
COMMENT ON COLUMN audit_log.request_data IS 'JSON blob of the request payload.';
COMMENT ON COLUMN audit_log.response_summary IS 'Per-endpoint curated summary of the response (e.g. search terms used and count + IDs of results returned). Not the raw response payload.';

CREATE INDEX idx_audit_log_client_id ON app.audit_log(client_id);
CREATE INDEX idx_audit_log_operation ON app.audit_log(operation);
CREATE INDEX idx_audit_log_created_at ON app.audit_log(created_at);

-- Down Migration
DROP INDEX IF EXISTS idx_audit_log_client_id;
DROP INDEX IF EXISTS idx_audit_log_operation;
DROP INDEX IF EXISTS idx_audit_log_created_at;
DROP TABLE IF EXISTS audit_log;
