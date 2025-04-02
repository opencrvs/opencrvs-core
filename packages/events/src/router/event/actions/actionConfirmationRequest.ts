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
import { env } from '@events/environment'
import { EventDocument, ActionInput, logger } from '@opencrvs/commons'

export const ActionConfirmationResponse = {
  UnexpectedFailure: 'UnexpectedFailure', // Endpoint fails in an uncontrolled manner
  Rejected: 'Rejected', // Synchronous flow failed
  Success: 'Success', // Synchronous flow succeeded
  RequiresProcessing: 'RequiresProcessing' // Asynchronous flow succeeded, this expects that either the confirm or reject callback is called
} as const

export type ActionConfirmationResponse = keyof typeof ActionConfirmationResponse

const ActionConfirmationResponseCodes = {
  400: ActionConfirmationResponse.Rejected,
  200: ActionConfirmationResponse.Success,
  202: ActionConfirmationResponse.RequiresProcessing
} as const

export async function requestActionConfirmation(
  action: ActionInput,
  event: EventDocument,
  token: string,
  actionId: string
): Promise<{
  responseStatus: ActionConfirmationResponse
  body: Record<string, unknown> | undefined
}> {
  try {
    const res = await fetch(
      new URL(
        `/events/${event.type}/actions/${action.type}`,
        env.COUNTRY_CONFIG_URL
      ),
      {
        method: 'POST',
        body: JSON.stringify({ event, actionId, action }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      }
    )

    const status = res.status
    const responseStatus =
      status in ActionConfirmationResponseCodes
        ? ActionConfirmationResponseCodes[
            status as keyof typeof ActionConfirmationResponseCodes
          ]
        : ActionConfirmationResponse.UnexpectedFailure

    return {
      responseStatus,
      body: await res.json().catch(() => undefined)
    }
  } catch (error) {
    logger.error(error)
    return {
      responseStatus: ActionConfirmationResponse.UnexpectedFailure,
      body: undefined
    }
  }
}
