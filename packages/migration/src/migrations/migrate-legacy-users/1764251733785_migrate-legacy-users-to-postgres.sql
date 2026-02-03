-- Up Migration
INSERT INTO users(id, legacy_id, firstname, surname, full_honorific_name, role, status, email, mobile, signature_path, profile_image_path, office_id)
SELECT
  gen_random_uuid() AS id,
  lu._id AS legacy_id,
  lu.name -> 0 -> 'given' ->> 0 AS firstname,
  lu.name -> 0 ->> 'family' AS surname,
  lu."fullHonorificName" AS full_honorific_name,
  lu.role AS role,
  lu.status AS status,
  LOWER(lu."emailForNotification") AS email,
  lu.mobile AS mobile,
(
    SELECT
      ext
    FROM
      legacy_practitioners lp,
      LATERAL json_array_elements(lp.extension) AS ext
    WHERE
      lp.id = lu."practitionerId"
      AND ext ->> 'url' = 'http://opencrvs.org/specs/extension/employee-signature') -> 'valueAttachment' ->> 'url' AS signature_path,
  lu."avatar.data" AS profile_image_path,
  lu."primaryOfficeId"::uuid AS office_id
FROM
  legacy_users lu
WHERE
  lu.role <> 'SUPER_ADMIN';

-- Down Migration
DELETE FROM users
WHERE legacy_id IN (
    SELECT
      _id
    FROM
      legacy_users);

