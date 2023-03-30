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
  newChannelTemplate, routeTemplate
} = require('../../utils/openhim-helpers.cjs')


const eventMarkAsDuplicateChannel = {
  ...newChannelTemplate,
  routes: [
    {
      name: 'Metrics -> Marked as duplicate',
      host: 'metrics',
      port: 1050,
      primary: true,
    }
  ],
  name: 'Marked as duplicate',
  urlPattern: '^/events/marked-as-duplicate'
}

exports.up = async (db, client) => {
  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
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
        'Event Not Duplicate',
        'Metrics -> Marked as not duplicate'
      )
    })
    await removeChannel(db, eventMarkAsDuplicateChannel)
  } finally {
    await session.endSession()
  }
};
