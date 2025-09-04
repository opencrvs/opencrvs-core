-- Up Migration

ALTER TYPE action_type RENAME VALUE 'DETECT_DUPLICATE' TO 'DUPLICATE_DETECTED';

ALTER TYPE action_type RENAME VALUE 'MARKED_AS_DUPLICATE' TO 'MARK_AS_DUPLICATE';

ALTER TYPE action_type ADD VALUE 'MARK_AS_NOT_DUPLICATE';

-- Down Migration

-- Enum values cannot be removed, so we need to create a new enum type with the
-- previous values and then alter the column to use the new type.
CREATE TYPE action_type_new AS ENUM (
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
  'CORRECT',
  'REJECT_CORRECTION',
  'APPROVE_CORRECTION',
  'READ',
  'ASSIGN',
  'UNASSIGN'
);

ALTER TABLE event_actions ALTER COLUMN action_type TYPE action_type_new USING action_type::text::action_type_new;

DROP TYPE action_type;

ALTER TYPE action_type_new RENAME TO action_type;
