/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { HEARTH_URL } from '@workflow/constants'
import { Events, triggerEvent } from '@workflow/features/events/handler'
import {
  markBundleAsCertified,
  markBundleAsValidated,
  markEventAsRegistered,
  modifyRegistrationBundle,
  setTrackingId,
  markBundleAsWaitingValidation,
  validateRegistration
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import {
  getEventInformantName,
  getFromFhir,
  getPhoneNo,
  getSharedContactMsisdn,
  postToHearth,
  updateResourceInHearth
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  getTaskEventType,
  sendEventNotification,
  sendRegisteredNotification,
  isEventNonNotifiable
} from '@workflow/features/registration/utils'
import { logger } from '@workflow/logger'
import { getToken } from '@workflow/utils/authUtils'
import * as Hapi from 'hapi'
import fetch from 'node-fetch'
import { EVENT_TYPE } from '@workflow/features/registration/fhir/constants'

interface IEventRegistrationCallbackPayload {
  trackingId: string
  registrationNumber: string
  error: string
}
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
    if (
      event === Events.BIRTH_NEW_WAITING_VALIDATION ||
      event === Events.DEATH_NEW_WAITING_VALIDATION
    ) {
      payload = await markBundleAsWaitingValidation(
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
    if (
      event === Events.BIRTH_NEW_WAITING_VALIDATION ||
      event === Events.DEATH_NEW_WAITING_VALIDATION
    ) {
      // validate registration with resource service and set resulting registration number now that bundle exists in Hearth
      validateRegistration(payload, getToken(request))
    }
    populateCompositionWithID(payload, resBundle)

    if (isEventNonNotifiable(event)) {
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

export async function markEventAsRegisteredCallbackHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const {
    trackingId,
    registrationNumber,
    error
  } = request.payload as IEventRegistrationCallbackPayload

  if (error) {
    throw new Error(`Callback triggered with an error: ${error}`)
  }

  const taskBundle: fhir.Bundle = await getFromFhir(
    `/Task?identifier=${trackingId}`
  )
  if (
    !taskBundle ||
    !taskBundle.entry ||
    !taskBundle.entry[0] ||
    !taskBundle.entry[0].resource
  ) {
    throw new Error(
      `Task for tracking id ${trackingId} could not be found during markEventAsRegisteredCallbackHandler`
    )
  }

  const task = taskBundle.entry[0].resource as fhir.Task
  if (!task.focus || !task.focus.reference) {
    throw new Error(`Task ${task.id} doesn't have a focus reference`)
  }
  const composition: fhir.Composition = await getFromFhir(
    `/${task.focus.reference}`
  )
  const event = getTaskEventType(task)

  try {
    await markEventAsRegistered(
      task,
      registrationNumber,
      event,
      getToken(request)
    )
    await updateResourceInHearth(task)

    const phoneNo = await getPhoneNo(task, event)
    const informantName = await getEventInformantName(composition, event)
    /* sending notification to the contact */
    if (phoneNo && informantName) {
      logger.info(
        'markEventAsRegisteredCallbackHandler sending event notification'
      )
      sendRegisteredNotification(
        phoneNo,
        informantName,
        trackingId,
        registrationNumber,
        event,
        {
          Authorization: request.headers.authorization
        }
      )
    } else {
      logger.info(
        'markEventAsRegisteredCallbackHandler could not send event notification'
      )
    }
    // Trigger an event for the registration
    await triggerEvent(
      event === EVENT_TYPE.BIRTH
        ? Events.BIRTH_MARK_REG
        : Events.DEATH_MARK_REG,
      { resourceType: 'Bundle', entry: [{ resource: task }] },
      request.headers.authorization
    )
  } catch (error) {
    logger.error(
      `Workflow/markEventAsRegisteredCallbackHandler[${event}]: error: ${error}`
    )
    throw new Error(error)
  }

  return h.response().code(200)
}

export async function markEventAsWaitingValidationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  event: Events
) {
  try {
    const payload = await markBundleAsWaitingValidation(
      request.payload as fhir.Bundle & fhir.BundleEntry,
      getToken(request)
    )
    const resBundle = await postToHearth(payload)

    return resBundle
  } catch (error) {
    logger.error(
      `Workflow/markAsWaitingValidationHandler[${event}]: error: ${error}`
    )
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
