-- Up Migration

ALTER TABLE event_actions DROP constraint event_actions_check;
ALTER TABLE event_actions DROP COLUMN reason_is_duplicate;
ALTER TABLE event_actions DROP COLUMN reason_message;
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

-- Down Migration

ALTER TABLE event_actions ADD COLUMN reason_is_duplicate boolean;
ALTER TABLE event_actions ADD COLUMN reason_message text;
ALTER TABLE event_actions
ADD CONSTRAINT event_actions_check CHECK (
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
);
