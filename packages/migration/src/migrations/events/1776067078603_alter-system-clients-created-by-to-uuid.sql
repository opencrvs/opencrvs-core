-- Up Migration
ALTER TABLE system_clients ALTER COLUMN created_by TYPE UUID USING created_by::UUID;

-- Down Migration
ALTER TABLE system_clients ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;
