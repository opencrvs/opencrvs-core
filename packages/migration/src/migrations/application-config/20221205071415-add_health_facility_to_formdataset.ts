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

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      // Adding Health Facility
      await db.collection('formdatasets').updateOne(
        {
          resource: 'HEALTH_FACILITY'
        },
        {
          $set: {
            options: [],
            resource: 'HEALTH_FACILITY',
            fileName: 'Health Facility'
          }
        },
        {
          upsert: true
        }
      )

      // Adding State
      await db.collection('formdatasets').updateOne(
        {
          resource: 'STATE'
        },
        {
          $set: {
            options: [],
            resource: 'STATE',
            fileName: 'State'
          }
        },
        {
          upsert: true
        }
      )

      // Adding District
      await db.collection('formdatasets').updateOne(
        {
          resource: 'DISTRICT'
        },
        {
          $set: {
            options: [],
            resource: 'DISTRICT',
            fileName: 'District'
          }
        },
        {
          upsert: true
        }
      )

      // Adding LOCATION_LEVEL_3
      await db.collection('formdatasets').updateOne(
        {
          resource: 'LOCATION_LEVEL_3'
        },
        {
          $set: {
            options: [],
            resource: 'LOCATION_LEVEL_3',
            fileName: 'Location Level 3'
          }
        },
        {
          upsert: true
        }
      )

      // Adding LOCATION_LEVEL_4
      await db.collection('formdatasets').updateOne(
        {
          resource: 'LOCATION_LEVEL_4'
        },
        {
          $set: {
            options: [],
            resource: 'LOCATION_LEVEL_4',
            fileName: 'Location Level 4'
          }
        },
        {
          upsert: true
        }
      )

      // Adding LOCATION_LEVEL_5
      await db.collection('formdatasets').updateOne(
        {
          resource: 'LOCATION_LEVEL_5'
        },
        {
          $set: {
            options: [],
            resource: 'LOCATION_LEVEL_5',
            fileName: 'Location Level 4'
          }
        },
        {
          upsert: true
        }
      )
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {}
