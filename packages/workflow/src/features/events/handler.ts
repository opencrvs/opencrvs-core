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
import {
  EVENT_TYPE,
  OPENCRVS_SPECIFICATION_URL
} from '@workflow/features/registration/fhir/constants'
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
  actionEventHandler
} from '@workflow/features/registration/handler'
import {
  getEventType,
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
  MARKED_AS_DUPLICATE
} from '@workflow/features/task/fhir/constants'
import { setupSystemIdentifier } from '@workflow/features/registration/fhir/fhir-bundle-modifier'

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
  DECLARATION_UPDATED = '/events/declaration-updated', // Registration agent or registrar updating declaration before validating/registering
  EVENT_NOT_DUPLICATE = '/events/not-duplicate',
  DOWNLOADED = '/events/downloaded',
  ASSIGNED_EVENT = '/events/assigned',
  UNASSIGNED_EVENT = '/events/unassigned',
  UNKNOWN = 'unknown',
  VIEWED = '/events/viewed',
  MARKED_AS_DUPLICATE = '/events/markAsDuplicate'
}

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
        if (eventType === EVENT_TYPE.BIRTH) {
          if (!isNewEntry) {
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
              if (isADuplicate) {
                return Events.BIRTH_NEW_DEC
              }

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
          if (!isNewEntry) {
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
      if (firstEntry.resourceType === 'Task' && !isNewEntry) {
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
    if (hasExtension(taskResource, MARKED_AS_DUPLICATE)) {
      return Events.MARKED_AS_DUPLICATE
    }
    const eventType = getEventType(fhirBundle)
    if (eventType === EVENT_TYPE.BIRTH) {
      if (hasExtension(taskResource, REINSTATED_EXTENSION_URL)) {
        return Events.BIRTH_MARK_REINSTATED
      }
      if (isRejectedTask(taskResource)) {
        return Events.BIRTH_MARK_VOID
      }
      if (isArchiveTask(taskResource)) {
        return Events.BIRTH_MARK_ARCHIVED
      }
    } else if (eventType === EVENT_TYPE.DEATH) {
      if (hasExtension(taskResource, REINSTATED_EXTENSION_URL)) {
        return Events.DEATH_MARK_REINSTATED
      }
      if (isRejectedTask(taskResource)) {
        return Events.DEATH_MARK_VOID
      }
      if (isArchiveTask(taskResource)) {
        return Events.DEATH_MARK_ARCHIVED
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

  if (event != Events.UNKNOWN) {
    setupSystemIdentifier(request)
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
    case Events.VIEWED:
    case Events.ASSIGNED_EVENT:
    case Events.UNASSIGNED_EVENT:
    case Events.MARKED_AS_DUPLICATE:
      response = await actionEventHandler(request, h, event)
      await triggerEvent(event, request.payload, request.headers)
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
