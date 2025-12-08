-- Up Migration
CREATE TABLE IF NOT EXISTS user_credentials(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  salt text NOT NULL,
  security_questions jsonb DEFAULT '{}' ::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON user_credentials TO ${EVENTS_DB_USER};

-- Down Migration
DROP TABLE user_credentials;
