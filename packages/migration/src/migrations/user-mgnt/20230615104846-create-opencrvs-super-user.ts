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

import bcryptjs from 'bcryptjs'
const { genSaltSync, hashSync } = bcryptjs
import { Db, MongoClient } from 'mongodb'

const SUPER_USER_PASSWORD = process.env.SUPER_USER_PASSWORD ?? 'password'

const DEFAULT_SYSTEM_ROLES = [
  {
    title: 'Field Agent',
    value: 'FIELD_AGENT',
    roles: [],
    active: true
  },

  {
    title: 'Registration Agent',
    value: 'REGISTRATION_AGENT',
    roles: [],
    active: true
  },

  {
    title: 'Registrar',
    value: 'LOCAL_REGISTRAR',
    roles: [],
    active: true
  },

  {
    title: 'System admin (local)',
    value: 'LOCAL_SYSTEM_ADMIN',
    roles: [],
    active: true
  },

  {
    title: 'System admin (national)',
    value: 'NATIONAL_SYSTEM_ADMIN',
    roles: [],
    active: true
  },

  {
    title: 'Performance Management',
    value: 'PERFORMANCE_MANAGEMENT',
    roles: [],
    active: true
  },

  {
    title: 'National Registrar',
    value: 'NATIONAL_REGISTRAR',
    roles: [],
    active: true
  }
] as const

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()

  try {
    if ((await db.collection('systemroles').estimatedDocumentCount()) === 0) {
      await db.collection('systemroles').insertMany(
        DEFAULT_SYSTEM_ROLES.map((systemRole) => ({
          ...systemRole,
          createdAt: Date.now().toString(),
          updatedAt: Date.now().toString()
        }))
      )
    }
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
      systemRole: 'NATIONAL_SYSTEM_ADMIN',
      scope: ['natlsysadmin', 'sysadmin'],
      status: 'active'
    })
  } finally {
    await session.endSession()
  }
}

export const down = async () => {}
