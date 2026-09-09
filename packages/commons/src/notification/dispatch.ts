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

import { joinUrl } from '../url'
import { logger } from '../logger'
import { TriggerEvent, TriggerPayload } from './UserNotifications'

/*
 * Every event carries an Authorization header. Interactive flows forward the
 * acting user's token; the background announcement worker fetches a service
 * token first (see getServiceToken in the events service). This lets country
 * configs require authentication on all `/trigger/user/*` routes.
 */
export async function triggerUserEventNotification<T extends TriggerEvent>({
  event,
  payload,
  countryConfigUrl,
  authHeader
}: {
  event: T
  payload: TriggerPayload[T]
  countryConfigUrl: string
  authHeader: { Authorization: string }
}): Promise<Response> {
  const response = await fetch(
    joinUrl(countryConfigUrl, `trigger/user/${event}`),
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    }
  )

  /*
   * Checked here rather than per caller: most callers never inspect `.ok`, and
   * the fire-and-forget one cannot. A 404 from an unregistered trigger route
   * would otherwise vanish silently. The body is left unread so callers that
   * consume it still can.
   *
   * Logs the event and status only — the recipient must never reach the log.
   */
  if (!response.ok) {
    logger.error(
      `triggerUserEventNotification: dispatch failed for event "${event}" with status ${response.status}`
    )
  }

  return response
}
