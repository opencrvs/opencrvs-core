/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import bcryptPkg from 'bcryptjs'
const { genSaltSync, hashSync } = bcryptPkg

const SUPER_USER_PASSWORD = process.env.SUPER_USER_PASSWORD ?? 'password'

const ROOT_ADMIN_AREA_ID = '00000000-0000-0000-0000-000000000001'
const SUPER_USER_OFFICE_ID = '00000000-0000-0000-0000-000000000002'

export async function up(pgm) {
  const { rowCount } = await pgm.db.query('SELECT 1 FROM users LIMIT 1')
  if (rowCount === 0) {
    await pgm.db.query(
      `INSERT INTO administrative_areas (id, name, parent_id)
       VALUES ($1, 'OpenCRVS', NULL)
       ON CONFLICT (id) DO NOTHING`,
      [ROOT_ADMIN_AREA_ID]
    )

    await pgm.db.query(
      `INSERT INTO locations (id, name, location_type, administrative_area_id)
       VALUES ($1, 'OpenCRVS Office', 'CRVS_OFFICE', $2)
       ON CONFLICT (id) DO NOTHING`,
      [SUPER_USER_OFFICE_ID, ROOT_ADMIN_AREA_ID]
    )

    const salt = genSaltSync(10)
    const passwordHash = hashSync(SUPER_USER_PASSWORD, salt)

    await pgm.db.query(
      `WITH new_user AS (
        INSERT INTO users (firstname, surname, role, status, email, mobile, office_id)
        VALUES ('Opencrvs', 'Admin', 'SUPER_ADMIN', 'active', 'o.admin@opencrvs.org', '0989898989', $4)
        RETURNING id
      )
      INSERT INTO user_credentials (user_id, username, password_hash, salt, security_questions)
      SELECT id, $1, $2, $3, '[]'::jsonb
      FROM new_user`,
      ['o.admin', passwordHash, salt, SUPER_USER_OFFICE_ID]
    )
  }
}

export async function down(pgm) {
  await pgm.db.query(`DELETE FROM user_credentials WHERE username = 'o.admin'`)
  await pgm.db.query(`DELETE FROM users WHERE email = 'o.admin@opencrvs.org'`)
  await pgm.db.query(`DELETE FROM locations WHERE id = $1`, [
    SUPER_USER_OFFICE_ID
  ])
  await pgm.db.query(`DELETE FROM administrative_areas WHERE id = $1`, [
    ROOT_ADMIN_AREA_ID
  ])
  await pgm.db.query('ALTER TABLE users ALTER COLUMN office_id SET NOT NULL')
}
