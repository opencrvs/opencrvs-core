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
import { EventDocument, logger, ActionType } from '@opencrvs/commons'
import { env } from '@events/environment'

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
  actionType: ActionType,
  transactionId: string,
  event: EventDocument,
  token: string
): Promise<{
  responseStatus: ActionConfirmationResponse
  body: Record<string, unknown> | undefined
}> {
  const actionConfirmationUrl = new URL(
    `/trigger/events/${event.type}/actions/${actionType}`,
    env.COUNTRY_CONFIG_URL
  )

  logger.debug(
    {
      url: actionConfirmationUrl,
      eventType: event.type,
      actionType,
      eventId: event.id,
      transactionId
    },
    `Action confirmation request`
  )

  try {
    const res = await fetch(actionConfirmationUrl, {
      method: 'POST',
      body: JSON.stringify(event),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    })

    const statusCode = res.status
    const responseStatus =
      statusCode in ActionConfirmationResponseCodes
        ? ActionConfirmationResponseCodes[
            statusCode as keyof typeof ActionConfirmationResponseCodes
          ]
        : ActionConfirmationResponse.UnexpectedFailure

    logger.debug(
      {
        url: actionConfirmationUrl,
        eventType: event.type,
        actionType,
        eventId: event.id,
        transactionId
      },
      `Action confirmation response: ${statusCode} - ${responseStatus}`
    )

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
