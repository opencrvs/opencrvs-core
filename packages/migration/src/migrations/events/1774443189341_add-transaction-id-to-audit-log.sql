-- Up Migration
ALTER TABLE app.audit_log
  ADD COLUMN transaction_id text NOT NULL DEFAULT gen_random_uuid()::text;

COMMENT ON COLUMN app.audit_log.transaction_id IS 'Client-supplied idempotency key. Existing rows are backfilled with random UUIDs.';

CREATE UNIQUE INDEX idx_audit_log_transaction_id ON app.audit_log(transaction_id);

-- Down Migration
DROP INDEX IF EXISTS idx_audit_log_transaction_id;
ALTER TABLE app.audit_log DROP COLUMN IF EXISTS transaction_id;