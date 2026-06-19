-- Up Migration
ALTER TABLE system_clients ALTER COLUMN created_by TYPE UUID USING created_by::UUID;
ALTER TABLE system_clients ADD CONSTRAINT fk_system_clients_created_by FOREIGN KEY (created_by) REFERENCES users(id);

-- Down Migration
ALTER TABLE system_clients DROP CONSTRAINT fk_system_clients_created_by;
ALTER TABLE system_clients ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;
