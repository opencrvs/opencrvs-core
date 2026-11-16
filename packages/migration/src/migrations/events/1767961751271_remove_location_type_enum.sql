-- Up Migration
DROP TYPE location_type;

-- Down Migration
CREATE TYPE location_type AS ENUM ('HEALTH_FACILITY', 'CRVS_OFFICE', 'ADMIN_STRUCTURE');
