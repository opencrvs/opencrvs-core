/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import bcryptjs from 'bcryptjs'
const { genSaltSync, hashSync } = bcryptjs

const SUPER_USER_PASSWORD = process.env.SUPER_USER_PASSWORD ?? 'password'

export const up = async (db, client) => {
  const session = client.startSession()

  try {
    const role = await db.collection('userroles').findOne({
      'labels.label': 'National System Admin'
    })
    const salt = genSaltSync(10)
    const passwordHash = hashSync(SUPER_USER_PASSWORD, salt)

    db.collection('users').insertOne({
      name: [
        {
          use: 'en',
          given: ['Opencrvs'],
          family: 'Admin'
        }
      ],
      username: 'o.admin',
      emailForNotification: 'o.admin@opencrvs.org',
      mobile: '0989898989',
      passwordHash,
      salt,
      role: role._id,
      systemRole: 'NATIONAL_SYSTEM_ADMIN',
      scope: ['natlsysadmin'],
      status: 'active'
    })
  } finally {
    await session.endSession()
  }
};

export const down = async (db, client) => {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
};
