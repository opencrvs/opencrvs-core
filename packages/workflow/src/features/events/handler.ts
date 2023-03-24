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
import { OPENHIM_URL } from '@workflow/constants'
import { isUserAuthorized } from '@workflow/features/events/auth'
import { OPENCRVS_SPECIFICATION_URL } from '@workflow/features/registration/fhir/constants'
import {
  hasRegistrationNumber,
  forwardToHearth,
  forwardEntriesToHearth
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  createRegistrationHandler,
  markEventAsCertifiedHandler,
  markEventAsRequestedForCorrectionHandler,
  markEventAsValidatedHandler,
  markEventAsWaitingValidationHandler,
  actionEventHandler,
  anonymousActionEventHandler,
  markEventAsIssuedHandler
} from '@workflow/features/registration/handler'
import {
  getEventType,
  hasCertificateDataInDocRef,
  hasCorrectionEncounterSection,
  isInProgressDeclaration
} from '@workflow/features/registration/utils'
import {
  hasExtension,
  isRejectedTask,
  isArchiveTask
} from '@workflow/features/task/fhir/utils'
import updateTaskHandler from '@workflow/features/task/handler'
import { logger } from '@workflow/logger'
import { hasRegisterScope, hasValidateScope } from '@workflow/utils/authUtils'
import * as Hapi from '@hapi/hapi'
import fetch from 'node-fetch'
import { getTaskResource } from '@workflow/features/registration/fhir/fhir-template'
import {
  ASSIGNED_EXTENSION_URL,
  DOWNLOADED_EXTENSION_URL,
  UNASSIGNED_EXTENSION_URL,
  REINSTATED_EXTENSION_URL,
  VIEWED_EXTENSION_URL,
  MARKED_AS_NOT_DUPLICATE,
  MARKED_AS_DUPLICATE,
  VERIFIED_EXTENSION_URL
} from '@workflow/features/task/fhir/constants'
import { setupSystemIdentifier } from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { Events } from '@workflow/features/events/utils'

function detectEvent(request: Hapi.Request): Events {
  const fhirBundle = request.payload as fhir.Bundle
  if (
    request.method === 'post' &&
    (request.path === '/fhir' || request.path === '/fhir/')
  ) {
    const firstEntry = fhirBundle.entry?.[0]?.resource
    if (firstEntry) {
      const isNewEntry = !firstEntry.id
      if (firstEntry.resourceType === 'Composition') {
        const composition = firstEntry as fhir.Composition
        const isADuplicate = composition?.extension?.find(
          (ext) =>
            ext.url === `${OPENCRVS_SPECIFICATION_URL}duplicate` &&
            ext.valueBoolean
        )
        const eventType = getEventType(fhirBundle)

        if (!isNewEntry) {
          if (!hasRegistrationNumber(fhirBundle, eventType)) {
            if (hasValidateScope(request)) {
              return Events[`${eventType}_MARK_VALID`]
            }
            if (hasRegisterScope(request)) {
              return Events[`${eventType}_WAITING_EXTERNAL_RESOURCE_VALIDATION`]
            }
          } else {
            if (
              hasRegisterScope(request) &&
              hasCorrectionEncounterSection(firstEntry as fhir.Composition)
            ) {
              return Events[`${eventType}_REQUEST_CORRECTION`]
            } else if (!hasCertificateDataInDocRef(fhirBundle)) {
              return Events[`${eventType}_MARK_ISSUE`]
            } else {
              return Events[`${eventType}_MARK_CERT`]
            }
          }
        } else {
          if (hasRegisterScope(request)) {
            if (isADuplicate) {
              return Events[`${eventType}_NEW_DEC`]
            }
            return Events[
              `REGISTRAR_${eventType}_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION`
            ]
          }
          if (hasValidateScope(request)) {
            if (isADuplicate) {
              return Events[`${eventType}_NEW_DEC`]
            }
            return Events[`${eventType}_REQUEST_FOR_REGISTRAR_VALIDATION`]
          }
          return isInProgressDeclaration(fhirBundle)
            ? Events[`${eventType}_IN_PROGRESS_DEC`]
            : Events[`${eventType}_NEW_DEC`]
        }
      }

      if (firstEntry.resourceType === 'Task' && !isNewEntry) {
        const eventType = getEventType(fhirBundle)
        if (hasValidateScope(request)) {
          return Events[`${eventType}_MARK_VALID`]
        }
        if (hasRegisterScope(request)) {
          return Events[`${eventType}_MARK_REG`]
        }
      }
    }
  }

  if (request.method === 'put' && request.path.includes('/fhir/Task')) {
    const taskResource = getTaskResource(fhirBundle)

    if (hasExtension(taskResource, ASSIGNED_EXTENSION_URL)) {
      return Events.ASSIGNED_EVENT
    }
    if (hasExtension(taskResource, UNASSIGNED_EXTENSION_URL)) {
      return Events.UNASSIGNED_EVENT
    }
    if (hasExtension(taskResource, DOWNLOADED_EXTENSION_URL)) {
      return Events.DOWNLOADED
    }
    if (hasExtension(taskResource, VIEWED_EXTENSION_URL)) {
      return Events.VIEWED
    }
    if (hasExtension(taskResource, MARKED_AS_NOT_DUPLICATE)) {
      return Events.EVENT_NOT_DUPLICATE
    }
    if (hasExtension(taskResource, MARKED_AS_DUPLICATE)) {
      return Events.MARKED_AS_DUPLICATE
    }
    if (hasExtension(taskResource, VERIFIED_EXTENSION_URL)) {
      return Events.VERIFIED_EVENT
    }

    const eventType = getEventType(fhirBundle)

    if (hasExtension(taskResource, REINSTATED_EXTENSION_URL)) {
      return Events[`${eventType}_MARK_REINSTATED`]
    }
    if (isRejectedTask(taskResource)) {
      return Events[`${eventType}_MARK_VOID`]
    }
    if (isArchiveTask(taskResource)) {
      return Events[`${eventType}_MARK_ARCHIVED`]
    }
  }
  return Events.UNKNOWN
}

