- Initialise new records database
  - Migrations, data clearing, backups, rotating passwords and access
- Client needs to send all attachments to the server BEFORE submission of the record. Record refer to raw minio urls

- User audit & metrics?

## Can we drop from first version

- Deduplication
- Notifications
- Webhooks

## Team requirements

- 2 leads

## Technical steer

- This is a good time to think outside the box, pay back a lot of technical design and redesign
- Keep current "legacy event" code as is as much as possible
- Create very clear Y-junctions in the code with `if legacyEvent(event) then X else Y`. Aim to make this separation as early in the code as possible
- All new code is as strict as possible. No optional fields if not absolutely needed.
