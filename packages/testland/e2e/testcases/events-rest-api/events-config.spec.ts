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
  fetchClientAPI
} from '@e2e/support/events-rest-api/helpers'

test.describe('GET /api/events/config', () => {
  let clientToken: string

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    clientToken = context.clientToken
  })

  test('HTTP 200 with config payload', async () => {
    const response = await fetchClientAPI(
      '/api/events/config',
      'GET',
      clientToken
    )

    expect(response.status).toBe(200)
    const body = await response.json()

    if (Array.isArray(body)) {
      expect(body.length).toBeGreaterThan(0)
      expect(body[0]).toHaveProperty('id')
    } else {
      expect(body).toHaveProperty('id')
    }
  })
})
