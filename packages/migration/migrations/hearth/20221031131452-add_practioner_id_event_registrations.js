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
import { query, writePoints } from './../../utils/influx-helper.js'

export const up = async (db, client) => {
  const session = client.startSession()
  await session.withTransaction(async () => {
    const resultBirth = await query(
      "SELECT * FROM birth_registration WHERE registrarPractitionerId = ''"
    )
    const birthPromises = updateInflux(resultBirth, 'birth_registration', db)
    await Promise.all(birthPromises)

    const result = await query(
      "SELECT * FROM death_registration WHERE registrarPractitionerId = ''"
    )
    const deathPromises = updateInflux(result, 'death_registration', db)
    await Promise.all(deathPromises)
  })
}

const updateInflux = (result, measurement, db) => {
  return result.map(
    async ({
      compositionId,
      time,
      ageInDays,
      ageInYears,
      currentStatus,
      deathDays,
      ...tags
    }) => {
      let task = await db.collection('Task').findOne({
        focus: {
          reference: `Composition/${compositionId}`
        },
        'businessStatus.coding.code': 'REGISTERED'
      })

      if (!task) {
        task = await db.collection('Task_history').findOne({
          focus: {
            reference: `Composition/${compositionId}`
          },
          'businessStatus.coding.code': 'REGISTERED'
        })
      }

      const practitionerExtension = task.extension.find(
        (extension) =>
          extension.url === 'http://opencrvs.org/specs/extension/regLastUser'
      )
      const id = practitionerExtension.valueReference.reference.replace(
        'Practitioner/',
        ''
      )
      const fields = { compositionId, currentStatus }
      if (measurement === 'birth_registration') {
        fields.ageInDays = ageInDays
      }
      if (measurement === 'death_registration') {
        fields.deathDays = deathDays
        fields.ageInYears = ageInYears
      }

      const practitioner = await db.collection('Practitioner').findOne({ id })

      const point = {
        measurement,
        tags: {
          ...tags,
          registrarPractitionerId: practitioner.id
        },
        fields,
        timestamp: time.getNanoTime()
      }
      const deleteQuery = `DELETE FROM ${measurement} WHERE registrarPractitionerId = '' AND time = ${time.getNanoTime()}`
      await writePoints([point])
      return await query(deleteQuery)
    }
  )
}

export const down = async (db, client) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
}
