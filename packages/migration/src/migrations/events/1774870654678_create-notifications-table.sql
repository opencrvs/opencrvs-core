-- Up Migration
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject     text        NOT NULL,
  body        text        NOT NULL,
  locale      text        NOT NULL DEFAULT 'en',
  recipients  text[]      NOT NULL,
  created_by  uuid        NOT NULL REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  status      text        NOT NULL DEFAULT 'PENDING',
  progress    int         NOT NULL DEFAULT 0,
  retry_count int         NOT NULL DEFAULT 0,
  error       jsonb,
  sent_at     timestamptz,
  CONSTRAINT notifications_status_check CHECK (status IN ('PENDING', 'SENT', 'FAILED'))
);

GRANT SELECT, INSERT, UPDATE ON notifications TO ${EVENTS_DB_USER};

CREATE INDEX ON notifications (status) WHERE status = 'PENDING';

COMMENT ON COLUMN notifications.recipients IS 'All BCC recipient emails, snapshotted at creation time.';
COMMENT ON COLUMN notifications.progress IS 'Number of recipients sent so far. Worker resumes from this offset on retry.';

-- Down Migration
DROP TABLE IF EXISTS notifications;