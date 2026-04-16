-- Up Migration
DROP INDEX IF EXISTS app.idx_audit_log_transaction_id;
CREATE INDEX idx_audit_log_transaction_id ON app.audit_log(transaction_id);

-- Down Migration
DROP INDEX IF EXISTS app.idx_audit_log_transaction_id;
CREATE UNIQUE INDEX idx_audit_log_transaction_id ON app.audit_log(transaction_id);
