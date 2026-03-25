-- Up Migration
CREATE EXTENSION IF NOT EXISTS mongo_fdw;

CREATE SERVER IF NOT EXISTS hearth_mongo FOREIGN DATA WRAPPER mongo_fdw ${MONGO_SERVER_OPTIONS};

CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
  SERVER hearth_mongo ${MONGO_USER_MAPPING_OPTIONS};

-- Down Migration
DROP USER MAPPING IF EXISTS FOR CURRENT_USER SERVER hearth_mongo;
DROP SERVER IF EXISTS hearth_mongo CASCADE;
-- Note: extension not dropped — may still be used by migrate-legacy-users
