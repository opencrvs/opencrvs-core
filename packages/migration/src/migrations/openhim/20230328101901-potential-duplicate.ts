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
import {
  addRouteToChannel,
  removeRouteFromChannel,
  upsertChannel,
  removeChannel,
  newChannelTemplate,
  routeTemplate,
  Channel
} from '../../utils/openhim-helpers.js'
import { Db, MongoClient } from 'mongodb'

const eventMarkAsDuplicateChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Metrics -> Marked as duplicate',
      host: 'metrics',
      port: 1050,
      primary: true
    }
  ],
  name: 'Marked as duplicate',
  urlPattern: '^/events/marked-as-duplicate'
}

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await addRouteToChannel(db, 'Event Not Duplicate', {
        ...routeTemplate,
        name: 'Metrics -> Marked as not duplicate',
        host: 'metrics',
        port: 1050,
        primary: false
      })
      await upsertChannel(db, eventMarkAsDuplicateChannel)
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await removeRouteFromChannel(
        db,
        'Event Not Duplicate',
        'Metrics -> Marked as not duplicate'
      )
    })
    await removeChannel(db, eventMarkAsDuplicateChannel)
  } finally {
    await session.endSession()
  }
}
