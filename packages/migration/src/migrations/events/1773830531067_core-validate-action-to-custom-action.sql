-- Up Migration
UPDATE
  event_actions
SET
  action_type = 'CUSTOM',
  custom_action_type = 'VALIDATE_DECLARATION'
WHERE
  action_type = 'VALIDATE';

-- Down Migration
UPDATE
  event_actions
SET
  action_type = 'VALIDATE'
WHERE
  action_type = 'CUSTOM'
  AND custom_action_type = 'VALIDATE_DECLARATION';
