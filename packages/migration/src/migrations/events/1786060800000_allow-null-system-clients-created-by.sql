-- Up Migration
-- Allow NULL created_by so integrations registered from the country
-- configuration on startup can be stored. Those are created by a short-lived
-- system token rather than by a user, so there is no users(id) to reference.
ALTER TABLE system_clients ALTER COLUMN created_by DROP NOT NULL;

-- Down Migration
ALTER TABLE system_clients ALTER COLUMN created_by SET NOT NULL;
