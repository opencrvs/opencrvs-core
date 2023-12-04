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
import { HEARTH_URL } from '@workflow/constants'
import {
  markBundleAsCertified,
  markBundleAsValidated,
  modifyRegistrationBundle,
  setTrackingId,
  markBundleAsWaitingValidation,
  touchBundle,
  markBundleAsDeclarationUpdated,
  makeTaskAnonymous,
  markBundleAsIssued
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import {
  getSharedContactMsisdn,
  postToHearth,
  mergePatientIdentifier,
  getSharedContactEmail
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  sendEventNotification,
  isEventNonNotifiable,
  getEventType,
  isEventNotification
} from '@workflow/features/registration/utils'
import { taskHasInput } from '@workflow/features/task/fhir/utils'
import { logger } from '@workflow/logger'
import { getToken } from '@workflow/utils/authUtils'
import * as Hapi from '@hapi/hapi'
import fetch from 'node-fetch'
import { getTaskResourceFromFhirBundle } from '@workflow/features/registration/fhir/fhir-template'
import { triggerEvent } from '@workflow/features/events/handler'
import { Events } from '@workflow/features/events/utils'
import { Bundle, BundleEntry, EVENT_TYPE, Saved } from '@opencrvs/commons/types'
import { getRecordById } from '@workflow/records/index'
import { toRegistered } from '@workflow/records/state-transitions'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { indexBundle } from '@workflow/records/search'
import {
  isNotificationEnabled,
  sendNotification
} from '@workflow/records/notification'

export interface IEventRegistrationCallbackPayload {
  trackingId: string
  registrationNumber: string
  error: string
  compositionId: string
  childIdentifiers?: {
    type: string
    value: string
  }[]
}

async function sendBundleToHearth(
  payload: Bundle,
  count = 1
): Promise<Saved<Bundle>> {
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

function getSectionFromResponse(
  response: Bundle,
  reference: string
): BundleEntry[] {
  return (response.entry &&
    response.entry.filter((o) => {
      const res = o.response as fhir3.BundleEntryResponse
      return Object.keys(res).some((k: keyof fhir3.BundleEntryResponse) =>
        (res[k] as string).toLowerCase().includes(reference.toLowerCase())
      )
    })) as BundleEntry[]
}

function getSectionIndex(
  section: fhir3.CompositionSection[]
): number | undefined {
  let index
  section.filter((obj: fhir3.CompositionSection, i: number) => {
    if (
      obj.title &&
      ['Birth encounter', 'Death encounter', 'Marriage encounter'].includes(
        obj.title
      )
    ) {
      index = i
    }
  })
  return index
}

export function populateCompositionWithID(payload: Bundle, response: Bundle) {
  if (
    payload &&
    payload.entry &&
    payload.entry[0].resource &&
    payload.entry[0].resource.resourceType === 'Composition'
  ) {
    const responseEncounterSection = getSectionFromResponse(
      response,
      'Encounter'
    )
    const composition = payload.entry[0].resource as fhir3.Composition
    if (composition.section) {
      const payloadEncounterSectionIndex = getSectionIndex(composition.section)
      if (
        payloadEncounterSectionIndex !== undefined &&
        composition.section[payloadEncounterSectionIndex] &&
        composition.section[payloadEncounterSectionIndex].entry &&
        responseEncounterSection &&
        responseEncounterSection[0] &&
        responseEncounterSection[0].response &&
        responseEncounterSection[0].response.location
      ) {
        const entry = composition.section[payloadEncounterSectionIndex]
          .entry as fhir3.Reference[]
        entry[0].reference =
          responseEncounterSection[0].response.location.split('/')[3]
        composition.section[payloadEncounterSectionIndex].entry = entry
      }
      if (!composition.id) {
        composition.id =
          response &&
          response.entry &&
          response.entry[0].response &&
          response.entry[0].response.location &&
          response.entry[0].response.location.split('/')[3]
      }
      payload.entry[0].resource = composition
    }
  }
}

export async function createRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  event: Events
) {
  try {
    const token = getToken(request)
    let payload = await modifyRegistrationBundle(
      request.payload as Saved<Bundle>,
      token
    )
    if (
      [
        Events.REGISTRAR_BIRTH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION,
        Events.REGISTRAR_DEATH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION,
        Events.REGISTRAR_MARRIAGE_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION
      ].includes(event)
    ) {
      payload = await markBundleAsWaitingValidation(payload, token)
    } else if (
      [
        Events.BIRTH_REQUEST_FOR_REGISTRAR_VALIDATION,
        Events.DEATH_REQUEST_FOR_REGISTRAR_VALIDATION,
        Events.MARRIAGE_REQUEST_FOR_REGISTRAR_VALIDATION
      ].includes(event)
    ) {
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

export async function markEventAsRegisteredCallbackHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const { registrationNumber, error, childIdentifiers, compositionId } =
    request.payload as IEventRegistrationCallbackPayload

  if (error) {
    throw new Error(`Callback triggered with an error: ${error}`)
  }

  try {
    const savedRecord = await getRecordById(
      compositionId,
      request.headers.authorization,
      ['WAITING_VALIDATION']
    )
    if (!savedRecord) {
      throw new Error('Could not find record in elastic search!')
    }
    const practitioner = await getLoggedInPractitionerResource(
      getToken(request)
    )

    const event = getEventType(savedRecord)
    const eventNotification = isEventNotification(savedRecord)

    const registeredBundle = await toRegistered(
      request,
      savedRecord,
      practitioner,
      registrationNumber,
      childIdentifiers
    )

    if (!registeredBundle) {
      throw new Error('Could not create registered bundle!')
    }
    await sendBundleToHearth(registeredBundle)
    await indexBundle(registeredBundle, getToken(request))

    // Notification not implemented for marriage yet
    // don't forward hospital notifications
    if (
      event !== EVENT_TYPE.MARRIAGE &&
      !eventNotification &&
      (await isNotificationEnabled('register', event, token))
    ) {
      await sendNotification('register', registeredBundle, token)
    }

    return h.response(registeredBundle).code(200)
  } catch (error) {
    logger.error(
      `Workflow/markEventAsRegisteredCallbackHandler: error: ${error}`
    )
    throw new Error(error)
  }
}

export async function markEventAsWaitingValidationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  event: Events
) {
  try {
    let payload: Saved<Bundle>

    const taskResource = getTaskResourceFromFhirBundle(
      request.payload as Bundle
    )

    // In case the record was updated then there will be input output in payload
    if (taskHasInput(taskResource)) {
      payload = await markBundleAsDeclarationUpdated(
        request.payload as Saved<Bundle>,
        getToken(request)
      )
      await postToHearth(payload)
      await triggerEvent(Events.DECLARATION_UPDATED, payload, request.headers)
      delete taskResource.input
      delete taskResource.output
    }

    payload = await markBundleAsWaitingValidation(
      request.payload as Saved<Bundle>,
      getToken(request)
    )
    const resBundle = await postToHearth(payload)
    populateCompositionWithID(payload, resBundle)

    return { resBundle, payloadForInvokingValidation: payload }
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
      request.payload as Bundle,
      getToken(request)
    )
    await mergePatientIdentifier(payload)
    const resBundle = await postToHearth(payload)
    populateCompositionWithID(payload, resBundle)
    return resBundle
  } catch (error) {
    logger.error(`Workflow/markEventAsCertifiedHandler: error: ${error}`)
    throw new Error(error)
  }
}

export async function markEventAsIssuedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const payload = await markBundleAsIssued(
      request.payload as Bundle,
      getToken(request)
    )
    await mergePatientIdentifier(payload)
    const resBundle = await postToHearth(payload)
    populateCompositionWithID(payload, resBundle)
    return resBundle
  } catch (error) {
    logger.error(`Workflow/markEventAsIssuedHandler: error: ${error}`)
    throw new Error(error)
  }
}

export async function actionEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  event: Events
) {
  try {
    let payload = request.payload as Bundle
    payload = await touchBundle(payload, getToken(request))
    const taskResource = payload.entry?.[0].resource as fhir3.Task
    return await fetch(`${HEARTH_URL}/Task/${taskResource.id}`, {
      method: 'PUT',
      body: JSON.stringify(taskResource),
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    })
  } catch (error) {
    logger.error(`Workflow/actionEventHandler(${event}): error: ${error}`)
    throw new Error(error)
  }
}
export async function anonymousActionEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  event: Events
) {
  try {
    const payload = request.payload as Bundle
    const anonymousPayload = makeTaskAnonymous(payload)

    const taskResource = anonymousPayload.entry?.[0].resource as fhir3.Task
    const res = await fetch(`${HEARTH_URL}/Task/${taskResource.id}`, {
      method: 'PUT',
      body: JSON.stringify(taskResource),
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    })
    return res
  } catch (error) {
    logger.error(`Workflow/actionEventHandler(${event}): error: ${error}`)
    throw new Error(error)
  }
}
