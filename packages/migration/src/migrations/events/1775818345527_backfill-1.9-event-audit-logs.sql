-- Up Migration
INSERT INTO app.audit_log
  (client_id, client_type, operation, request_data, response_summary, created_at, transaction_id)
SELECT
  ea.created_by,
  ea.created_by_user_type,
  CASE ea.action_type
    WHEN 'CREATE'                 THEN 'event.create'
    WHEN 'NOTIFY'                 THEN 'event.actions.notify.request'
    WHEN 'DECLARE'                THEN 'event.actions.declare.request'
    WHEN 'REGISTER'               THEN 'event.actions.register.request'
    WHEN 'REJECT'                 THEN 'event.actions.reject.request'
    WHEN 'VALIDATE'               THEN 'event.actions.validate.request'
    WHEN 'EDIT'                   THEN 'event.actions.edit.request'
    WHEN 'ASSIGN'                 THEN 'event.actions.assign.request'
    WHEN 'UNASSIGN'               THEN 'event.actions.unassign.request'
    WHEN 'READ'                   THEN 'event.actions.read.request'
    WHEN 'ARCHIVE'                THEN 'event.actions.archive.request'
    WHEN 'REINSTATE'              THEN 'event.actions.reinstate.request'
    WHEN 'PRINT_CERTIFICATE'      THEN 'event.actions.print_certificate.request'
    WHEN 'REQUEST_CORRECTION'     THEN 'event.actions.correction.request.request'
    WHEN 'APPROVE_CORRECTION'     THEN 'event.actions.correction.approve.request'
    WHEN 'REJECT_CORRECTION'      THEN 'event.actions.correction.reject.request'
    WHEN 'MARK_AS_DUPLICATE'      THEN 'event.actions.mark_as_duplicate.request'
    WHEN 'MARK_AS_NOT_DUPLICATE'  THEN 'event.actions.mark_as_not_duplicate.request'
    WHEN 'CUSTOM'                 THEN 'event.actions.custom.request'
  END,
  CASE
    WHEN ea.action_type = 'CREATE' THEN jsonb_build_object(
      'transactionId',     e.transaction_id,
      'type',              e.event_type,
      'createdAtLocation', ea.created_at_location::text
    )
    WHEN ea.action_type = 'CUSTOM' THEN jsonb_build_object(
      'eventId',       ea.event_id::text,
      'actionType',    'CUSTOM',
      'customAction',  COALESCE(ea.custom_action_type, ''),
      'eventType',     e.event_type,
      'trackingId',    e.tracking_id,
      'transactionId', ea.transaction_id
    )
    ELSE jsonb_build_object(
      'eventId',       ea.event_id::text,
      'actionType',    ea.action_type,
      'eventType',     e.event_type,
      'trackingId',    e.tracking_id,
      'transactionId', ea.transaction_id
    )
  END,
  CASE WHEN ea.action_type = 'CREATE'
       THEN jsonb_build_object('eventId', ea.event_id::text, 'trackingId', e.tracking_id)
       ELSE NULL
  END,
  ea.created_at,
  CASE WHEN ea.action_type = 'CREATE' THEN e.transaction_id ELSE ea.transaction_id END
FROM app.event_actions ea
JOIN app.events e ON e.id = ea.event_id
WHERE ea.status = 'Accepted'
  AND ea.action_type IN (
    'CREATE','NOTIFY','DECLARE','REGISTER','REJECT','VALIDATE','EDIT',
    'ASSIGN','UNASSIGN','READ','ARCHIVE','REINSTATE','PRINT_CERTIFICATE',
    'REQUEST_CORRECTION','APPROVE_CORRECTION','REJECT_CORRECTION',
    'MARK_AS_DUPLICATE','MARK_AS_NOT_DUPLICATE','CUSTOM'
  );
-- Down Migration