export async function fhirWorkflowEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const event = detectEvent(request)

  logger.info(`Event detected: ${event}`)
  // Unknown event are allowed through to Hearth by default.
  // We can restrict what resources can be used in Hearth directly if necessary
  if (
    event !== Events.UNKNOWN &&
    !isUserAuthorized(request.auth.credentials.scope, event)
  ) {
    return h.response().code(401)
  }

  if (event != Events.UNKNOWN && event != Events.EVENT_NOT_DUPLICATE) {
    setupSystemIdentifier(request)
  }

  let response

  switch (event) {
    case Events.BIRTH_IN_PROGRESS_DEC:
    case Events.DEATH_IN_PROGRESS_DEC:
    case Events.MARRIAGE_IN_PROGRESS_DEC:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.BIRTH_NEW_DEC:
    case Events.DEATH_NEW_DEC:
    case Events.MARRIAGE_NEW_DEC:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.BIRTH_REQUEST_FOR_REGISTRAR_VALIDATION:
    case Events.DEATH_REQUEST_FOR_REGISTRAR_VALIDATION:
    case Events.MARRIAGE_REQUEST_FOR_REGISTRAR_VALIDATION:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.BIRTH_WAITING_EXTERNAL_RESOURCE_VALIDATION:
    case Events.DEATH_WAITING_EXTERNAL_RESOURCE_VALIDATION:
    case Events.MARRIAGE_WAITING_EXTERNAL_RESOURCE_VALIDATION:
      response = await markEventAsWaitingValidationHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.BIRTH_REQUEST_CORRECTION:
    case Events.DEATH_REQUEST_CORRECTION:
    case Events.MARRIAGE_REQUEST_CORRECTION:
      response = await markEventAsRequestedForCorrectionHandler(request, h)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.REGISTRAR_BIRTH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION:
    case Events.REGISTRAR_DEATH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION:
    case Events.REGISTRAR_MARRIAGE_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.BIRTH_MARK_REINSTATED:
    case Events.DEATH_MARK_REINSTATED:
    case Events.MARRIAGE_MARK_REINSTATED:
      response = await updateTaskHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.BIRTH_MARK_VALID:
    case Events.DEATH_MARK_VALID:
    case Events.MARRIAGE_MARK_VALID:
      response = await markEventAsValidatedHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.BIRTH_MARK_REG:
    case Events.DEATH_MARK_REG:
    case Events.MARRIAGE_MARK_REG:
      response = await markEventAsWaitingValidationHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break

    case Events.BIRTH_MARK_CERT:
    case Events.DEATH_MARK_CERT:
    case Events.MARRIAGE_MARK_CERT:
      response = await markEventAsCertifiedHandler(request, h)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.BIRTH_MARK_ISSUE:
      response = await markEventAsIssuedHandler(request, h)
      await triggerEvent(
        Events.BIRTH_MARK_ISSUE,
        request.payload,
        request.headers
      )
      break
    case Events.DEATH_MARK_ISSUE:
      response = await markEventAsIssuedHandler(request, h)
      await triggerEvent(
        Events.DEATH_MARK_ISSUE,
        request.payload,
        request.headers
      )
      break
    case Events.MARRIAGE_MARK_ISSUE:
      response = await markEventAsIssuedHandler(request, h)
      await triggerEvent(
        Events.MARRIAGE_MARK_ISSUE,
        request.payload,
        request.headers
      )
      break
    case Events.BIRTH_MARK_VOID:
    case Events.DEATH_MARK_VOID:
    case Events.MARRIAGE_MARK_VOID:
      response = await updateTaskHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.BIRTH_MARK_ARCHIVED:
    case Events.DEATH_MARK_ARCHIVED:
    case Events.MARRIAGE_MARK_ARCHIVED:
      response = await updateTaskHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.EVENT_NOT_DUPLICATE:
      response = await forwardEntriesToHearth(request, h)
      await triggerEvent(
        Events.EVENT_NOT_DUPLICATE,
        request.payload,
        request.headers
      )
      break
    case Events.DOWNLOADED:
    case Events.VIEWED:
    case Events.ASSIGNED_EVENT:
    case Events.UNASSIGNED_EVENT:
    case Events.MARKED_AS_DUPLICATE:
      response = await actionEventHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.VERIFIED_EVENT:
      response = await anonymousActionEventHandler(request, h, event)
      break
    default:
      // forward as-is to hearth
      response = await forwardToHearth(request, h)
  }

  return response
}

export async function triggerEvent(
  event: Events,
  payload: Hapi.Request['payload'],
  headers: Record<string, string> = {}
) {
  try {
    await fetch(`${OPENHIM_URL}${event}`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })
  } catch (err) {
    logger.error(`Unable to forward to openhim for error : ${err}`)
  }
}
