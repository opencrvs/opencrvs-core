CREATE DATABASE opencrvs;
CREATE USER opencrvs_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE opencrvs TO opencrvs_user;

\c opencrvs

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO opencrvs_user;
CREATE SCHEMA secure AUTHORIZATION opencrvs_user;

CREATE TYPE secure.user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TABLE secure.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL,
  primary_office_id UUID NOT NULL,
  status secure.user_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
