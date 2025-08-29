-- Up Migration
ALTER TABLE ONLY app.event_actions
    DROP CONSTRAINT IF EXISTS event_actions_transaction_id_action_type_key;

ALTER TABLE ONLY app.event_actions
    ADD CONSTRAINT event_actions_transaction_id_action_type_status_key UNIQUE (transaction_id, action_type, status);

-- Down Migration
ALTER TABLE ONLY app.event_actions
    DROP CONSTRAINT IF EXISTS event_actions_transaction_id_action_type_status_key;

ALTER TABLE ONLY app.event_actions
    ADD CONSTRAINT event_actions_transaction_id_action_type_key UNIQUE (transaction_id, action_type);
