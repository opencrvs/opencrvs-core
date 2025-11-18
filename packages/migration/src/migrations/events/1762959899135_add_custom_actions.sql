-- Up Migration
ALTER TYPE action_type ADD VALUE 'CUSTOM';

-- Down Migration

-- Enum values cannot be removed, so we need to create a new enum type with the
-- previous values and then alter the column to use the new type.
ALTER TYPE action_type RENAME TO action_type_old;
CREATE TYPE action_type AS ENUM (
  'CREATE',
  'NOTIFY',
  'DECLARE',
  'VALIDATE',
  'REGISTER',
  'DUPLICATE_DETECTED',
  'REJECT',
  'MARK_AS_DUPLICATE',
  'ARCHIVE',
  'PRINT_CERTIFICATE',
  'REQUEST_CORRECTION',
  'CORRECT',
  'REJECT_CORRECTION',
  'APPROVE_CORRECTION',
  'READ',
  'ASSIGN',
  'UNASSIGN',
  'MARK_AS_NOT_DUPLICATE'
);
ALTER TABLE event_actions
  ALTER COLUMN action_type TYPE action_type
  USING action_type::text::action_type;
