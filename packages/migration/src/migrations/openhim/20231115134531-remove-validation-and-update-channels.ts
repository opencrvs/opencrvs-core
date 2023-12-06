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
import {
  Channel,
  newChannelTemplate,
  removeChannel,
  routeTemplate,
  upsertChannel
} from '../../utils/openhim-helpers.js'

const channelsToRemove = [
  'Birth Validation',
  'Death Validation',
  'Marriage Validation',
  'Declaration Updated'
]

const birthValidationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Birth Validation',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics > Birth Validation',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'Birth Validation',
  urlPattern: '^/events/birth/mark-validated$'
}

const deathValidationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Death Validation',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics > Death Validation',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'Death Validation',
  urlPattern: '^/events/death/mark-validated$'
}

const marriageValidationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Marriage Validation',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> Marriage Validation',
      host: 'metrics',
      port: 1050,
      primary: false
    }
  ],
  name: 'Marriage Validation',
  urlPattern: '^/events/marriage/mark-validated$'
}

const declarationUpdatedChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Declaration Updated',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    }
  ],
  name: 'Declaration Updated',
  urlPattern: '^/events/declaration-updated$'
}

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await Promise.all(
        channelsToRemove.map((channelName) =>
          removeChannel(db, { name: channelName })
        )
      )
    })
  } catch (err) {
    console.log(err)
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await upsertChannel(db, birthValidationChannel)
      await upsertChannel(db, deathValidationChannel)
      await upsertChannel(db, marriageValidationChannel)
      await upsertChannel(db, declarationUpdatedChannel)
    })
  } catch (err) {
    console.log(err)
  } finally {
    await session.endSession()
  }
}
