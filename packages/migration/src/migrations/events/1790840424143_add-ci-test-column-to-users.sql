-- Up Migration
ALTER TABLE users ADD COLUMN ci_test text;

-- Down Migration
ALTER TABLE users DROP COLUMN ci_test;
