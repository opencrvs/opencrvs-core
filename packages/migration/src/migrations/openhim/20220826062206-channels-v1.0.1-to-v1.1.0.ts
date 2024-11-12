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
  Channel
} from '../../utils/openhim-helpers.js'

const newChannel: Channel = {
  methods: ['POST'],
  type: 'http',
  allow: [],
  whitelist: [],
  authType: 'public',
  matchContentTypes: [],
  properties: [],
  txViewAcl: [],
  txViewFullAcl: [],
  txRerunAcl: [],
  status: 'enabled',
  rewriteUrls: false,
  addAutoRewriteRules: true,
  autoRetryEnabled: false,
  autoRetryPeriodMinutes: 60,
  routes: [
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Confirm Registration',
      secured: false,
      host: 'workflow',
      port: 5050,
      path: '/confirm/registration',
      pathTransform: '',
      primary: true,
      username: '',
      password: ''
    }
  ],
  requestBody: true,
  responseBody: true,
  rewriteUrlsConfig: [],
  name: 'Confirm Registration',
  description: 'Confirm registration & assign a BRN',
  urlPattern: '^/confirm/registration$',
  priority: 1,
  maxBodyAgeDays: 30,
  matchContentRegex: null,
  matchContentXpath: null,
  matchContentValue: null,
  matchContentJson: null,
  pollingSchedule: null,
  tcpHost: null,
  tcpPort: null,
  alerts: []
}

export async function up(db: Db, client: MongoClient): Promise<void> {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await upsertChannel(db, newChannel)
    })
  } finally {
    await session.endSession()
  }
}

export async function down(db: Db, client: MongoClient): Promise<void> {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await removeChannel(db, newChannel)
    })
  } finally {
    await session.endSession()
  }
}
