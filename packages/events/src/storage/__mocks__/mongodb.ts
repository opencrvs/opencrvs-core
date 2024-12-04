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
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'

let server: MongoMemoryServer
let client: MongoClient
let databaseName = 'events_' + Date.now()

export async function setupServer() {
  if (!server) {
    server = await MongoMemoryServer.create()
  }

  return server
}

export async function resetServer() {
  databaseName = 'events_' + Date.now()
}

export async function getClient() {
  const uri = server.getUri()
  if (!client) {
    client = new MongoClient(uri)
  }

  await client.connect()

  return client.db(databaseName)
}
