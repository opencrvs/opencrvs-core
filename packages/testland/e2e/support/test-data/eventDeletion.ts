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
import { test } from '@playwright/test'
import { getToken } from '@e2e/support/helpers'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { createClient } from '@opencrvs/toolkit/api'

async function deleteEvent(token: string, eventId: string) {
  const client = createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)

  await client.event.delete.mutate({ eventId })
}

export function trackAndDeleteCreatedEvents() {
  const createdEventIds: string[] = []
  let token: string

  test.beforeEach(async ({ page }) => {
    token = await getToken(CREDENTIALS.REGISTRAR)

    page.on('response', async (response) => {
      if (
        response.status() === 200 &&
        response.url().includes('/api/events/event.create')
      ) {
        try {
          const resBody = await response.json()
          createdEventIds.push(resBody.result.data.json.id)
        } catch (e) {
          // Do nothing
        }
      }
    })
  })

  test.afterAll(async () => {
    await Promise.allSettled(
      createdEventIds.map((eventId) => deleteEvent(token, eventId))
    )
  })
}
