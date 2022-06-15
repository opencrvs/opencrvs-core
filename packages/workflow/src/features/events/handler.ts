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
import { EVENT_TYPE } from '@workflow/features/registration/fhir/constants'
import {
  hasBirthRegistrationNumber,
  hasDeathRegistrationNumber,
  forwardToHearth
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  createRegistrationHandler,
  markEventAsCertifiedHandler,
  markEventAsRequestedForCorrectionHandler,
  markEventAsValidatedHandler,
  markEventAsWaitingValidationHandler,
  markDownloadedEventAsAssignedOrUnassignedHandler
} from '@workflow/features/registration/handler'
import {
  getEventType,
  hasCorrectionEncounterSection,
  isInProgressDeclaration
} from '@workflow/features/registration/utils'
import {
  hasReinstatedExtension,
  isRejectedTask,
  isArchiveTask,
  hasAssignedExtension
} from '@workflow/features/task/fhir/utils'
import updateTaskHandler from '@workflow/features/task/handler'
import { logger } from '@workflow/logger'
import { hasRegisterScope, hasValidateScope } from '@workflow/utils/authUtils'
import * as Hapi from '@hapi/hapi'
import fetch from 'node-fetch'
import { getTaskResource } from '@workflow/features/registration/fhir/fhir-template'

// TODO: Change these event names to be closer in definition to the comments
// https://jembiprojects.jira.com/browse/OCRVS-2767
export enum Events {
  BIRTH_IN_PROGRESS_DEC = '/events/birth/in-progress-declaration', // Field agent or DHIS2in progress declaration
  BIRTH_NEW_DEC = '/events/birth/new-declaration', // Field agent completed declaration
  BIRTH_REQUEST_FOR_REGISTRAR_VALIDATION = '/events/birth/request-for-registrar-validation', // Registration agent new declaration
  BIRTH_WAITING_EXTERNAL_RESOURCE_VALIDATION = '/events/birth/waiting-external-resource-validation',
  REGISTRAR_BIRTH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION = '/events/birth/registrar-registration-waiting-external-resource-validation', // Registrar new registration declaration
  BIRTH_MARK_REG = '/events/birth/mark-registered',
  BIRTH_MARK_VALID = '/events/birth/mark-validated',
  BIRTH_MARK_CERT = '/events/birth/mark-certified',
  BIRTH_MARK_VOID = '/events/birth/mark-voided',
  BIRTH_MARK_ARCHIVED = '/events/birth/mark-archived',
  BIRTH_MARK_REINSTATED = '/events/birth/mark-reinstated',
  BIRTH_REQUEST_CORRECTION = '/events/birth/request-correction',
  DEATH_IN_PROGRESS_DEC = '/events/death/in-progress-declaration', /// Field agent or DHIS2in progress declaration
  DEATH_NEW_DEC = '/events/death/new-declaration', // Field agent completed declaration
  DEATH_REQUEST_FOR_REGISTRAR_VALIDATION = '/events/death/request-for-registrar-validation', // Registration agent new declaration
  DEATH_WAITING_EXTERNAL_RESOURCE_VALIDATION = '/events/death/waiting-external-resource-validation',
  REGISTRAR_DEATH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION = '/events/death/registrar-registration-waiting-external-resource-validation', // Registrar new registration declaration
  DEATH_MARK_REG = '/events/death/mark-registered',
  DEATH_MARK_VALID = '/events/death/mark-validated',
  DEATH_MARK_CERT = '/events/death/mark-certified',
  DEATH_MARK_VOID = '/events/death/mark-voided',
  DEATH_MARK_ARCHIVED = '/events/death/mark-archived',
  DEATH_MARK_REINSTATED = '/events/death/mark-reinstated',
  DEATH_REQUEST_CORRECTION = '/events/death/request-correction',
  EVENT_NOT_DUPLICATE = '/events/not-duplicate',
  DOWNLOADED = '/events/downloaded',
  DOWNLOADED_ASSIGNED_EVENT = '/events/assigned',
  UNASSIGNED_EVENT = '/events/unassigned',
  UNKNOWN = 'unknown'
}

