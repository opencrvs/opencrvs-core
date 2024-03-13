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
import { Db, MongoClient } from 'mongodb'

const UserRoles = [
  {
    labels: [
      {
        lang: 'en',
        label: 'Field Agent'
      },
      {
        lang: 'fr',
        label: 'Agent de terrain'
      }
    ]
  },
  {
    labels: [
      {
        lang: 'en',
        label: 'Registration Agent'
      },
      {
        lang: 'fr',
        label: "Agent d'enregistrement"
      }
    ]
  },
  {
    labels: [
      {
        lang: 'en',
        label: 'Local Registrar'
      },
      {
        lang: 'fr',
        label: 'Registraire local'
      }
    ]
  },
  {
    labels: [
      {
        lang: 'en',
        label: 'Local System Admin'
      },
      {
        lang: 'fr',
        label: 'Administrateur système local'
      }
    ]
  },
  {
    labels: [
      {
        lang: 'en',
        label: 'National System Admin'
      },
      {
        lang: 'fr',
        label: 'Administrateur système national'
      }
    ]
  },
  {
    labels: [
      {
        lang: 'en',
        label: 'Performance Manager'
      },
      {
        lang: 'fr',
        label: 'Gestion des performances'
      }
    ]
  },
  {
    labels: [
      {
        lang: 'en',
        label: 'National Registrar'
      },
      {
        lang: 'fr',
        label: 'Registraire national'
      }
    ]
  }
]

const UserRolesIndex = {
  FIELD_AGENT: 0,
  REGISTRATION_AGENT: 1,
  LOCAL_REGISTRAR: 2,
  LOCAL_SYSTEM_ADMIN: 3,
  NATIONAL_SYSTEM_ADMIN: 4,
  PERFORMANCE_MANAGEMENT: 5,
  NATIONAL_REGISTRAR: 6
} as const

