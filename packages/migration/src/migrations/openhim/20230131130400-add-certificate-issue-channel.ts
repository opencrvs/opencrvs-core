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
  upsertChannel,
  removeChannel,
  newChannelTemplate,
  Channel
} from '../../utils/openhim-helpers.js'

const birthCertificateIssueChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      name: 'Metrics -> Birth Issue',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: '',
      forwardAuthHeader: true,
      status: 'enabled',
      type: 'http'
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Birth Issue',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    }
  ],
  name: 'Birth Issue',
  urlPattern: '^/events/birth/mark-issued$'
}

const deathCertificateIssueChannel: Channel = {
  ...newChannelTemplate,
  routes: [
    {
      name: 'Metrics -> Death Issue',
      secured: false,
      host: 'metrics',
      port: 1050,
      path: '',
      pathTransform: '',
      primary: false,
      username: '',
      password: '',
      forwardAuthHeader: true,
      status: 'enabled',
      type: 'http'
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Search -> Death Issue',
      secured: false,
      host: 'search',
      port: 9090,
      path: '',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    }
  ],
  name: 'Death Issue',
  urlPattern: '^/events/death/mark-issued$'
}

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await upsertChannel(db, birthCertificateIssueChannel)
      await upsertChannel(db, deathCertificateIssueChannel)
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await removeChannel(db, birthCertificateIssueChannel)
      await removeChannel(db, deathCertificateIssueChannel)
    })
  } finally {
    await session.endSession()
  }
}
