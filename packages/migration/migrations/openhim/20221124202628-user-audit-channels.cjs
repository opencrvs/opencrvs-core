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
} = require('../../utils/openhim-helpers.cjs')

const eventDownloadedChannel = {
  ...newChannelTemplate,
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
  name: 'Event Downloaded',
  urlPattern: '^/events/downloaded$'
}

const eventViewedChannel = {
  ...newChannelTemplate,
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
  name: 'Event Viewed',
  urlPattern: '^/events/viewed$'
}

const declarationUpdatedChannel = {
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


const eventMarkAsDuplicateChannel = {
  ...newChannelTemplate,
  routes: [
    {
      name: 'Metrics -> Marked as duplicate',
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
    }
  ],
  name: 'Marked as duplicate',
  urlPattern: '^/events/marked-as-duplicate'
}

exports.up = async (db, client) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await addRouteToChannel(db, 'Event Assignment', {
        type: 'http',
        status: 'enabled',
        forwardAuthHeader: true,
        name: 'Metrics -> Event Assignment',
        secured: false,
        host: 'metrics',
        port: 1050,
        path: '',
        pathTransform: '',
        primary: false,
        username: '',
        password: ''
      })
      await addRouteToChannel(db, 'Event Unassignment', {
        type: 'http',
        status: 'enabled',
        forwardAuthHeader: true,
        name: 'Metrics -> Event Unassignment',
        secured: false,
        host: 'metrics',
        port: 1050,
        path: '',
        pathTransform: '',
        primary: false,
        username: '',
        password: ''
      })
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

      await addRouteToChannel(db, 'Event Not Duplicate', {
        type: 'http',
        status: 'enabled',
        forwardAuthHeader: true,
        name: 'Metrics -> Marked as not duplicate',
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
      await upsertChannel(db, declarationUpdatedChannel)
      await upsertChannel(db, eventMarkAsDuplicateChannel)

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
        'Event Assignment',
        'Metrics -> Event Assignment'
      )
      await removeRouteFromChannel(
        db,
        'Event Unassignment',
        'Metrics -> Event Unassignment'
      )
    })
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
    await removeChannel(db, eventDownloadedChannel)
    await removeChannel(db, eventViewedChannel)
    await removeChannel(db, declarationUpdatedChannel)
  } finally {
    await session.endSession()
  }
}
