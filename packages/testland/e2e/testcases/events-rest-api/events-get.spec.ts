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
import { v4 as uuidv4 } from 'uuid'
import {
  createIntegrationContext,
  EVENT_TYPE,
  fetchClientAPI
} from '@e2e/support/events-rest-api/helpers'

test.describe('GET /api/events/events/{eventId}', () => {
  let clientToken: string
  let healthFacilityId: string

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    clientToken = context.clientToken
    healthFacilityId = context.healthFacilityId
  })

  test('HTTP 200 with event payload', async () => {
    const createEventResponse = await fetchClientAPI(
      '/api/events/events',
      'POST',
      clientToken,
      {
        type: EVENT_TYPE,
        transactionId: uuidv4(),
        createdAtLocation: healthFacilityId
      }
    )

    const createEventBody = await createEventResponse.json()
    const eventId = createEventBody.id

    const response = await fetchClientAPI(
      `/api/events/events/${eventId}`,
      'GET',
      clientToken
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.id).toBe(eventId)
  })
})
