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
import { ValidRecord } from '@opencrvs/commons/types'
import { COUNTRY_CONFIG_URL } from '@workflow/constants'
import { RecordEvent } from '@workflow/records/record-events'

const EVENT_URL = (event: RecordEvent) =>
  new URL(`/events/${event}`, COUNTRY_CONFIG_URL)

export const triggerEvent = async (
  event: RecordEvent,
  record: ValidRecord,
  headers: Record<string, string>
) => {
  const response = await fetch(EVENT_URL(event), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({ event, record })
  })

  return response
}
