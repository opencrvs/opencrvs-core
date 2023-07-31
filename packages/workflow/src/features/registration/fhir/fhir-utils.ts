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
import {
  OPENCRVS_SPECIFICATION_URL,
  CHILD_SECTION_CODE,
  RegStatus,
  EVENT_TYPE,
  DECEASED_SECTION_CODE
} from '@workflow/features/registration/fhir/constants'
import { HEARTH_URL, getDefaultLanguage } from '@workflow/constants'
import {
  getTaskResource,
  findPersonEntry,
  getSectionEntryBySectionCode,
  findRelatedPersonEntry
} from '@workflow/features/registration/fhir/fhir-template'
import { ITokenPayload, USER_SCOPE } from '@workflow/utils/authUtils'
import fetch, { RequestInit } from 'node-fetch'
import {
  getComposition,
  getEventType,
  getPatientBySection
} from '@workflow/features/registration/utils'
import * as Hapi from '@hapi/hapi'
import { logger } from '@workflow/logger'
import { unionBy } from 'lodash'
import { SECTION_CODE } from '@workflow/features/events/utils'
import { getTaskEventType } from '@workflow/features/task/fhir/utils'

export async function getSharedContactMsisdn(fhirBundle: fhir.Bundle) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error('Invalid FHIR bundle found for declaration')
  }
  return await getPhoneNo(getTaskResource(fhirBundle), getEventType(fhirBundle))
}

export async function getSharedContactEmail(fhirBundle: fhir.Bundle) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error('Invalid FHIR bundle found for declaration')
  }
  return await getEmailAddress(
    getTaskResource(fhirBundle),
    getEventType(fhirBundle)
  )
}

export function concatenateName(fhirNames: fhir.HumanName[]) {
  const language = getDefaultLanguage()
  const name = fhirNames.find((humanName: fhir.HumanName) => {
    return humanName.use === language
  })

  if (!name || !name.family) {
    throw new Error(`Didn't found informant's ${language} name`)
  }
  return ''
    .concat(name.given ? name.given.join(' ') : '')
    .concat(' ')
    .concat(name.family)
}

export async function getSubjectName(
  fhirBundle: fhir.Bundle,
  sectionCode: string = CHILD_SECTION_CODE
) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error('getSubjectName: Invalid FHIR bundle found for declaration')
  }
  const person = await findPersonEntry(sectionCode, fhirBundle)
  if (!person || !person.name) {
    throw new Error("Didn't find subject's name information")
  }

  return concatenateName(person.name)
}

export async function getInformantName(
  fhirBundle: fhir.Bundle,
  sectionCode: string = CHILD_SECTION_CODE
) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error('getSubjectName: Invalid FHIR bundle found for declaration')
  }
  const informant = await findRelatedPersonEntry(sectionCode, fhirBundle)
  if (!informant || !informant.name) {
    throw new Error("Didn't find informant's name information")
  }
  return concatenateName(informant.name)
}

export async function getCRVSOfficeName(fhirBundle: fhir.Bundle) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error(
      'getCRVSOfficeName: Invalid FHIR bundle found for declaration/notification'
    )
  }
  const taskResource = getTaskResource(fhirBundle)
  const regLastOfficeExt = taskResource?.extension?.find(
    (ext) => ext.url === `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`
  )
  if (!regLastOfficeExt || !regLastOfficeExt.valueReference) {
    throw new Error('No last registration office found on the bundle')
  }
  const office: fhir.Location = await getFromFhir(
    `/${regLastOfficeExt.valueReference.reference}`
  )
  const language = getDefaultLanguage()
  return (
    (language === 'en'
      ? office.name
      : (office.alias && office.alias[0]) || office.name) || ''
  )
}

export function getTrackingId(fhirBundle: fhir.Bundle) {
  const resource =
    fhirBundle && fhirBundle.entry && fhirBundle.entry[0].resource
  if (!resource) {
    throw new Error('getTrackingId: Invalid FHIR bundle found for declaration')
  }
  switch (resource.resourceType) {
    case 'Composition':
      const composition = resource as fhir.Composition
      if (!composition.identifier) {
        throw new Error(
          'getTrackingId: Invalid FHIR bundle found for declaration'
        )
      }
      return composition.identifier.value
    case 'Task':
      return getTrackingIdFromTaskResource(resource as fhir.Task)
    default:
      return undefined
  }
}

