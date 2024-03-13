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

import { svgCode as marriageCertificateTemplateDefault } from '../../utils/marriage-certificate-template-default.js'
import { Db, MongoClient } from 'mongodb'

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      const existingCertificates = await db
        .collection('certificates')
        .find({})
        .toArray()

      if (existingCertificates.length) {
        await db.collection('certificates').insertOne({
          event: 'marriage',
          status: 'ACTIVE',
          svgCode: marriageCertificateTemplateDefault,
          svgDateCreated: Number(new Date()),
          svgDateUpdated: Number(new Date()),
          svgFilename: 'farajaland-marriage-certificate-v1.svg',
          user: 'j.campbell'
        })
      }
    })
  } finally {
    console.log(`Migration - Add Marriage Certificate Configuration: Done.`)
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db.collection('certificates').deleteOne({ event: 'marriage' })
    })
  } finally {
    console.log(
      `Migration - DOWN - Add Marriage Certificate Configuration: Done.`
    )
    await session.endSession()
  }
}
