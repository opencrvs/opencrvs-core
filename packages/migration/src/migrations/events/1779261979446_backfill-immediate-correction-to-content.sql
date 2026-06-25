-- Up Migration
UPDATE app.event_actions
SET
  content    = COALESCE(content, '{}') || '{"immediateCorrection": true}'::jsonb,
  annotation = annotation - 'isImmediateCorrection'
WHERE
  action_type = 'APPROVE_CORRECTION'
  AND annotation @> '{"isImmediateCorrection": true}';

-- Down Migration
UPDATE app.event_actions
SET
  annotation = COALESCE(annotation, '{}') || '{"isImmediateCorrection": true}'::jsonb,
  content    = content - 'immediateCorrection'
WHERE
  action_type = 'APPROVE_CORRECTION'
  AND content @> '{"immediateCorrection": true}';