function detectEvent(request: Hapi.Request): Events {
  const fhirBundle = request.payload as fhir.Bundle
  if (
    request.method === 'post' &&
    (request.path === '/fhir' || request.path === '/fhir/')
  ) {
    if (
      fhirBundle.entry &&
      fhirBundle.entry[0] &&
      fhirBundle.entry[0].resource
    ) {
      const firstEntry = fhirBundle.entry[0].resource
      if (firstEntry.resourceType === 'Composition') {
        const eventType = getEventType(fhirBundle)
        if (eventType === EVENT_TYPE.BIRTH) {
          if (firstEntry.id) {
            if (!hasBirthRegistrationNumber(fhirBundle)) {
              if (hasValidateScope(request)) {
                return Events.BIRTH_MARK_VALID
              }
              if (hasRegisterScope(request)) {
                return Events.BIRTH_WAITING_EXTERNAL_RESOURCE_VALIDATION
              }
            } else {
              if (
                hasRegisterScope(request) &&
                hasCorrectionEncounterSection(firstEntry as fhir.Composition)
              ) {
                return Events.BIRTH_REQUEST_CORRECTION
              } else {
                return Events.BIRTH_MARK_CERT
              }
            }
          } else {
            if (hasRegisterScope(request)) {
              return Events.REGISTRAR_BIRTH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION
            }

            if (hasValidateScope(request)) {
              return Events.BIRTH_REQUEST_FOR_REGISTRAR_VALIDATION
            }

            return isInProgressDeclaration(fhirBundle)
              ? Events.BIRTH_IN_PROGRESS_DEC
              : Events.BIRTH_NEW_DEC
          }
        } else if (eventType === EVENT_TYPE.DEATH) {
          if (firstEntry.id) {
            if (!hasDeathRegistrationNumber(fhirBundle)) {
              if (hasValidateScope(request)) {
                return Events.DEATH_MARK_VALID
              }
              if (hasRegisterScope(request)) {
                return Events.DEATH_WAITING_EXTERNAL_RESOURCE_VALIDATION
              }
            } else {
              if (
                hasRegisterScope(request) &&
                hasCorrectionEncounterSection(firstEntry as fhir.Composition)
              ) {
                return Events.DEATH_REQUEST_CORRECTION
              } else {
                return Events.DEATH_MARK_CERT
              }
            }
          } else {
            if (hasRegisterScope(request)) {
              return Events.REGISTRAR_DEATH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION
            }

            if (hasValidateScope(request)) {
              return Events.DEATH_REQUEST_FOR_REGISTRAR_VALIDATION
            }

            return isInProgressDeclaration(fhirBundle)
              ? Events.DEATH_IN_PROGRESS_DEC
              : Events.DEATH_NEW_DEC
          }
        }
      }
      if (firstEntry.resourceType === 'Task' && firstEntry.id) {
        const taskResource = getTaskResource(fhirBundle)
        if (fhirBundle?.signature?.type[0]?.code === 'downloaded') {
          if (hasAssignedExtension(taskResource)) {
            return Events.DOWNLOADED_ASSIGNED_EVENT
          } else {
            return Events.DOWNLOADED
          }
        }

        if (fhirBundle?.signature?.type[0]?.code === 'unassigned') {
          return Events.UNASSIGNED_EVENT
        }

        const eventType = getEventType(fhirBundle)
        if (eventType === EVENT_TYPE.BIRTH) {
          if (hasValidateScope(request)) {
            return Events.BIRTH_MARK_VALID
          }
          if (hasRegisterScope(request)) {
            return Events.BIRTH_MARK_REG
          }
        } else if (eventType === EVENT_TYPE.DEATH) {
          if (hasValidateScope(request)) {
            return Events.DEATH_MARK_VALID
          }
          if (hasRegisterScope(request)) {
            return Events.DEATH_MARK_REG
          }
        }
      }
    }
  }

  if (request.method === 'put' && request.path.includes('/fhir/Task')) {
    const taskResource = getTaskResource(fhirBundle)
    const eventType = getEventType(fhirBundle)
    if (eventType === EVENT_TYPE.BIRTH) {
      if (isRejectedTask(taskResource)) {
        return Events.BIRTH_MARK_VOID
      }
      if (isArchiveTask(taskResource)) {
        return Events.BIRTH_MARK_ARCHIVED
      }
      if (hasReinstatedExtension(taskResource)) {
        return Events.BIRTH_MARK_REINSTATED
      }
    } else if (eventType === EVENT_TYPE.DEATH) {
      if (isRejectedTask(taskResource)) {
        return Events.DEATH_MARK_VOID
      }
      if (isArchiveTask(taskResource)) {
        return Events.DEATH_MARK_ARCHIVED
      }
      if (hasReinstatedExtension(taskResource)) {
        return Events.DEATH_MARK_REINSTATED
      }
    }
  }

  if (request.method === 'put' && request.path.includes('/fhir/Composition')) {
    return Events.EVENT_NOT_DUPLICATE
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

  let response

  switch (event) {
    case Events.BIRTH_IN_PROGRESS_DEC:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(
        Events.BIRTH_IN_PROGRESS_DEC,
        request.payload,
        request.headers
      )
      break
    case Events.BIRTH_NEW_DEC:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(Events.BIRTH_NEW_DEC, request.payload, request.headers)
      break
    case Events.BIRTH_REQUEST_FOR_REGISTRAR_VALIDATION:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(
        Events.BIRTH_REQUEST_FOR_REGISTRAR_VALIDATION,
        request.payload,
        request.headers
      )
      break
    case Events.BIRTH_WAITING_EXTERNAL_RESOURCE_VALIDATION:
      response = await markEventAsWaitingValidationHandler(request, h, event)
      await triggerEvent(
        Events.BIRTH_WAITING_EXTERNAL_RESOURCE_VALIDATION,
        request.payload,
        request.headers
      )
      break
    case Events.DEATH_WAITING_EXTERNAL_RESOURCE_VALIDATION:
      response = await markEventAsWaitingValidationHandler(request, h, event)
      await triggerEvent(
        Events.DEATH_WAITING_EXTERNAL_RESOURCE_VALIDATION,
        request.payload,
        request.headers
      )
      break
    case Events.BIRTH_REQUEST_CORRECTION:
      response = await markEventAsRequestedForCorrectionHandler(request, h)
      await triggerEvent(
        Events.BIRTH_REQUEST_CORRECTION,
        request.payload,
        request.headers
      )
      break
    case Events.DEATH_REQUEST_CORRECTION:
      response = await markEventAsRequestedForCorrectionHandler(request, h)
      await triggerEvent(
        Events.DEATH_REQUEST_CORRECTION,
        request.payload,
        request.headers
      )
      break
    case Events.DEATH_REQUEST_FOR_REGISTRAR_VALIDATION:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(
        Events.DEATH_REQUEST_FOR_REGISTRAR_VALIDATION,
        request.payload,
        request.headers
      )
      break
    case Events.REGISTRAR_BIRTH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(
        Events.REGISTRAR_BIRTH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION,
        request.payload,
        request.headers
      )
      break
    case Events.BIRTH_MARK_REINSTATED:
    case Events.DEATH_MARK_REINSTATED:
      response = await updateTaskHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.DEATH_IN_PROGRESS_DEC:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(
        Events.DEATH_IN_PROGRESS_DEC,
        request.payload,
        request.headers
      )
      break
    case Events.DEATH_NEW_DEC:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(Events.DEATH_NEW_DEC, request.payload, request.headers)
      break
    case Events.REGISTRAR_DEATH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION:
      response = await createRegistrationHandler(request, h, event)
      await triggerEvent(
        Events.REGISTRAR_DEATH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION,
        request.payload,
        request.headers
      )
      break
    case Events.BIRTH_MARK_VALID:
      response = await markEventAsValidatedHandler(request, h, event)
      await triggerEvent(
        Events.BIRTH_MARK_VALID,
        request.payload,
        request.headers
      )
      break
    case Events.DEATH_MARK_VALID:
      response = await markEventAsValidatedHandler(request, h, event)
      await triggerEvent(
        Events.DEATH_MARK_VALID,
        request.payload,
        request.headers
      )
      break
    case Events.BIRTH_MARK_REG:
      response = await markEventAsWaitingValidationHandler(request, h, event)
      await triggerEvent(
        Events.BIRTH_MARK_REG,
        request.payload,
        request.headers
      )
      break
    case Events.DEATH_MARK_REG:
      response = await markEventAsWaitingValidationHandler(request, h, event)
      await triggerEvent(
        Events.DEATH_MARK_REG,
        request.payload,
        request.headers
      )
      break
    case Events.BIRTH_MARK_CERT:
      response = await markEventAsCertifiedHandler(request, h)
      await triggerEvent(
        Events.BIRTH_MARK_CERT,
        request.payload,
        request.headers
      )
      break
    case Events.DEATH_MARK_CERT:
      response = await markEventAsCertifiedHandler(request, h)
      await triggerEvent(
        Events.DEATH_MARK_CERT,
        request.payload,
        request.headers
      )
      break
    case Events.BIRTH_MARK_VOID:
      response = await updateTaskHandler(request, h, event)
      await triggerEvent(
        Events.BIRTH_MARK_VOID,
        request.payload,
        request.headers
      )
      break
    case Events.DEATH_MARK_VOID:
      response = await updateTaskHandler(request, h, event)
      await triggerEvent(
        Events.DEATH_MARK_VOID,
        request.payload,
        request.headers
      )
      break
    case Events.BIRTH_MARK_ARCHIVED:
    case Events.DEATH_MARK_ARCHIVED:
      response = await updateTaskHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
      break
    case Events.EVENT_NOT_DUPLICATE:
      response = await forwardToHearth(request, h)
      await triggerEvent(
        Events.EVENT_NOT_DUPLICATE,
        request.payload,
        request.headers
      )
      break
    case Events.DOWNLOADED:
      response = await markDownloadedEventAsAssignedOrUnassignedHandler(
        request,
        h
      )
      break
    case Events.DOWNLOADED_ASSIGNED_EVENT:
      response = await markDownloadedEventAsAssignedOrUnassignedHandler(
        request,
        h
      )
      await triggerEvent(
        Events.DOWNLOADED_ASSIGNED_EVENT,
        request.payload,
        request.headers
      )
      break
    case Events.UNASSIGNED_EVENT:
      response = await markDownloadedEventAsAssignedOrUnassignedHandler(
        request,
        h
      )
      await triggerEvent(
        Events.UNASSIGNED_EVENT,
        request.payload,
        request.headers
      )
      break
    default:
      // forward as-is to hearth
      response = await forwardToHearth(request, h)
  }

  return response
}

export async function triggerEvent(
  event: Events,
  payload: string | object,
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
