import * as Hapi from 'hapi'
import fetch from 'node-fetch'
import { HEARTH_URL } from 'src/constants'
import {
  modifyRegistrationBundle,
  markBundleAsRegistered,
  markBundleAsCertified,
  setTrackingId
} from './fhir/fhir-bundle-modifier'
import { sendEventNotification } from './utils'
import { EVENT_TYPE } from './fhir/constants'
import { getToken } from 'src/utils/authUtils'
import { postToHearth, getSharedContactMsisdn } from './fhir/fhir-utils'
import { logger } from 'src/logger'

async function sendBundleToHearth(
  payload: fhir.Bundle,
  eventType: EVENT_TYPE,
  count = 1
): Promise<fhir.Bundle> {
  const res = await fetch(HEARTH_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
  if (!res.ok) {
    if (res.status === 409 && count < 5) {
      setTrackingId(payload, eventType)
      return await sendBundleToHearth(payload, eventType, count + 1)
    }

    throw new Error(
      `FHIR post to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }

  return res.json()
}

export async function createRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  eventType: EVENT_TYPE
) {
  try {
    const payload = await modifyRegistrationBundle(
      request.payload as fhir.Bundle,
      eventType,
      getToken(request)
    )

    const resBundle = await sendBundleToHearth(payload, eventType)

    const msisdn = getSharedContactMsisdn(payload)
    /* sending notification to the contact */
    if (msisdn) {
      sendEventNotification(payload, msisdn, eventType, {
        Authorization: request.headers.authorization
      })
    }

    return resBundle
  } catch (error) {
    logger.error(`Workflow/createBirthRegistrationHandler: error: ${error}`)
    throw new Error(error)
  }
}

export async function markEventAsRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  eventType: EVENT_TYPE
) {
  try {
    const payload = await markBundleAsRegistered(
      request.payload as fhir.Bundle & fhir.BundleEntry,
      getToken(request),
      eventType
    )
    // TODO: need to send notification here
    return await postToHearth(payload)
  } catch (error) {
    logger.error(`Workflow/markBirthAsRegisteredHandler: error: ${error}`)
    throw new Error(error)
  }
}

export async function markEventAsCertifiedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const payload = await markBundleAsCertified(
      request.payload as fhir.Bundle,
      getToken(request)
    )
    return await postToHearth(payload)
  } catch (error) {
    logger.error(`Workflow/markBirthAsCertifiedHandler: error: ${error}`)
    throw new Error(error)
  }
}
