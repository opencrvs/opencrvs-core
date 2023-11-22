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
  'Birth Registration',
  'Death Registration',
  'Marriage Registration'
]

const birthRegistrationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Birth Registration',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Birth Registration',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Webhooks -> Birth Registration',
      secured: false,
      host: 'webhooks',
      port: 2525,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Birth Registration',
  urlPattern: '^/events/birth/mark-registered$'
}

const deathRegistrationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Death Registration',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Metrics -> Death Registration',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: ''
    }
  ],
  name: 'Death Registration',
  urlPattern: '^/events/death/mark-registered$'
}

const marriageRegistrationChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      ...routeTemplate,
      name: 'Search -> Marriage Registration',
      host: 'search',
      port: 9090,
      primary: true
    },
    {
      ...routeTemplate,
      name: 'Metrics -> Marriage Registration',
      host: 'metrics',
      port: 1050,
      primary: false
    },
    {
      ...routeTemplate,
      name: 'Webhooks -> Marriage Registration',
      host: 'webhooks',
      port: 2525,
      primary: false
    }
  ],
  name: 'Marriage Registration',
  urlPattern: '^/events/marriage/mark-registered$'
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
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await upsertChannel(db, birthRegistrationChannel)
      await upsertChannel(db, deathRegistrationChannel)
      await upsertChannel(db, marriageRegistrationChannel)
    })
  } finally {
    await session.endSession()
  }
}
