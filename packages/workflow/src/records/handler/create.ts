import * as Hapi from '@hapi/hapi'
import { EVENT_TYPE, Saved, buildFHIRBundle } from '@opencrvs/commons/types'
import {
  modifyRegistrationBundle,
  markBundleAsWaitingValidation,
  markBundleAsValidated
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import {
  getSharedContactMsisdn,
  getSharedContactEmail
} from '@workflow/features/registration/fhir/fhir-utils'
import { populateCompositionWithID } from '@workflow/features/registration/handler'
import {
  isEventNonNotifiable,
  sendEventNotification
} from '@workflow/features/registration/utils'
import { logger } from '@workflow/logger'
import {
  getToken,
  hasRegisterScope,
  hasValidateScope
} from '@workflow/utils/authUtils'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { z } from 'zod'

export const requestSchema = z.object({
  eventType: z.custom<EVENT_TYPE>(),
  details: z.any() // TBD Later
})

type Payload = z.infer<typeof requestSchema>

export default async function createRecordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const token = getToken(request)
    const fromRegistrar = hasRegisterScope(request)
    const fromRegAgent = hasValidateScope(request)
    const { details, eventType } = request.payload as Payload
    const fhirBundle = buildFHIRBundle(details, eventType)
    let payload = await modifyRegistrationBundle(fhirBundle, token)
    if (fromRegistrar) {
      payload = await markBundleAsWaitingValidation(payload, token)
    } else if (fromRegAgent) {
      payload = await markBundleAsValidated(payload, token)
    }
    const resBundle = await sendBundleToHearth(payload)
    populateCompositionWithID(payload, resBundle)

    if (isEventNonNotifiable(event)) {
      return { resBundle, payloadForInvokingValidation: payload }
    }

    /* sending notification to the contact */
    const sms = await getSharedContactMsisdn(payload)
    const email = await getSharedContactEmail(payload)
    if (!sms && !email) {
      logger.info('createRegistrationHandler could not send event notification')
      return { resBundle, payloadForInvokingValidation: payload }
    }
    logger.info('createRegistrationHandler sending event notification')
    sendEventNotification(
      payload,
      event,
      { sms, email },
      {
        Authorization: request.headers.authorization
      }
    )
    return { resBundle, payloadForInvokingValidation: payload }
  } catch (error) {
    logger.error(
      `Workflow/createRegistrationHandler[${event}]: error: ${error}`
    )
    throw new Error(error)
  }
}
