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

import { query, writePoints } from '../../utils/influx-helper.js'
import {
  IRegistrationFields,
  IMigrationRegistrationResults
} from '../../utils/migration-interfaces.js'
import { Db, MongoClient } from 'mongodb'

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  await session.withTransaction(async () => {
    await migrateRegistrations('birth_registration', db)
    await migrateRegistrations('death_registration', db)
  })
}

const LIMIT = 100

async function migrateRegistrations(measurement: string, db: Db) {
  const result = (await query(
    `SELECT COUNT(compositionId) as total FROM ${measurement} WHERE registrarPractitionerId = ''`
  )) as unknown as IMigrationRegistrationResults[]

  const totalCount = result[0]?.total ?? 0

  console.log(
    `Migration - InfluxDB :: Total points found for measurement ${measurement}: ${totalCount}`
  )

  let processed = 0

  while (processed < totalCount) {
    const registrations = (await query(
      `SELECT * FROM ${measurement} WHERE registrarPractitionerId = '' LIMIT ${LIMIT}`
    )) as unknown as IRegistrationFields[]
    console.log(
      `Migration - InfluxDB :: Processing ${measurement}, ${processed + 1}-${
        processed + registrations.length
      }`
    )
    const updatedPoints = await getUpdatedPoints(registrations, measurement, db)

    await writePoints(updatedPoints)

    const startTime = registrations[0].time?.getNanoTime()
    const endTime = registrations[registrations.length - 1].time?.getNanoTime()

    const deleteQuery = `DELETE FROM ${measurement} WHERE registrarPractitionerId = '' AND time >= ${startTime} AND time <= ${endTime}`
    await query(deleteQuery)

    processed += registrations.length
    console.log(
      `Migration - InfluxDB :: Processing done: ${(
        (processed / totalCount) *
        100
      ).toFixed(2)}%`
    )
  }
}

const getUpdatedPoints = async (
  registrations: any[],
  measurement: string,
  db: Db
) => {
  return Promise.all(
    registrations.map(
      async ({
        compositionId,
        time,
        ageInDays,
        ageInYears,
        currentStatus,
        deathDays,
        ...tags
      }) => {
        let task = (await db.collection('Task').findOne({
          focus: {
            reference: `Composition/${compositionId}`
          },
          'businessStatus.coding.code': 'REGISTERED'
        })) as fhir.Task | null

        if (!task) {
          task = (await db.collection('Task_history').findOne({
            focus: {
              reference: `Composition/${compositionId}`
            },
            'businessStatus.coding.code': 'REGISTERED'
          })) as unknown as fhir.Task
        }

        let practitionerExtension: fhir.Extension | undefined

        if (task && task.extension) {
          practitionerExtension = task.extension.find(
            (extension: fhir.Extension) =>
              extension.url ===
              'http://opencrvs.org/specs/extension/regLastUser'
          )
        }

        let id: string = ''
        if (
          practitionerExtension &&
          practitionerExtension.valueReference &&
          practitionerExtension.valueReference.reference
        ) {
          id = practitionerExtension.valueReference.reference.replace(
            'Practitioner/',
            ''
          )
        }
        const fields: any = { compositionId, currentStatus }
        if (measurement === 'birth_registration') {
          fields.ageInDays = ageInDays
        }
        if (measurement === 'death_registration') {
          fields.deathDays = deathDays
          fields.ageInYears = ageInYears
        }

        const practitioner = await db.collection('Practitioner').findOne({ id })

        return {
          measurement,
          tags: {
            ...tags,
            registrarPractitionerId: practitioner?.id
          },
          fields,
          timestamp: time.getNanoTime()
        }
      }
    )
  )
}

export const down = async (db: Db, client: MongoClient) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
}
