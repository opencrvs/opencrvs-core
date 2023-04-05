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
  removeRouteFromChannel
} = require('../../utils/openhim-helpers.cjs')

exports.up = async (db, client) => {
  // TODO write your migration here.
  // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script

  const session = client.startSession()
  try {
    await session.withTransaction(async () => {
      await addRouteToChannel(db, 'Birth Certification', {
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
      })
      await addRouteToChannel(db, 'Death Certification', {
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
      })
    })
  } finally {
    await session.endSession()
  }
}

exports.down = async (db, client) => {
  try {
    await session.withTransaction(async () => {
      await removeRouteFromChannel(
        db,
        'Birth Certification',
        'Webhooks -> Death Registration'
      )
      await removeRouteFromChannel(
        db,
        'Birth Certification',
        'Webhooks -> Death Registration'
      )
    })
  } finally {
    await session.endSession()
  }
}
