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
import fetch from 'node-fetch'
import { EVENT_TYPE, RegisteredRecord } from '@opencrvs/commons/types'
import { WEBHOOKS_URL } from '@workflow/constants'

const WEBHOOK_URLS = {
  [EVENT_TYPE.BIRTH]: new URL('/events/birth/mark-registered', WEBHOOKS_URL),
  [EVENT_TYPE.DEATH]: new URL('/events/death/mark-registered', WEBHOOKS_URL),
  [EVENT_TYPE.MARRIAGE]: new URL(
    '/events/marriage/mark-registered',
    WEBHOOKS_URL
  )
} satisfies Record<EVENT_TYPE, URL>

export const invokeWebhooks = async ({
  bundle,
  token,
  event
}: {
  bundle: RegisteredRecord
  token: string
  event: EVENT_TYPE
}) => {
  const request = await fetch(WEBHOOK_URLS[event], {
    method: 'POST',
    body: JSON.stringify(bundle),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (!request.ok) {
    throw new Error(
      `Dispatching webhook failed with [${
        request.status
      }] body: ${await request.text()}`
    )
  }

  return request
}
