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
import { inject, vi } from 'vitest'
import { Client } from 'pg'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { getDeclarationFields } from '@opencrvs/commons/events'
import {
  resetServer as resetEventsPostgresServer,
  getPool
} from '@events/storage/postgres/events'

import { createIndex } from '@events/service/indexing/indexing'
import { mswServer } from './msw'
import { createDatabase, initializeSchemaAccess, migrate } from './postgres'

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
  await createIndex(index, getDeclarationFields(tennisClubMembershipEvent))
}

async function resetPostgresServer() {
  const targetDb = `events_${Date.now()}_${Math.random()}`

  const EVENTS_APP_POSTGRES_URI = `postgres://events_app:app_password@${inject('POSTGRES_URI')}/${targetDb}`

  const clusterInitializer = new Client({
    connectionString: `postgres://postgres:postgres@${inject('POSTGRES_URI')}/postgres`
  })
  await clusterInitializer.connect()
  await createDatabase(clusterInitializer, targetDb)
  await clusterInitializer.end()

  const databaseInitializer = new Client({
    connectionString: `postgres://postgres:postgres@${inject('POSTGRES_URI')}/${targetDb}`
  })
  await databaseInitializer.connect()
  await migrate(databaseInitializer)
  await initializeSchemaAccess(databaseInitializer)
  await databaseInitializer.end()

  resetEventsPostgresServer()
  getPool(EVENTS_APP_POSTGRES_URI)
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
afterEach(() => {
  mswServer.resetHandlers()
})
afterAll(() => mswServer.close())
