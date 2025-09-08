-- Up Migration
CREATE TYPE location_type AS ENUM ('HEALTH_FACILITY', 'CRVS_OFFICE', 'ADMIN_STRUCTURE');
ALTER TABLE locations ADD COLUMN location_type location_type;

-- Down Migration
ALTER TABLE locations DROP COLUMN location_type;
DROP TYPE location_type;
