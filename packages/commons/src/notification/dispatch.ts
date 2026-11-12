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
import { CoreSigningKey, withCoreSignature } from '../request-signing/signature'
import { TriggerEvent, TriggerPayload } from './UserNotifications'

/*
 * Core signs every event (see `withCoreSignature`) and sends no user token, so
 * country configs can accept `/trigger/user/*` from core alone with
 * `auth: 'core'`.
 */
export async function triggerUserEventNotification<T extends TriggerEvent>({
  event,
  payload,
  countryConfigUrl,
  signingKey
}: {
  event: T
  payload: TriggerPayload[T]
  countryConfigUrl: string
  signingKey: CoreSigningKey
}): Promise<Response> {
  const url = joinUrl(countryConfigUrl, `trigger/user/${event}`)
  const response = await fetch(
    url,
    withCoreSignature(signingKey, url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    })
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
