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

import {
  svgCode as marriageCertificateTemplateDefault
  // eslint-disable-next-line import/no-relative-parent-imports
} from '../../utils/marriage-certificate-template-default.js'
export const up = async (db, client) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db.collection('certificates').insert({
        event: 'marriage',
        status: 'ACTIVE',
        svgCode: marriageCertificateTemplateDefault,
        svgDateCreated: Number(new Date()),
        svgDateUpdated: Number(new Date()),
        svgFilename: 'farajaland-marriage-certificate-v1.svg',
        user: 'j.campbell'
      })
    })
  } finally {
    console.log(`Migration - Add Marriage Certificate Configuration: Done. `)
    await session.endSession()
  }
}

export const down = async (db, client) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db.collection('certificates').deleteOne({ event: 'marriage' })
    })
  } finally {
    console.log(
      `Migration - DOWN - Add Marriage Certificate Configuration: Done `
    )
    await session.endSession()
  }
}
