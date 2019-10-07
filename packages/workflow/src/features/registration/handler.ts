import { HEARTH_URL } from '@workflow/constants'
import { Events } from '@workflow/features/events/handler'
import {
  markBundleAsCertified,
  markBundleAsRegistered,
  markBundleAsValidated,
  modifyRegistrationBundle,
  setTrackingId
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import {
  getSharedContactMsisdn,
  postToHearth
} from '@workflow/features/registration/fhir/fhir-utils'
import { sendEventNotification } from '@workflow/features/registration/utils'
import { logger } from '@workflow/logger'
import { getToken } from '@workflow/utils/authUtils'
import * as Hapi from 'hapi'
import fetch from 'node-fetch'

async function sendBundleToHearth(
  payload: fhir.Bundle,
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
      setTrackingId(payload)
      return await sendBundleToHearth(payload, count + 1)
    }

    throw new Error(
      `FHIR post to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }

  return res.json()
}

function populateCompositionWithID(
  payload: fhir.Bundle,
  response: fhir.Bundle
) {
  if (
    payload &&
    payload.entry &&
    payload.entry[0].resource &&
    payload.entry[0].resource.resourceType === 'Composition'
  ) {
    if (!payload.entry[0].resource.id) {
      payload.entry[0].resource.id =
        response &&
        response.entry &&
        response.entry[0].response &&
        response.entry[0].response.location &&
        response.entry[0].response.location.split('/')[3]
    }
  }
}

export async function createRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  event: Events
) {
  try {
    let payload = await modifyRegistrationBundle(
      request.payload as fhir.Bundle,
      getToken(request)
    )
    if (event === Events.BIRTH_NEW_REG || event === Events.DEATH_NEW_REG) {
      payload = await markBundleAsRegistered(
        payload as fhir.Bundle,
        getToken(request)
      )
    } else if (
      event === Events.BIRTH_NEW_VALIDATE ||
      event === Events.DEATH_NEW_VALIDATE
    ) {
      payload = await markBundleAsValidated(
        payload as fhir.Bundle,
        getToken(request)
      )
    }
    const resBundle = await sendBundleToHearth(payload)
    populateCompositionWithID(payload, resBundle)

    if (
      event === Events.BIRTH_IN_PROGRESS_DEC ||
      event === Events.DEATH_IN_PROGRESS_DEC ||
      event === Events.BIRTH_NEW_VALIDATE ||
      event === Events.DEATH_NEW_VALIDATE
    ) {
      return resBundle
    }

    /* sending notification to the contact */
    const msisdn = await getSharedContactMsisdn(payload)
    if (!msisdn) {
      logger.info('createRegistrationHandler could not send event notification')
      return resBundle
    }
    logger.info('createRegistrationHandler sending event notification')
    sendEventNotification(payload, event, msisdn, {
      Authorization: request.headers.authorization
    })
    return resBundle
  } catch (error) {
    logger.error(
      `Workflow/createRegistrationHandler[${event}]: error: ${error}`
    )
    throw new Error(error)
  }
}

export async function markEventAsValidatedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  event: Events
) {
  try {
    const payload = await markBundleAsValidated(
      request.payload as fhir.Bundle & fhir.BundleEntry,
      getToken(request)
    )

    return await postToHearth(payload)
  } catch (error) {
    logger.error(`Workflow/markAsValidatedHandler[${event}]: error: ${error}`)
    throw new Error(error)
  }
}

export async function markEventAsRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  event: Events
) {
  try {
    const payload = await markBundleAsRegistered(
      request.payload as fhir.Bundle & fhir.BundleEntry,
      getToken(request)
    )
    const resBundle = await postToHearth(payload)

    const msisdn = await getSharedContactMsisdn(payload)
    /* sending notification to the contact */
    if (msisdn) {
      logger.info('markEventAsRegisteredHandler sending event notification')
      sendEventNotification(payload, event, msisdn, {
        Authorization: request.headers.authorization
      })
    } else {
      logger.info(
        'markEventAsRegisteredHandler could not send event notification'
      )
    }

    return resBundle
  } catch (error) {
    logger.error(`Workflow/markAsRegisteredHandler[${event}]: error: ${error}`)
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
