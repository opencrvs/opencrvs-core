-- Up Migration
CREATE TABLE administrative_areas (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  parent_id uuid REFERENCES administrative_areas(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  deleted_at timestamp with time zone,
  valid_until timestamp with time zone
);

GRANT SELECT, INSERT, UPDATE, DELETE ON administrative_areas TO ${EVENTS_DB_USER};

-- Down Migration
DROP TABLE IF EXISTS administrative_areas;
