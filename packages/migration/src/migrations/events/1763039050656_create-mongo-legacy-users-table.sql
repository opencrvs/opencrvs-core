-- Up Migration
CREATE FOREIGN TABLE legacy_users(
  _id name,
  name json,
  username text,
  "emailForNotification" text,
  mobile text,
  "fullHonorificName" text,
  "passwordHash" text,
  salt text,
  role text,
  "primaryOfficeId" text,
  status text,
  "securityQuestionAnswers" json,
  "avatar.data" text
) SERVER mongo OPTIONS(
  database 'user-mgnt',
  collection 'users'
);

-- Down Migration

DROP FOREIGN TABLE legacy_users;

