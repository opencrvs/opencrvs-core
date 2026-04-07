-- Up Migration
ALTER TABLE event_actions DROP CONSTRAINT event_actions_check;
ALTER TABLE event_actions ALTER COLUMN action_type TYPE text USING action_type::text;
ALTER TABLE event_action_drafts ALTER COLUMN action_type TYPE text USING action_type::text;

DROP TYPE action_type;

ALTER TABLE event_actions
ADD COLUMN custom_action_type TEXT,
ADD CONSTRAINT event_actions_check CHECK (
  (
    (
      (action_type = 'ASSIGN')
      AND (assigned_to IS NOT NULL)
    )
    OR (
      (action_type = 'UNASSIGN')
      AND (assigned_to IS NULL)
    )
    OR (
      (action_type = 'REGISTER')
      AND (status = 'Accepted'::app.action_status)
      AND (registration_number IS NOT NULL)
    )
    OR (
      (action_type = 'REGISTER')
      AND (status = 'Requested'::app.action_status)
      AND (registration_number IS NULL)
    )
    OR (
      (action_type = 'REGISTER')
      AND (status = 'Rejected'::app.action_status)
      AND (registration_number IS NULL)
    )
    OR (
      (action_type = 'REJECT')
      AND (content->'reason' IS NOT NULL)
      AND (content->>'reason' <> ''::TEXT)
    )
    OR (
      (
        action_type = 'REJECT_CORRECTION'
      )
      AND (request_id IS NOT NULL)
    )
    OR (
      (
        action_type = 'APPROVE_CORRECTION'
      )
      AND (request_id IS NOT NULL)
    )
    OR (
      (action_type = 'CUSTOM')
      AND (custom_action_type IS NOT NULL)
    )
    OR (
      action_type <> ALL (
        ARRAY[
          'ASSIGN',
          'UNASSIGN',
          'REGISTER',
          'REJECT',
          'REJECT_CORRECTION',
          'APPROVE_CORRECTION'
        ]
      )
    )
  )
);

-- Down Migration
ALTER TABLE event_actions DROP CONSTRAINT event_actions_check;
ALTER TABLE event_actions DROP COLUMN custom_action_type;

CREATE TYPE action_type AS ENUM (
  'CREATE',
  'NOTIFY',
  'DECLARE',
  'VALIDATE',
  'REGISTER',
  'DUPLICATE_DETECTED',
  'REJECT',
  'MARK_AS_DUPLICATE',
  'MARK_AS_NOT_DUPLICATE',
  'ARCHIVE',
  'PRINT_CERTIFICATE',
  'REQUEST_CORRECTION',
  'CORRECT',
  'REJECT_CORRECTION',
  'APPROVE_CORRECTION',
  'READ',
  'ASSIGN',
  'UNASSIGN'
);


ALTER TABLE event_actions ALTER COLUMN action_type TYPE text USING action_type::text;
ALTER TABLE event_action_drafts ALTER COLUMN action_type TYPE text USING action_type::text;

ALTER TABLE event_actions
ADD CONSTRAINT event_actions_check CHECK (
  (
    (
      (action_type = 'ASSIGN'::app.action_type)
      AND (assigned_to IS NOT NULL)
    )
    OR (
      (action_type = 'UNASSIGN'::app.action_type)
      AND (assigned_to IS NULL)
    )
    OR (
      (action_type = 'REGISTER'::app.action_type)
      AND (status = 'Accepted'::app.action_status)
      AND (registration_number IS NOT NULL)
    )
    OR (
      (action_type = 'REGISTER'::app.action_type)
      AND (status = 'Requested'::app.action_status)
      AND (registration_number IS NULL)
    )
    OR (
      (action_type = 'REGISTER'::app.action_type)
      AND (status = 'Rejected'::app.action_status)
      AND (registration_number IS NULL)
    )
    OR (
      (action_type = 'REJECT'::app.action_type)
      AND (content->'reason' IS NOT NULL)
      AND (content->>'reason' <> ''::TEXT)
    )
    OR (
      (
        action_type = 'REJECT_CORRECTION'::app.action_type
      )
      AND (request_id IS NOT NULL)
    )
    OR (
      (
        action_type = 'APPROVE_CORRECTION'::app.action_type
      )
      AND (request_id IS NOT NULL)
    )
    OR (
      action_type <> ALL (
        ARRAY[
          'ASSIGN'::app.action_type,
          'UNASSIGN'::app.action_type,
          'REGISTER'::app.action_type,
          'REJECT'::app.action_type,
          'REJECT_CORRECTION'::app.action_type,
          'APPROVE_CORRECTION'::app.action_type
        ]
      )
    )
  )
);