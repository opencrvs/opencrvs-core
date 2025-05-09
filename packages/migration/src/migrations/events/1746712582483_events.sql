-- Up Migration


CREATE TABLE secure.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL UNIQUE,
  type text NOT NULL,
  data jsonb NOT NULL,
  tracking_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE secure.drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES secure.events(id),
  transaction_id text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  action jsonb NOT NULL
);

CREATE TYPE secure.action_status AS ENUM (
  'Requested',
  'Accepted',
  'Rejected'
);

CREATE TABLE secure.event_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text UNIQUE NOT NULL,
  event_id uuid NOT NULL REFERENCES secure.events(id),
  action_type text NOT NULL,
  declaration jsonb DEFAULT '{}'::jsonb NOT NULL,
  annotations jsonb DEFAULT '{}'::jsonb NOT NULL,
  status secure.action_status NOT NULL,
  created_by text NOT NULL,
  created_by_role text NOT NULL,
  created_at_location text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Down Migration

DROP TABLE secure.event_actions;
DROP TYPE secure.action_status;
DROP TABLE secure.events;
