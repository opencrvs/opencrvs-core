-- Up Migration
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE,
  name text NOT NULL,
  parent_id uuid REFERENCES locations(id)
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  transaction_id text NOT NULL UNIQUE,
  tracking_id text NOT NULL UNIQUE,
  date_of_event_field_id text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE events IS 'Stores life events associated with individuals, identified by tracking_id. Each event includes a type, structured data payload, and a client-supplied transaction_id to ensure idempotency.';

CREATE TYPE action_status AS ENUM ('Requested', 'Accepted', 'Rejected');

CREATE TYPE action_type AS ENUM (
  'DELETE',
  'CREATE',
  'NOTIFY',
  'DECLARE',
  'VALIDATE',
  'REGISTER',
  'DETECT_DUPLICATE',
  'REJECT',
  'MARKED_AS_DUPLICATE',
  'ARCHIVE',
  'PRINT_CERTIFICATE',
  'REQUEST_CORRECTION',
  'REJECT_CORRECTION',
  'APPROVE_CORRECTION',
  'READ',
  'ASSIGN',
  'UNASSIGN'
);

CREATE TABLE event_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  event_id uuid NOT NULL REFERENCES events(id),
  action_type action_type NOT NULL,
  assigned_to text,
  declaration jsonb DEFAULT '{}' :: jsonb NOT NULL,
  annotation jsonb DEFAULT '{}' :: jsonb NOT NULL,
  status action_status NOT NULL,
  original_action_id uuid REFERENCES event_actions(id),
  created_by text NOT NULL,
  created_by_role text NOT NULL,
  created_at_location uuid NOT NULL REFERENCES locations(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (transaction_id, action_type),
  CHECK (
    (
      action_type = 'ASSIGN'
      AND assigned_to IS NOT NULL
    )
    OR (
      action_type = 'UNASSIGN'
      AND assigned_to IS NULL
    )
    OR (action_type NOT IN ('ASSIGN', 'UNASSIGN'))
  )
);

COMMENT ON TABLE event_actions IS 'Stores actions performed on life events, including client-supplied transaction_id for idempotency. The same transaction id can only create action of one type. Each action is linked to a specific event.';

COMMENT ON COLUMN event_actions.original_action_id IS 'References the original action if this is an asynchronous confirmation of it.';

CREATE TABLE event_action_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text UNIQUE NOT NULL,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  declaration jsonb DEFAULT '{}' :: jsonb NOT NULL,
  annotation jsonb DEFAULT '{}' :: jsonb NOT NULL,
  created_by text NOT NULL,
  created_by_role text NOT NULL,
  created_at_location uuid NOT NULL REFERENCES locations(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE event_action_drafts IS 'Stores user-specific drafts of event-related actions. Drafts use client-supplied transaction_id for idempotency. Declaration fields may be incomplete. Each draft is owned exclusively by created_by.';

-- Down Migration
DROP TABLE IF EXISTS event_action_drafts;

DROP TABLE IF EXISTS event_actions;

DROP TYPE IF EXISTS action_type;

DROP TYPE IF EXISTS action_status;

DROP TABLE IF EXISTS events;

DROP TABLE IF EXISTS locations;