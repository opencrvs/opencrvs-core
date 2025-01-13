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
import { resetServer as resetMongoServer } from '@events/storage/__mocks__/mongodb'
import { inject, vi } from 'vitest'

import { createIndex } from '@events/service/indexing/indexing'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { mswServer } from './msw'

vi.mock('@events/storage/mongodb')
vi.mock('@events/storage/elasticsearch')
vi.mock('@events/service/config/config', () => ({
  getEventConfigurations: () =>
    Promise.all([
      tennisClubMembershipEvent,
      { ...tennisClubMembershipEvent, id: 'TENNIS_CLUB_MEMBERSHIP_PREMIUM' }
    ])
}))

async function resetServer() {
  // @ts-ignore "Cannot find module '@events/storage/elasticsearch' or its corresponding type declarations."
  const { getEventIndexName } = await import('@events/storage/elasticsearch')
  const index = 'events' + Date.now() + Math.random()
  getEventIndexName.mockReturnValue(index)
  await createIndex(index)
}

beforeEach(async () => {
  return Promise.all([resetMongoServer(), resetServer()])
})

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
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())
