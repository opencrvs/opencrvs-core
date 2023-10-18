import * as Hapi from '@hapi/hapi'
import { EVENT_TYPE, buildFHIRBundle } from '@opencrvs/commons/types'
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
import { sendCreateRecordNotification } from '@workflow/features/registration/utils'
import { logger } from '@workflow/logger'
import {
  getToken,
  hasRegisterScope,
  hasValidateScope
} from '@workflow/utils/authUtils'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { z } from 'zod'
import { createNewAuditEvent } from '@workflow/records/audit'
import { indexBundle } from '@workflow/records/search'

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
    await createNewAuditEvent(payload, token)
    await indexBundle(payload, token)

    if (fromRegistrar) {
      return { resBundle, payloadForInvokingValidation: payload }
    }

    /* sending notification to the contact */
    const sms = await getSharedContactMsisdn(payload)
    const email = await getSharedContactEmail(payload)
    if (!sms && !email) {
      logger.info('createRecordHandler could not send event notification')
      return { resBundle, payloadForInvokingValidation: payload }
    }
    logger.info('createRecordHandler sending event notification')
    sendCreateRecordNotification(
      payload,
      eventType,
      { sms, email },
      {
        Authorization: request.headers.authorization
      }
    )

    return { resBundle, payloadForInvokingValidation: payload }
  } catch (error) {
    logger.error(`Workflow/createRecordHandler: error: ${error}`)
    throw new Error(error)
  }
}
