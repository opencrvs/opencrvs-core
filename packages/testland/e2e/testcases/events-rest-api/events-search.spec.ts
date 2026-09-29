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
import { expect, test } from '@playwright/test'
import {
  createIntegrationContext,
  EVENT_TYPE,
  fetchClientAPI
} from '@e2e/support/events-rest-api/helpers'

test.describe('POST /api/events/events/search', () => {
  let clientToken: string

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    clientToken = context.clientToken
  })

  test('HTTP 200 with search results', async () => {
    const response = await fetchClientAPI(
      '/api/events/events/search',
      'POST',
      clientToken,
      {
        query: {
          type: 'and',
          clauses: [
            {
              eventType: EVENT_TYPE
            }
          ]
        },
        limit: 5,
        offset: 0
      }
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('results')
    expect(Array.isArray(body.results)).toBe(true)
  })
})
