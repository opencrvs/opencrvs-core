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

export async function up(pgm) {
  const { rowCount } = await pgm.db.query('SELECT 1 FROM users LIMIT 1')

  const salt = genSaltSync(10)
  const passwordHash = hashSync(SUPER_USER_PASSWORD, salt)

  const completedAt = rowCount > 0 ? new Date() : null

  await pgm.db.query(
    `INSERT INTO system_initialisation(token_hash, token_salt, completed_at) VALUES ($1, $2, $3)`,
    [passwordHash, salt, completedAt]
  )
}

export async function down(pgm) {
  // There should be only one record in the system_setup table, but we will delete by id to be safe.
  await pgm.db.query('DELETE FROM system_initialisation WHERE id = 1')
}
