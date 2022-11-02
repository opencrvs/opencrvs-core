/*
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration
& Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
graphic logo are (registered/a) trademark(s) of Plan International.
*/
exports.upsertChannel = async (db, channel) => {
  await db.collection('channels').updateOne(
    { name: channel.name },
    { $set: channel },
    {
      upsert: true
    }
  )
}

exports.removeChannel = async (db, channel) => {
  await db.collection('channels').deleteOne({ name: channel.name })
}

exports.addRouteToChannel = async (db, channelName, route) => {
  await db
    .collection('channels')
    .updateOne({ name: channelName }, { $push: { routes: route } })
}

exports.removeRouteFromChannel = async (db, channelName, routeName) => {
  await db
    .collection('channels')
    .updateOne(
      { name: channelName },
      { $pull: { routes: { name: routeName } } }
    )
}