export function getTrackingIdFromTaskResource(taskResource: fhir.Task) {
  const eventType = getTaskEventType(taskResource) as EVENT_TYPE
  const trackingIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find((identifier) => {
      return (
        identifier.system ===
        `${OPENCRVS_SPECIFICATION_URL}id/${eventType.toLowerCase()}-tracking-id`
      )
    })
  if (!trackingIdentifier || !trackingIdentifier.value) {
    throw new Error("Didn't find any identifier for tracking id")
  }
  return trackingIdentifier.value
}

export function getRegistrationNumber(
  taskResource: fhir.Task,
  eventType: EVENT_TYPE
) {
  const brnIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find((identifier) => {
      return (
        identifier.system ===
        `${OPENCRVS_SPECIFICATION_URL}id/${eventType.toLowerCase()}-registration-number`
      )
    })
  if (!brnIdentifier || !brnIdentifier.value) {
    throw new Error("Didn't find any identifier for birth registration number")
  }
  return brnIdentifier.value
}

export function hasRegistrationNumber(
  fhirBundle: fhir.Bundle,
  eventType: EVENT_TYPE
) {
  try {
    getRegistrationNumber(getTaskResource(fhirBundle), eventType)
    return true
  } catch (error) {
    return false
  }
}

export function getPaperFormID(taskResource: fhir.Task) {
  const paperFormIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find((identifier) => {
      return (
        identifier.system === `${OPENCRVS_SPECIFICATION_URL}id/paper-form-id`
      )
    })
  if (!paperFormIdentifier || !paperFormIdentifier.value) {
    throw new Error("Didn't find any identifier for paper form id")
  }
  return paperFormIdentifier.value
}

export function getRegStatusCode(tokenPayload: ITokenPayload) {
  if (!tokenPayload.scope) {
    throw new Error('No scope found on token')
  }
  if (tokenPayload.scope.indexOf(USER_SCOPE.REGISTER.toString()) > -1) {
    return RegStatus.REGISTERED
  } else if (tokenPayload.scope.indexOf(USER_SCOPE.DECLARE.toString()) > -1) {
    return RegStatus.DECLARED
  } else if (tokenPayload.scope.indexOf(USER_SCOPE.VALIDATE.toString()) > -1) {
    return RegStatus.VALIDATED
  } else {
    throw new Error('No valid scope found on token')
  }
}

export function getEntryId(fhirBundle: fhir.Bundle) {
  const composition =
    fhirBundle &&
    fhirBundle.entry &&
    (fhirBundle.entry[0].resource as fhir.Composition)

  if (!composition || !composition.id) {
    throw new Error('getEntryId: Invalid FHIR bundle found for declaration')
  }
  return composition.id
}
export const getFromFhir = (suffix: string) => {
  return fetch(`${HEARTH_URL}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

export async function forwardToHearth(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  logger.info(
    `Forwarding to Hearth unchanged: ${request.method} ${request.path}`
  )

  const requestOpts: RequestInit = {
    method: request.method,
    headers: {
      'Content-Type': 'application/fhir+json',
      'x-correlation-id': request.headers['x-correlation-id'],
      'x-real-ip': request.headers['x-real-ip'],
      'x-real-user-agent': request.headers['x-real-user-agent']
    }
  }

  let path = request.path
  if (request.method === 'post' || request.method === 'put') {
    requestOpts.body = JSON.stringify(request.payload)
  } else if (request.method === 'get') {
    path = `${request.path}${request.url.search}`
  }
  const res = await fetch(HEARTH_URL + path.replace('/fhir', ''), requestOpts)
  const resBody = await res.text()
  const response = h.response(resBody)

  response.code(res.status)
  res.headers.forEach((headerVal, headerName) => {
    response.header(headerName, headerVal)
  })

  return response
}

export async function postToHearth(payload: any) {
  /* hearth will do put calls if it finds id on the bundle */
  const res = await fetch(HEARTH_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
  if (!res.ok) {
    throw new Error(
      `FHIR post to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }
  return res.json()
}

export async function updateResourceInHearth(resource: fhir.ResourceBase) {
  const res = await fetch(
    `${HEARTH_URL}/${resource.resourceType}/${resource.id}`,
    {
      method: 'PUT',
      body: JSON.stringify(resource),
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    }
  )
  if (!res.ok) {
    throw new Error(
      `FHIR update to ${resource.resourceType} failed with [${
        res.status
      }] body: ${await res.text()}`
    )
  }

  return res.text()
}

