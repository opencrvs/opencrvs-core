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
      await db.collection('Task').updateMany(
        {
          extension: {
            $elemMatch: {
              url: 'http://opencrvs.org/specs/extension/requestCorrection'
            }
          }
        },
        {
          $set: {
            'extension.$[elem].url':
              'http://opencrvs.org/specs/extension/makeCorrection'
          }
        },
        {
          arrayFilters: [
            {
              'elem.url':
                'http://opencrvs.org/specs/extension/requestCorrection'
            }
          ]
        }
      )
      await db.collection('Task_history').updateMany(
        {
          extension: {
            $elemMatch: {
              url: 'http://opencrvs.org/specs/extension/requestCorrection'
            }
          }
        },
        {
          $set: {
            'extension.$[elem].url':
              'http://opencrvs.org/specs/extension/makeCorrection'
          }
        },
        {
          arrayFilters: [
            {
              'elem.url':
                'http://opencrvs.org/specs/extension/requestCorrection'
            }
          ]
        }
      )
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await db.collection('Task').updateMany(
        {
          extension: {
            $elemMatch: {
              url: 'http://opencrvs.org/specs/extension/makeCorrection'
            }
          }
        },
        {
          $set: {
            'extension.$[elem].url':
              'http://opencrvs.org/specs/extension/requestCorrection'
          }
        },
        {
          arrayFilters: [
            {
              'elem.url': 'http://opencrvs.org/specs/extension/makeCorrection'
            }
          ]
        }
      )
      await db.collection('Task_history').updateMany(
        {
          extension: {
            $elemMatch: {
              url: 'http://opencrvs.org/specs/extension/makeCorrection'
            }
          }
        },
        {
          $set: {
            'extension.$[elem].url':
              'http://opencrvs.org/specs/extension/requestCorrection'
          }
        },
        {
          arrayFilters: [
            {
              'elem.url': 'http://opencrvs.org/specs/extension/makeCorrection'
            }
          ]
        }
      )
    })
  } finally {
    await session.endSession()
  }
}
