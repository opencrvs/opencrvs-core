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

const UserRoles = [
  {
    labels: [
      {
        lang: 'en',
        label: 'Health Worker'
      },
      {
        lang: 'fr',
        label: 'Professionnel de Santé'
      }
    ]
  },
  {
    labels: [
      {
        lang: 'en',
        label: 'Police Worker'
      },
      {
        lang: 'fr',
        label: 'Agent de Police'
      }
    ]
  },
  {
    labels: [
      {
        lang: 'en',
        label: 'Social Worker'
      },
      {
        lang: 'fr',
        label: 'Travailleur Social'
      }
    ]
  },
  {
    labels: [
      {
        lang: 'en',
        label: 'Local Leader'
      },
      {
        lang: 'fr',
        label: 'Leader Local'
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
  HEALTHCARE_WORKER: 0,
  POLICE_OFFICER: 1,
  SOCIAL_WORKER: 2,
  LOCAL_LEADER: 3,
  REGISTRATION_AGENT: 4,
  LOCAL_REGISTRAR: 5,
  LOCAL_SYSTEM_ADMIN: 6,
  NATIONAL_SYSTEM_ADMIN: 7,
  PERFORMANCE_MANAGEMENT: 8,
  NATIONAL_REGISTRAR: 9
}

export const up = async (db, client) => {
  const session = client.startSession()
  try {
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

    for await (const user of db.collection('users').find()) {
      await db.collection('users').updateOne(
        { username: user.username },
        {
          $set: {
            type: userRolesResult.insertedIds[
              UserRolesIndex[
                user.role === 'FIELD_AGENT' ? user.type : user.role
              ]
            ]
          }
        }
      )
    }

    //rename 'role' field to 'systemRole' for all 'users' collection documents
    await db
      .collection('users')
      .updateMany({}, { $rename: { role: 'systemRole' } })
    //rename 'type' field to 'role' for all 'users' collection documents
    await db.collection('users').updateMany({}, { $rename: { type: 'role' } })

    /* ==============Migration for "roles" Collection============== */

    for await (const role of db.collection('roles').find()) {
      await db.collection('roles').updateOne(
        { _id: role._id },
        {
          $set: {
            types:
              role.value === 'FIELD_AGENT'
                ? Object.values(userRolesResult.insertedIds).slice(0, 4)
                : [userRolesResult.insertedIds[UserRolesIndex[role.value]]]
          }
        }
      )
    }
    //rename 'types' field to 'roles' for all 'roles' collection documents
    await db.collection('roles').updateMany({}, { $rename: { types: 'roles' } })
    //remove 'title' field from all 'roles' collection documents
    await db.collection('roles').updateMany({}, { $unset: { title: 1 } })
    //rename 'roles' collection name to 'systemroles'
    await db.collection('roles').rename('systemroles')
  } finally {
    await session.endSession()
  }
}

export const down = async (db, client) => {
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
          $set: { type: user.role === 'FIELD_AGENT' ? 'HEALTHCARE_WORKER' : '' }
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
                ? Object.keys(UserRolesIndex).slice(0, 4)
                : []
          }
        }
      )
    }
  } finally {
    await session.endSession()
  }
}
