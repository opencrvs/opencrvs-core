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

-- One-way: the down migration was broken and was removed instead of being fixed.
