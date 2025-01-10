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
import { vi } from 'vitest'
import { resetServer as resetEventsMongoServer } from '@events/storage/mongodb/__mocks__/events'
import { resetServer as resetUserMgntMongoServer } from '@events/storage/mongodb/__mocks__/user-mgnt'

import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  resetServer as resetESServer,
  setupServer as setupESServer
} from '@events/storage/__mocks__/elasticsearch'
import { mswServer } from './msw'

vi.mock('@events/storage/mongodb/events')
vi.mock('@events/storage/mongodb/user-mgnt')

vi.mock('@events/storage/elasticsearch')
vi.mock('@events/service/config/config', () => ({
  getEventConfigurations: () =>
    Promise.all([
      tennisClubMembershipEvent,
      { ...tennisClubMembershipEvent, id: 'TENNIS_CLUB_MEMBERSHIP_PREMIUM' }
    ])
}))

beforeAll(() => Promise.all([setupESServer()]), 100000)
beforeEach(() =>
  Promise.all([
    resetEventsMongoServer(),
    resetUserMgntMongoServer(),
    resetESServer()
  ])
)

beforeAll(() =>
  mswServer.listen({
    onUnhandledRequest: (req) => {
      const elasticRegex = /http:\/\/localhost:55\d{3}\/.*/

      const isElasticResetCall =
        req.method === 'DELETE' && elasticRegex.test(req.url)

      if (!isElasticResetCall) {
        // eslint-disable-next-line no-console
        console.warn(`Unmocked request: ${req.method} ${req.url}`)
      }
    }
  })
)
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())
