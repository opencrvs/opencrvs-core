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
import { Bundle, EVENT_TYPE, Saved, ValidRecord } from '@opencrvs/commons/types'
import { COUNTRY_CONFIG_URL } from '@workflow/constants'
import fetch from 'node-fetch'

const ACTION_NOTIFY_URL = (event: EVENT_TYPE, action: string) =>
  new URL(`events/${event}/actions/${action}`, COUNTRY_CONFIG_URL)

/**
 * Notifies legacy events to country configuration
 * @deprecated
 */
export async function notifyForAction({
  event,
  action,
  record,
  headers
}: {
  event: EVENT_TYPE
  action: string
  record: Saved<ValidRecord>
  headers: Record<string, string>
}) {
  const response = await fetch(ACTION_NOTIFY_URL(event, action), {
    method: 'POST',
    body: JSON.stringify(record),
    headers: {
      'Content-Type': 'application/fhir+json',
      ...headers
    }
  })

  if (!response.ok) {
    throw new Error(
      `Error notifying country-config as POST ${ACTION_NOTIFY_URL(
        event,
        action
      )} [${response.statusText} ${response.status}]: ${response.text()}`
    )
  }

  return response
}

export async function invokeRegistrationValidation(
  bundle: Saved<Bundle>,
  headers: Record<string, string>
): Promise<Bundle> {
  const res = await fetch(
    new URL('event-registration', COUNTRY_CONFIG_URL).toString(),
    {
      method: 'POST',
      body: JSON.stringify(bundle),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  )
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(
      `Error calling country configuration event-registration [${res.statusText} ${res.status}]: ${errorText}`
    )
  }
  return bundle
}
