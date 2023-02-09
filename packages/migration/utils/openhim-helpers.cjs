/*
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration
& Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
graphic logo are (registered/a) trademark(s) of Plan International.
*/
exports.upsertChannel = async (db, channel, session) => {
  await db.collection('channels').updateOne(
    { name: channel.name },
    { $set: channel },
    {
      upsert: true,
      session
    }
  )
}

exports.removeChannel = async (db, channel, session) => {
  await db.collection('channels').deleteOne({ name: channel.name }, { session })
}

exports.addRouteToChannel = async (db, channelName, route, session) => {
  await db
    .collection('channels')
    .updateOne({ name: channelName }, { $push: { routes: route } }, { session })
}

exports.removeRouteFromChannel = async (
  db,
  channelName,
  routeName,
  session
) => {
  await db
    .collection('channels')
    .updateOne(
      { name: channelName },
      { $pull: { routes: { name: routeName } } },
      { session }
    )
}

exports.newChannelTemplate = {
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
  requestBody: true,
  responseBody: true,
  rewriteUrlsConfig: [],
  matchContentRegex: null,
  matchContentXpath: null,
  matchContentValue: null,
  matchContentJson: null,
  pollingSchedule: null,
  tcpHost: null,
  tcpPort: null,
  alerts: [],
  priority: 1,
  maxBodyAgeDays: 30
}