//TODO: need to modifty for marriage event
export async function getPhoneNo(
  taskResource: fhir.Task,
  eventType: EVENT_TYPE
) {
  let phoneNumber
  if (eventType === EVENT_TYPE.BIRTH || eventType === EVENT_TYPE.DEATH) {
    const phoneExtension =
      taskResource &&
      taskResource.extension &&
      taskResource.extension.find((extension) => {
        return (
          extension.url ===
          `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-phone-number`
        )
      })
    phoneNumber = phoneExtension && phoneExtension.valueString
  }
  if (!phoneNumber) {
    return null
  }
  return phoneNumber
}

//TODO: need to modifty for marriage event
export async function getEmailAddress(
  taskResource: fhir.Task,
  eventType: EVENT_TYPE
) {
  let emailAddress
  if (eventType === EVENT_TYPE.BIRTH || eventType === EVENT_TYPE.DEATH) {
    const emailExtension =
      taskResource &&
      taskResource.extension &&
      taskResource.extension.find((extension) => {
        return (
          extension.url ===
          `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-email`
        )
      })
    emailAddress = emailExtension && emailExtension.valueString
  }
  if (!emailAddress) {
    return null
  }
  return emailAddress
}

//TODO: need to modifty for marriage event
export async function getEventInformantName(
  composition: fhir.Composition,
  eventType: EVENT_TYPE
) {
  let subjectSection
  if (eventType === EVENT_TYPE.BIRTH) {
    subjectSection = getSectionEntryBySectionCode(
      composition,
      CHILD_SECTION_CODE
    )
  } else if (eventType === EVENT_TYPE.DEATH) {
    subjectSection = getSectionEntryBySectionCode(
      composition,
      DECEASED_SECTION_CODE
    )
  }

  const subject =
    subjectSection && (await getFromFhir(`/${subjectSection.reference}`))
  const language = getDefaultLanguage()
  if (!subject || !subject.name) {
    throw new Error("Didn't find informant's name information")
  }

  const name = subject.name.find((humanName: fhir.HumanName) => {
    return humanName.use === language
  })

  if (!name || !name.family) {
    throw new Error(`Didn't found informant's ${language} name`)
  }
  return ''
    .concat(name.given ? name.given.join(' ') : '')
    .concat(' ')
    .concat(name.family)
}

export function generateEmptyBundle(): fhir.Bundle {
  return {
    resourceType: 'Bundle',
    type: 'document',
    entry: []
  }
}

export async function fetchExistingRegStatusCode(taskId: string | undefined) {
  const existingTaskResource: fhir.Task = await getFromFhir(`/Task/${taskId}`)
  const existingRegStatusCode =
    existingTaskResource &&
    existingTaskResource.businessStatus &&
    existingTaskResource.businessStatus.coding &&
    existingTaskResource.businessStatus.coding.find((code) => {
      return code.system === `${OPENCRVS_SPECIFICATION_URL}reg-status`
    })

  return existingRegStatusCode
}

export async function mergePatientIdentifier(bundle: fhir.Bundle) {
  const event = getEventType(bundle)
  const composition = getComposition(bundle)
  SECTION_CODE[event].map(async (sectionCode: string) => {
    const section = getSectionEntryBySectionCode(composition, sectionCode)
    const patient = getPatientBySection(bundle, section)
    const patientFromFhir: fhir.Patient = await getFromFhir(
      `/Patient/${patient?.id}`
    )
    if (patientFromFhir) {
      bundle.entry =
        bundle &&
        bundle.entry &&
        bundle.entry.map((entry) => {
          if (entry.resource?.id === patientFromFhir.id) {
            return {
              ...entry,
              resource: {
                ...entry.resource,
                identifier: unionBy(
                  (entry.resource as fhir.Patient).identifier,
                  patientFromFhir.identifier,
                  'type'
                )
              }
            }
          } else {
            return entry
          }
        })
    }
  })
}

export async function forwardEntriesToHearth(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  logger.info(
    `Forwarding to Hearth unchanged: ${request.method} ${request.path}`
  )

  const payload = request.payload as fhir.Bundle & { entry: fhir.BundleEntry[] }
  const res = await Promise.all(
    payload.entry.map((entry) => {
      return fetch(
        `${HEARTH_URL}/${entry.resource?.resourceType}/${entry.resource?.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(entry.resource),
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        }
      )
    })
  )
  return res[res.length - 1]
}
