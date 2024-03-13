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
import { upsertChannel, Channel } from '../../utils/openhim-helpers.js'
import { Db, MongoClient } from 'mongodb'

const newChannel: Channel = {
  methods: [
    'GET',
    'POST',
    'DELETE',
    'PUT',
    'OPTIONS',
    'HEAD',
    'TRACE',
    'CONNECT',
    'PATCH'
  ],
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
    },
    {
      type: 'http',
      status: 'enabled',
      forwardAuthHeader: true,
      name: 'Webhooks -> Death Registration',
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
  requestBody: true,
  responseBody: true,
  rewriteUrlsConfig: [],
  name: 'Death Registration',
  urlPattern: '^/events/death/mark-registered$',
  matchContentRegex: null,
  matchContentXpath: null,
  matchContentValue: null,
  matchContentJson: null,
  pollingSchedule: null,
  tcpHost: null,
  tcpPort: null,
  alerts: [],
  priority: 1
}

const oldChannel: Channel = {
  methods: [
    'GET',
    'POST',
    'DELETE',
    'PUT',
    'OPTIONS',
    'HEAD',
    'TRACE',
    'CONNECT',
    'PATCH'
  ],
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
  requestBody: true,
  responseBody: true,
  rewriteUrlsConfig: [],
  name: 'Death Registration',
  urlPattern: '^/events/death/mark-registered$',
  matchContentRegex: null,
  matchContentXpath: null,
  matchContentValue: null,
  matchContentJson: null,
  pollingSchedule: null,
  tcpHost: null,
  tcpPort: null,
  alerts: [],
  priority: 1
}

export const up = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await upsertChannel(db, newChannel)
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db: Db, client: MongoClient) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await upsertChannel(db, oldChannel)
    })
  } finally {
    await session.endSession()
  }
}
