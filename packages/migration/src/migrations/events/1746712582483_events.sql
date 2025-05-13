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

COMMENT ON TABLE secure.events IS
  'Stores life events associated with individuals, identified by tracking_id. Each event includes a type, structured data payload, and a client-supplied transaction_id to ensure idempotency.';

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

COMMENT ON TABLE secure.event_actions IS
  'Stores actions performed on life events, including client-supplied transaction_id for idempotency. Each action is linked to a specific event.';

CREATE TABLE secure.event_action_drafts (
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

COMMENT ON TABLE secure.event_action_drafts IS
  'Stores user-specific drafts of event-related actions. Drafts use client-supplied transaction_id for idempotency. Declaration fields may be incomplete. Each draft is owned exclusively by created_by.';

-- Down Migration

DROP TABLE IF EXISTS secure.event_action_drafts;
DROP TABLE IF EXISTS secure.event_actions;
DROP TYPE IF EXISTS secure.action_status;
DROP TABLE IF EXISTS secure.events;