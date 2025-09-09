-- Up Migration
ALTER TABLE event_action_drafts
-- Handling transaction_id on this level is too late. We should have handled it on the API.
DROP CONSTRAINT event_action_drafts_transaction_id_action_type_key;

-- Limit drafts to one per event and created_by.
ALTER TABLE event_action_drafts
ADD UNIQUE (event_id, created_by);

-- Down Migration
ALTER TABLE event_action_drafts
ADD UNIQUE (transaction_id, action_type);

ALTER TABLE event_action_drafts
DROP CONSTRAINT event_action_drafts_event_id_created_by_key;
