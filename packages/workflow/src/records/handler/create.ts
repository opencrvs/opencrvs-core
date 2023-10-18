import * as Hapi from '@hapi/hapi'
import {
  BirthRegistration,
  DeathRegistration,
  EVENT_TYPE,
  MarriageRegistration,
  buildFHIRBundle
} from '@opencrvs/commons/types'
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
// import { createNewAuditEvent } from '@workflow/records/audit'
import { indexBundle } from '@workflow/records/search'
import { validateRequest } from '@workflow/utils'

export const requestSchema = z.object({
  event: z.custom<EVENT_TYPE>(),
  details: z.custom<
    BirthRegistration | DeathRegistration | MarriageRegistration
  >()
})

export default async function createRecordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const token = getToken(request)
    const fromRegistrar = hasRegisterScope(request)
    const fromRegAgent = hasValidateScope(request)
    const payload = validateRequest(requestSchema, request.payload)
    const { details, event } = payload
    const fhirBundle = buildFHIRBundle(details, event)
    let bundle = await modifyRegistrationBundle(fhirBundle, token)
    if (fromRegistrar) {
      bundle = await markBundleAsWaitingValidation(bundle, token)
    } else if (fromRegAgent) {
      bundle = await markBundleAsValidated(bundle, token)
    }
    const resBundle = await sendBundleToHearth(bundle)
    populateCompositionWithID(bundle, resBundle)
    // await createNewAuditEvent(bundle, token)
    await indexBundle(bundle, token)

    if (fromRegistrar) {
      return { resBundle, payloadForInvokingValidation: bundle }
    }

    /* sending notification to the contact */
    const sms = await getSharedContactMsisdn(bundle)
    const email = await getSharedContactEmail(bundle)
    if (!sms && !email) {
      logger.info('createRecordHandler could not send event notification')
      return { resBundle, payloadForInvokingValidation: bundle }
    }
    logger.info('createRecordHandler sending event notification')
    sendCreateRecordNotification(
      bundle,
      event,
      { sms, email },
      {
        Authorization: request.headers.authorization
      }
    )

    return { resBundle, payloadForInvokingValidation: bundle }
  } catch (error) {
    logger.error(`Workflow/createRecordHandler: error: ${error}`)
    throw new Error(error)
  }
}
