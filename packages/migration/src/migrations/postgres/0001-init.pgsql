CREATE DATABASE events;
CREATE USER events_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE events TO events_user;

\c events

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO events_user;

-- Create a new schema for the secure tables
CREATE SCHEMA secure AUTHORIZATION events_user;

CREATE TABLE secure.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL,
  primary_office_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  inactivated_at TIMESTAMPTZ
);

----------

CREATE TABLE secure.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- e.g., childbirth, diagnosis, etc.
  data JSONB NOT NULL, -- validated at app level
  tracking_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- @TODO: How are these versioned with form versions?
CREATE TABLE secure.event_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES secure.events(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- e.g., CREATE, UPDATE, REVIEW
  declaration JSONB NOT NULL DEFAULT '{}'::jsonb, -- validated in app
  status TEXT NOT NULL, -- e.g., Accepted, Rejected
  transaction_id TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES secure.users(id),
  created_at_location TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
