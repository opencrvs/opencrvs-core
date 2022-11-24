/*
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration
& Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
graphic logo are (registered/a) trademark(s) of Plan International.
*/
const {
  addRouteToChannel,
  removeRouteFromChannel, upsertChannel
} = require('../../utils/openhim-helpers.cjs')

const eventDownloadedChannel = {
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
      name: 'Metrics -> Event Downloaded',
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
  requestBody: true,
  responseBody: true,
  rewriteUrlsConfig: [],
  name: 'Event Downloaded',
  urlPattern: '^/events/downloaded$',
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
const eventViewedChannel = {
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
      name: 'Metrics -> Event Viewed',
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
  requestBody: true,
  responseBody: true,
  rewriteUrlsConfig: [],
  name: 'Event Viewed',
  urlPattern: '^/events/viewed$',
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


exports.up = async (db, client) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await addRouteToChannel(db, 'Birth Archive', {
        type: 'http',
        status: 'enabled',
        forwardAuthHeader: true,
        name: 'Metrics -> Birth Archive',
        secured: false,
        host: 'metrics',
        port: 1050,
        path: '',
        pathTransform: '',
        primary: false,
        username: '',
        password: ''
      })
      await addRouteToChannel(db, 'Birth Reinstate', {
        type: 'http',
        status: 'enabled',
        forwardAuthHeader: true,
        name: 'Metrics -> Birth Reinstate',
        secured: false,
        host: 'metrics',
        port: 1050,
        path: '',
        pathTransform: '',
        primary: false,
        username: '',
        password: ''
      })
      await addRouteToChannel(db, 'Death Archive', {
        type: 'http',
        status: 'enabled',
        forwardAuthHeader: true,
        name: 'Metrics -> Death Archive',
        secured: false,
        host: 'metrics',
        port: 1050,
        path: '',
        pathTransform: '',
        primary: false,
        username: '',
        password: ''
      })
      await addRouteToChannel(db, 'Death Reinstate', {
        type: 'http',
        status: 'enabled',
        forwardAuthHeader: true,
        name: 'Metrics -> Death Reinstate',
        secured: false,
        host: 'metrics',
        port: 1050,
        path: '',
        pathTransform: '',
        primary: false,
        username: '',
        password: ''
      })

      await upsertChannel(db, eventDownloadedChannel)
      await upsertChannel(db, eventViewedChannel)

    })
  } finally {
    await session.endSession()
  }
}


exports.down = async (db, client) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await removeRouteFromChannel(
        db,
        'Birth Archive',
        'Metrics -> Birth Archive'
      )
      await removeRouteFromChannel(
        db,
        'Birth Reinstate',
        'Metrics -> Birth Reinstate'
      )
      await removeRouteFromChannel(
        db,
        'Death Archive',
        'Metrics -> Death Archive'
      )
      await removeRouteFromChannel(
        db,
        'Death Reinstate',
        'Metrics -> Death Reinstate'
      )
      await upsertChannel(db, eventDownloadedChannel)
      await upsertChannel(db, eventViewedChannel)
    })
  } finally {
    await session.endSession()
  }
}

