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
  removeRouteFromChannel,
  upsertChannel,
  removeChannel,
  newChannelTemplate
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require('../../utils/openhim-helpers.cjs')

const birthCertificateIssueChannel = {
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

const deathCertificateIssueChannel = {
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

exports.up = async (db, client) => {
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

exports.down = async (db, client) => {
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
