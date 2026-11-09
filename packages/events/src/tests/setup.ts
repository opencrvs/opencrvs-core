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
import { Client, Pool } from 'pg'
import { inject, vi } from 'vitest'
import { getDeclarationFields } from '@opencrvs/commons/events'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  getPool,
  resetServer as resetEventsPostgresServer
} from '@events/storage/postgres/events'

import { createIndex } from '@events/service/indexing/indexing'
import { getReindexingStatusIndexName } from '@events/storage/__mocks__/elasticsearch'
import { mswServer } from './msw'
import {
  createDatabase,
  dropDatabase,
  initializeSchemaAccess,
  migrate
} from './postgres'

vi.mock('@events/storage/mongodb/user-mgnt')
vi.mock('@events/storage/elasticsearch')

async function resetESServer() {
  const { getEventIndexName, getEventAliasName } = await import(
    // @ts-expect-error - "Cannot find module '@events/storage/elasticsearch' or its corresponding type declarations."
    '@events/storage/elasticsearch'
  )
  const index = 'events_tennis_club_membership' + Date.now() + Math.random()
  getEventIndexName.mockReturnValue(index)
  getEventAliasName.mockReturnValue('events_' + +Date.now() + Math.random())
  getReindexingStatusIndexName.mockReturnValue(
    'reindexing_status_' + Date.now() + Math.random()
  )
  await createIndex(index, getDeclarationFields(tennisClubMembershipEvent))
}

// Database created for the test currently running. Tracked so it can be
// dropped afterwards — every test creates its own database, and without the
// drop a full run leaves behind ~8MB per test, filling up the CI runner.
let currentDb: string | null = null

// The pool handed to the code under test, kept so this file can close it.
// resetServer only drops the module's reference to it.
let currentPool: Pool | null = null

function getClusterClient() {
  return new Client({
    connectionString: `postgres://postgres:postgres@${inject('POSTGRES_URI')}/postgres`
  })
}

async function dropPostgresDatabase() {
  if (currentDb === null) {
    return
  }

  // End the pool before its database goes away: DROP DATABASE refuses while a
  // session is connected, and FORCE terminating one server-side surfaces as an
  // unhandled 'error' on a pool that has no error listener.
  if (currentPool !== null) {
    await currentPool.end()
    currentPool = null
  }
  resetEventsPostgresServer()

  const clusterClient = getClusterClient()
  await clusterClient.connect()
  await dropDatabase(clusterClient, currentDb)
  await clusterClient.end()

  currentDb = null
}

async function resetPostgresServer() {
  const targetDb = `events_${Date.now()}_${Math.random()}`

  const EVENTS_APP_POSTGRES_URI = `postgres://events_app:app_password@${inject('POSTGRES_URI')}/${targetDb}`

  const clusterInitializer = getClusterClient()
  await clusterInitializer.connect()
  await createDatabase(clusterInitializer, targetDb)
  // Set before migrating so a failed migration still leaves a droppable name.
  currentDb = targetDb
  await clusterInitializer.end()

  const databaseInitializer = new Client({
    connectionString: `postgres://postgres:postgres@${inject('POSTGRES_URI')}/${targetDb}`
  })
  await databaseInitializer.connect()
  await migrate(databaseInitializer)
  await initializeSchemaAccess(databaseInitializer)
  await databaseInitializer.end()

  resetEventsPostgresServer()
  currentPool = getPool(EVENTS_APP_POSTGRES_URI)
}

beforeEach(async () => Promise.all([resetPostgresServer(), resetESServer()]))

beforeAll(() =>
  mswServer.listen({
    onUnhandledRequest: (req) => {
      const isElasticResetCall =
        req.method === 'DELETE' && req.url.includes(inject('ELASTICSEARCH_URI'))

      if (!isElasticResetCall) {
        // eslint-disable-next-line no-console
        console.warn(`Unmocked request: ${req.method} ${req.url}`)
      }
    }
  })
)
afterEach(async () => {
  mswServer.resetHandlers()
  await dropPostgresDatabase()
})
afterAll(() => mswServer.close())