const DEFAULT_SYSTEM_ROLES = [
  {
    title: 'Field Agent',
    value: 'FIELD_AGENT',
    roles: [
      'HEALTHCARE_WORKER',
      'POLICE_OFFICER',
      'SOCIAL_WORKER',
      'LOCAL_LEADER',
      'FIELD_AGENT'
    ],
    active: true
  },

  {
    title: 'Registration Agent',
    value: 'REGISTRATION_AGENT',
    roles: ['REGISTRATION_AGENT'],
    active: true
  },

  {
    title: 'Registrar',
    value: 'LOCAL_REGISTRAR',
    roles: ['LOCAL_REGISTRAR'],
    active: true
  },

  {
    title: 'System admin (local)',
    value: 'LOCAL_SYSTEM_ADMIN',
    roles: ['LOCAL_SYSTEM_ADMIN'],
    active: true
  },

  {
    title: 'System admin (national)',
    value: 'NATIONAL_SYSTEM_ADMIN',
    roles: ['NATIONAL_SYSTEM_ADMIN'],
    active: true
  },

  {
    title: 'Performance Management',
    value: 'PERFORMANCE_MANAGEMENT',
    roles: ['PERFORMANCE_MANAGEMENT'],
    active: true
  },

  {
    title: 'National Registrar',
    value: 'NATIONAL_REGISTRAR',
    roles: ['NATIONAL_REGISTRAR'],
    active: true
  }
] as const

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  const limit = 10
  let skip = 0
  let processedDocCount = 0
  try {
    // do nothing for empty db
    if ((await db.collection('roles').estimatedDocumentCount()) === 0) {
      return
    }
    /* ==============Create a new userroles collection============== */

    await db.createCollection('userroles')

    const userRolesResult = await db.collection('userroles').insertMany(
      UserRoles.map((userRole) => ({
        ...userRole,
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString()
      }))
    )

    /* ==============Migration for "users" Collection============== */

    const totalUserCount = await getTotalDocCountByCollectionName(db, 'users')

    while (totalUserCount > processedDocCount) {
      const userCursor = await getUserCursor(db, limit, skip)
      const count = await userCursor.count()
      // eslint-disable-next-line no-console
      console.log(
        `Migration Up - User role & Type :: Processing ${
          processedDocCount + 1
        } - ${processedDocCount + count} of ${totalUserCount} documents...`
      )

      while (await userCursor.hasNext()) {
        const user = await userCursor.next()
        await db.collection('users').updateOne(
          { username: user?.username },
          {
            $set: {
              type: userRolesResult.insertedIds[
                UserRolesIndex[user?.role as keyof typeof UserRolesIndex]
              ]
            }
          }
        )
      }

      skip += limit
      processedDocCount += count
      const percentage = ((processedDocCount / totalUserCount) * 100).toFixed(2)
      // eslint-disable-next-line no-console
      console.log(
        `Migration Up - User role & Type :: Processing done ${percentage}%`
      )
    }

    //rename 'role' field to 'systemRole' for all 'users' collection documents
    await db
      .collection('users')
      .updateMany({}, { $rename: { role: 'systemRole' } })
    //rename 'type' field to 'role' for all 'users' collection documents
    await db.collection('users').updateMany({}, { $rename: { type: 'role' } })

    /* ==============Migration for "roles" Collection============== */

    const allCollections = await db.listCollections().toArray()

    const rolesCollectionExists = allCollections.find(
      ({ name }) => name === 'roles'
    )
    if (rolesCollectionExists) {
      for await (const role of db.collection('roles').find()) {
        await db.collection('roles').updateOne(
          { _id: role._id },
          {
            $set: {
              types: [
                userRolesResult.insertedIds[
                  UserRolesIndex[role.value as keyof typeof UserRolesIndex]
                ]
              ]
            }
          }
        )
      }
      //rename 'types' field to 'roles' for all 'roles' collection documents
      await db
        .collection('roles')
        .updateMany({}, { $rename: { types: 'roles' } })
      //remove 'title' field from all 'roles' collection documents
      await db.collection('roles').updateMany({}, { $unset: { title: 1 } })
      //rename 'roles' collection name to 'systemroles'
      await db.collection('roles').rename('systemroles')
    } else {
      //create a new 'systemroles' collection
      await db.createCollection('systemroles')

      //insert all system roles to 'systemroles' collection
      await db.collection('systemroles').insertMany(
        DEFAULT_SYSTEM_ROLES.map((systemRole) => ({
          ...systemRole,
          roles: systemRole.roles.map(
            (role) =>
              userRolesResult.insertedIds[
                UserRolesIndex[role as keyof typeof UserRolesIndex]
              ]
          ),
          createdAt: Date.now().toString(),
          updatedAt: Date.now().toString()
        }))
      )
    }
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    /* ==============Drop collection userroles============== */

    await db.dropCollection('userroles')

    /* ==============Migration for "users" Collection============== */

    //revert role to type
    await db.collection('users').updateMany({}, { $rename: { role: 'type' } })
    //revert systemRole to role
    await db
      .collection('users')
      .updateMany({}, { $rename: { systemRole: 'role' } })

    for await (const user of db.collection('users').find()) {
      await db.collection('users').updateOne(
        { username: user.username },
        {
          $set: {
            type: user.role === 'FIELD_AGENT' ? 'HEALTHCARE_WORKER' : ''
          }
        }
      )
    }
    /* ==============Migration for "roles" Collection============== */

    //rename 'systemroles' collection name to 'roles'
    await db.collection('systemroles').rename('roles')

    //rename 'roles' field to 'types' for all 'roles' collection documents
    await db.collection('roles').updateMany({}, { $rename: { roles: 'types' } })

    //revert 'types' field of 'roles' collection
    for await (const role of db.collection('roles').find()) {
      await db.collection('roles').updateOne(
        { _id: role._id },
        {
          $set: {
            types:
              role.value === 'FIELD_AGENT'
                ? [
                    'HEALTHCARE_WORKER',
                    'POLICE_OFFICER',
                    'SOCIAL_WORKER',
                    'LOCAL_LEADER'
                  ]
                : []
          }
        }
      )
    }
  } finally {
    await session.endSession()
  }
}

export async function getTotalDocCountByCollectionName(
  db: Db,
  collectionName: string
) {
  return await db.collection(collectionName).count()
}

export async function getUserCursor(db: Db, limit = 50, skip = 0) {
  return db.collection('users').find({}, { limit, skip })
}
