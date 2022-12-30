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

const FRENCH_TYPE_LABEL_MAPPING = {
  HEALTHCARE_WORKER: 'Professionnel de Santé',
  POLICE_OFFICER: 'Agent de Police',
  SOCIAL_WORKER: 'Travailleur Social',
  LOCAL_LEADER: 'Leader Local',
  REGISTRATION_AGENT: "Agent d'enregistrement",
  LOCAL_REGISTRAR: 'Registraire local',
  LOCAL_SYSTEM_ADMIN: 'Administrateur système local',
  NATIONAL_SYSTEM_ADMIN: 'Administrateur système national',
  PERFORMANCE_MANAGEMENT: 'Gestion des performances',
  NATIONAL_REGISTRAR: 'Registraire national'
}

export const up = async (db, client) => {
  const session = client.startSession()
  try {
    /* ==============Migration for "users" Collection============== */

    const users = await db
      .collection('users')
      .find({ role: { $ne: 'FIELD_AGENT' } })
      .toArray()
    if (users && users.length) {
      await Promise.all(
        users.map(async (user) => {
          await db
            .collection('users')
            .updateOne(
              { username: user.username },
              { $set: { type: user.role } }
            )
        })
      )
    }

    //rename 'role' field to 'systemRole' for all 'users' collection documents
    await db
      .collection('users')
      .updateMany({}, { $rename: { role: 'systemRole' } })
    //rename 'type' field to 'role' for all 'users' collection documents
    await db.collection('users').updateMany({}, { $rename: { type: 'role' } })

    /* ==============Migration for "roles" Collection============== */

    //set 'types' for 'roles' collection documents where value not equal to 'FIELD_AGENT
    await db
      .collection('roles')
      .updateMany({ value: { $ne: 'FIELD_AGENT' } }, [
        { $set: { types: ['$value'] } }
      ])

    //modified 'types' field of 'roles' collection
    const roles = await db.collection('roles').find({}).toArray()
    if (roles && roles.length) {
      await Promise.all(
        roles.map(async (role) => {
          if (role.types && role.types.length) {
            const newType = []
            role.types.forEach((type) => {
              newType.push(
                {
                  lang: 'en',
                  label: type
                    .replace('_', ' ')
                    .toLowerCase()
                    .replace(/\b\w/g, (l) => l.toUpperCase())
                },
                {
                  lang: 'fr',
                  label: FRENCH_TYPE_LABEL_MAPPING[type]
                }
              )
            })
            await db
              .collection('roles')
              .updateOne({ _id: role._id }, { $set: { types: newType } })
          }
        })
      )
    }
    //rename 'types' field to 'roles' for all 'roles' collection documents
    await db.collection('roles').updateMany({}, { $rename: { types: 'roles' } })
    //remove 'title' field from all 'roles' collection documents
    await db.collection('roles').updateMany({}, { $unset: { title: 1 } })
  } finally {
    await session.endSession()
  }
}

export const down = async (db, client) => {
  const session = client.startSession()
  try {
    /* ==============Migration for "users" Collection============== */

    await db.collection('users').updateMany({}, { $rename: { role: 'type' } })
    await db
      .collection('users')
      .updateMany({}, { $rename: { systemRole: 'role' } })

    const users = await db
      .collection('users')
      .find({ role: { $ne: 'FIELD_AGENT' } })
      .toArray()
    if (users && users.length) {
      await Promise.all(
        users.map(async (user) => {
          await db
            .collection('users')
            .updateOne({ username: user.username }, { $set: { type: '' } })
        })
      )
    }

    /* ==============Migration for "roles" Collection============== */

    //rename 'roles' field to 'types' for all 'roles' collection documents
    await db.collection('roles').updateMany({}, { $rename: { roles: 'types' } })

    //modified 'types' field of 'roles' collection
    const roles = await db.collection('roles').find({}).toArray()
    if (roles && roles.length) {
      await Promise.all(
        roles.map(async (role) => {
          if (role.types && role.types.length) {
            const newType = role.types
              .filter((role) => role.lang === 'en')
              .map((role) => role.label.toUpperCase().replace(/ /g, '_'))
            console.log('newType', newType)
            await db
              .collection('roles')
              .updateOne({ _id: role._id }, { $set: { types: newType } })
          }
        })
      )
    }
    //set 'types' to empty for 'roles' collection documents where value not equal to 'FIELD_AGENT
    await db
      .collection('roles')
      .updateMany({ value: { $ne: 'FIELD_AGENT' } }, { $set: { types: '' } })
  } finally {
    await session.endSession()
  }
}
