import { env } from '@events/environment'
import { EventDocument, ActionInput, logger } from '@opencrvs/commons'

export enum ActionConfirmationResponse {
  UnexpectedFailure, // Endpoint fails in an uncontrolled manner
  Rejected, // Synchronous flow failed
  Success, // Synchronous flow succeeded
  RequiresProcessing // Asynchronous flow succeeded, this expects that either the confirm or reject callback is called
}

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

    const body = (await res.json().catch(() => undefined)) as
      | Record<string, unknown>
      | undefined

    return {
      responseStatus,
      body
    }
  } catch (error) {
    logger.error(error)
    return {
      responseStatus: ActionConfirmationResponse.UnexpectedFailure,
      body: undefined
    }
  }
}
