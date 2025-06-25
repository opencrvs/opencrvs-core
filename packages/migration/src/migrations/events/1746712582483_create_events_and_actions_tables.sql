-- Up Migration
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE,
  name text NOT NULL,
  parent_id uuid REFERENCES locations(id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON locations TO events_app;

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  transaction_id text NOT NULL,
  tracking_id text NOT NULL UNIQUE,
  created_at TIMESTAMPTZ(3) DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ(3) DEFAULT now() NOT NULL,
  UNIQUE (transaction_id, event_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON events TO events_app;

COMMENT ON TABLE events IS 'Stores life events associated with individuals, identified by tracking_id. Each event includes a type, structured data payload, and a client-supplied transaction_id to ensure idempotency.';

CREATE TYPE action_status AS ENUM ('Requested', 'Accepted', 'Rejected');

CREATE TYPE action_type AS ENUM (
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

CREATE TYPE user_type AS ENUM (
  'system',
  'user'
);

CREATE TABLE event_actions (
  action_type action_type NOT NULL,
  annotation jsonb,
  assigned_to text,
  created_at TIMESTAMPTZ(3) DEFAULT now() NOT NULL,
  created_at_location uuid REFERENCES locations(id),
  created_by text NOT NULL,
  created_by_role text NOT NULL,
  created_by_signature text,
  created_by_user_type user_type NOT NULL,
  declaration jsonb DEFAULT '{}' :: jsonb NOT NULL,
  event_id uuid NOT NULL REFERENCES events(id),
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_action_id uuid REFERENCES event_actions(id),
  reason_is_duplicate boolean,
  reason_message text,
  registration_number text UNIQUE,
  request_id text,
  status action_status NOT NULL,
  transaction_id text NOT NULL,
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
    OR (
      action_type = 'REGISTER'
      AND status = 'Accepted'
      AND registration_number IS NOT NULL
    )
    OR (
      action_type = 'REGISTER'
      AND status = 'Requested'
      AND registration_number IS NULL
    )
    OR (
      action_type = 'REGISTER'
      AND status = 'Rejected'
      AND registration_number IS NULL
    )
    OR (
      action_type = 'REJECT'
      AND (
        reason_message IS NULL
        OR reason_message <> ''
      )
      AND reason_is_duplicate IS NOT NULL
    )
    OR (
      action_type = 'REJECT_CORRECTION'
      AND request_id IS NOT NULL
    )
    OR (
      action_type = 'APPROVE_CORRECTION'
      AND request_id IS NOT NULL
    )
    OR (
      action_type NOT IN ('ASSIGN', 'UNASSIGN', 'REGISTER', 'REJECT', 'REJECT_CORRECTION', 'APPROVE_CORRECTION')
    )
  )
);

GRANT SELECT, DELETE, INSERT ON event_actions TO events_app;

COMMENT ON TABLE event_actions IS 'Stores actions performed on life events, including client-supplied transaction_id for idempotency. Event actions cannot be updated or deleted by the application database user. The same transaction id can only create action of one type. Each action is linked to a specific event.';

COMMENT ON COLUMN event_actions.original_action_id IS 'References the original action if this is an asynchronous confirmation of it.';

CREATE TABLE event_action_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  action_type action_type NOT NULL,
  declaration jsonb DEFAULT '{}' :: jsonb NOT NULL,
  annotation jsonb,
  created_by text NOT NULL,
  created_by_role text NOT NULL,
  created_by_user_type text NOT NULL CHECK (created_by_user_type IN ('admin', 'user')),
  created_by_signature text,
  created_at_location uuid NOT NULL REFERENCES locations(id),
  created_at TIMESTAMPTZ(3) DEFAULT now() NOT NULL,
  UNIQUE (transaction_id, action_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON event_action_drafts TO events_app;

COMMENT ON TABLE event_action_drafts IS 'Stores user-specific drafts of event-related actions. Drafts use client-supplied transaction_id for idempotency. Declaration fields may be incomplete. Each draft is owned exclusively by created_by.';

-- Down Migration
DROP TABLE IF EXISTS event_action_drafts;

DROP TABLE IF EXISTS event_actions;

DROP TYPE IF EXISTS app.user_type;

DROP TYPE IF EXISTS action_type;

DROP TYPE IF EXISTS action_status;

DROP TABLE IF EXISTS events;

DROP TABLE IF EXISTS locations;
