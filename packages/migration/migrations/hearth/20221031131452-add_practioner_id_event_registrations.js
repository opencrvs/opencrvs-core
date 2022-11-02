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
    const result = await query(
      "SELECT * FROM birth_registration WHERE registrarPractitionerId = ''"
    )

    result.forEach(
      async ({ compositionId, time, ageInDays, currentStatus, ...tags }) => {
        const task = await db.collection('Task').findOne({
          focus: {
            reference: `Composition/${compositionId}`
          },
          businessStatus: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/reg-status',
                code: 'REGISTERED'
              }
            ]
          }
        })

        const practitionerExtension = task.extension.find(
          (extension) =>
            extension.url === 'http://opencrvs.org/specs/extension/regLastUser'
        )
        const id = practitionerExtension.valueReference.reference.replace(
          'Practitioner/',
          ''
        )
        const practitioner = await db.collection('Practitioner').findOne({ id })
        const point = {
          measurement: 'birth_registration',
          tags: {
            ...tags,
            registrarPractitionerId: practitioner._id.toString()
          },
          fields: { compositionId, ageInDays, currentStatus },
          timestamp: time.getNanoTime()
        }

        console.log(
          `DELETE FROM birth_registration WHERE registrarPractitionerId = '' AND time = ${time.getNanoTime()}`
        )

        await writePoints([point])
        await query(
          `DELETE FROM birth_registration WHERE registrarPractitionerId = '' AND time = ${time.getNanoTime()}`
        )
      }
    )
  })
}

export const down = async (db, client) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
}
