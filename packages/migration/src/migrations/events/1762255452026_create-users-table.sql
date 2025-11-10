-- Up Migration
CREATE TYPE status_type AS ENUM(
  'pending',
  'active',
  'deactivated'
);

CREATE TABLE users(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE NULLS DISTINCT,
  firstname text,
  surname text,
  full_honorific_name text,
  role text NOT NULL,
  status status_type NOT NULL,
  email text UNIQUE NULLS DISTINCT,
  mobile text UNIQUE NULLS DISTINCT,
  signature_path text,
  profile_image_path text,
  office_id uuid NOT NULL REFERENCES locations(id),
  CONSTRAINT email_or_mobile_not_null CHECK (email IS NOT NULL OR mobile IS NOT NULL)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON users TO $ {EVENTS_DB_USER};

COMMENT ON COLUMN users.legacy_id IS 'References the user id from the legacy database.';

CREATE TABLE user_credentials(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  salt text NOT NULL,
  security_questions jsonb DEFAULT '{}' ::jsonb NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON user_credentials TO $ {EVENTS_DB_USER};

-- Down Migration
DROP TABLE IF EXISTS users;

