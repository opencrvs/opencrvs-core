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

  const isSystemInitialised = rowCount > 0
  // If system is initialised, we do not persist the super user password hash and salt, as they will not be needed.
  const salt = isSystemInitialised ? null : genSaltSync(10)
  const hash = isSystemInitialised ? null : hashSync(SUPER_USER_PASSWORD, salt)
  const completedAt = isSystemInitialised ? new Date() : null

  await pgm.db.query(
    `INSERT INTO system_initialisation(hash, salt, completed_at) VALUES ($1, $2, $3)`,
    [hash, salt, completedAt]
  )
}

export async function down(pgm) {
  // There should be only one record in the system_initialisation table, but we will delete by id to be safe.
  await pgm.db.query('DELETE FROM system_initialisation WHERE id = 1')
}
