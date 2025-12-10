-- Up Migration
INSERT INTO user_credentials(id, user_id, username, password_hash, salt, security_questions)
SELECT
  gen_random_uuid() AS id,
  u.id AS user_id,
  lu.username AS username,
  lu."passwordHash" AS password_hash,
  lu.salt AS salt,
  lu."securityQuestionAnswers"::jsonb AS security_questions
FROM
  users u
  LEFT JOIN legacy_users lu ON u.legacy_id = lu._id;

-- Down Migration
DELETE FROM user_credentials
WHERE user_id IN (
    SELECT
      id
    FROM
      users);


