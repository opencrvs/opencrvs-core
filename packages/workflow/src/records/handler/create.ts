import * as Hapi from '@hapi/hapi'
import {
  BirthRegistration,
  DeathRegistration,
  EVENT_TYPE,
  MarriageRegistration,
  buildFHIRBundle,
  getTrackingId,
  WaitingForValidationRecord
} from '@opencrvs/commons/types'
import {
  modifyRegistrationBundle,
  markBundleAsWaitingValidation,
  markBundleAsValidated
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
// import {
//   getSharedContactMsisdn,
//   getSharedContactEmail
// } from '@workflow/features/registration/fhir/fhir-utils'
import { populateCompositionWithID } from '@workflow/features/registration/handler'
// import { sendCreateRecordNotification } from '@workflow/features/registration/utils'
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
import {
  hasBirthDuplicates,
  hasDeathDuplicates
} from '@workflow/utils/duplicateChecker'

export const requestSchema = z.object({
  event: z.custom<EVENT_TYPE>(),
  details: z.custom<
    BirthRegistration | DeathRegistration | MarriageRegistration
  >()
})

function getCompositionIDFromResponse(
  resBody: fhir3.Bundle<fhir3.BundleEntryResponse>
): string | undefined {
  const compositionValidEntry = resBody.entry?.find(
    (e) =>
      e.response?.location?.startsWith('/fhir/Composition/') &&
      e.response.status === '201'
  )

  // return the Composition's id
  return compositionValidEntry?.response?.location?.split('/')[3]
}

export default async function createRecordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const token = getToken(request)
    const fromRegistrar = hasRegisterScope(request)
    const fromRegAgent = hasValidateScope(request)
    const { details, event } = validateRequest(requestSchema, request.payload)
    const inputBundle = buildFHIRBundle(details, event)
    let bundle = await modifyRegistrationBundle(inputBundle, token)
    if (fromRegistrar) {
      bundle = await markBundleAsWaitingValidation(bundle, token)
    } else if (fromRegAgent) {
      bundle = await markBundleAsValidated(bundle, token)
    }
    const isDuplicate =
      event === EVENT_TYPE.BIRTH
        ? await hasBirthDuplicates(
            { Authorization: request.headers.authorization },
            details
          )
        : event === EVENT_TYPE.DEATH
        ? await hasDeathDuplicates(
            { Authorization: request.headers.authorization },
            details
          )
        : false

    const trackingId = getTrackingId(bundle as WaitingForValidationRecord)
    const resBundle = await sendBundleToHearth(bundle)
    populateCompositionWithID(bundle, resBundle)
    const compositionId = getCompositionIDFromResponse(
      resBundle as fhir3.Bundle<fhir3.BundleEntryResponse>
    )
    if (!compositionId) {
      throw new Error(`FHIR did not return a valid compostion entry`)
    }
    // await createNewAuditEvent(bundle, token)
    await indexBundle(bundle, token)

    if (fromRegistrar) {
      return {
        compositionId,
        trackingId,
        isPotentiallyDuplicate: isDuplicate
      }
    }

    // this is to fix in later PR

    /* sending notification to the contact */
    // const sms = await getSharedContactMsisdn(bundle)
    // const email = await getSharedContactEmail(bundle)
    // if (!sms && !email) {
    //   logger.info('createRecordHandler could not send event notification')
    //   return {
    //     resBundle,
    //     payloadForInvokingValidation: bundle,
    //     isPotentiallyDuplicate: isDuplicate
    //   }
    // }
    // logger.info('createRecordHandler sending event notification')

    // sendCreateRecordNotification(
    //   bundle,
    //   event,
    //   { sms, email },
    //   {
    //     Authorization: request.headers.authorization
    //   }
    // )

    return {
      compositionId,
      trackingId,
      isPotentiallyDuplicate: isDuplicate
    }
  } catch (error) {
    logger.error(`Workflow/createRecordHandler: error: ${error}`)
    throw new Error(error)
  }
}
