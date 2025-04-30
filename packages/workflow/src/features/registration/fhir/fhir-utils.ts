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
import * as Hapi from '@hapi/hapi'
import {
  Bundle,
  BundleEntry,
  Composition,
  OpenCRVSPatientName,
  Patient,
  Saved,
  Task,
  findExtension,
  isSaved
} from '@opencrvs/commons/types'
import { FHIR_URL, getDefaultLanguage } from '@workflow/constants'
import { SECTION_CODE } from '@workflow/features/events/utils'
import {
  CHILD_SECTION_CODE,
  DECEASED_SECTION_CODE,
  EVENT_TYPE,
  OPENCRVS_SPECIFICATION_URL
} from '@workflow/features/registration/fhir/constants'
import {
  getSectionEntryBySectionCode,
  getTaskResourceFromFhirBundle
} from '@workflow/features/registration/fhir/fhir-template'
import {
  getComposition,
  getEventType,
  getPatientBySection
} from '@workflow/features/registration/utils'
import { getTaskEventType } from '@workflow/features/task/fhir/utils'
import { logger } from '@opencrvs/commons'
import fetch, { RequestInit } from 'node-fetch'

export async function getSharedContactMsisdn(fhirBundle: Bundle) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error('Invalid FHIR bundle found for declaration')
  }
  return getPhoneNo(
    getTaskResourceFromFhirBundle(fhirBundle as Bundle) as Task,
    getEventType(fhirBundle)
  )
}

export async function getSharedContactEmail(fhirBundle: Bundle) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error('Invalid FHIR bundle found for declaration')
  }
  return getEmailAddress(
    getTaskResourceFromFhirBundle(fhirBundle as Bundle) as Task,
    getEventType(fhirBundle)
  )
}

function concatenateName(fhirNames: OpenCRVSPatientName[]) {
  const language = getDefaultLanguage()
  const name = fhirNames.find((humanName: OpenCRVSPatientName) => {
    return humanName.use === language
  })

  if (!name) {
    throw new Error(`Didn't found informant's ${language} name`)
  }
  return [...(name.given ?? []), name.family].filter(Boolean).join(' ')
}

export function getTrackingId(fhirBundle: Bundle) {
  const resource =
    fhirBundle && fhirBundle.entry && fhirBundle.entry[0].resource
  if (!resource) {
    throw new Error('getTrackingId: Invalid FHIR bundle found for declaration')
  }
  switch (resource.resourceType) {
    case 'Composition':
      const composition = resource as Composition
      if (!composition.identifier) {
        throw new Error(
          'getTrackingId: Invalid FHIR bundle found for declaration'
        )
      }
      return composition.identifier.value
    case 'Task':
      return getTrackingIdFromTaskResource(resource as Task)
    default:
      return undefined
  }
}

export function getTrackingIdFromTaskResource(taskResource: Task) {
  const eventType = getTaskEventType(taskResource as Task) as EVENT_TYPE
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
  taskResource: Task,
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
  fhirBundle: Bundle,
  eventType: EVENT_TYPE
) {
  try {
    getRegistrationNumber(
      getTaskResourceFromFhirBundle(fhirBundle as Bundle) as Task,
      eventType
    )
    return true
  } catch (error) {
    return false
  }
}

export function getPaperFormID(taskResource: Task) {
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

export function getEntryId(fhirBundle: Bundle) {
  const composition =
    fhirBundle &&
    fhirBundle.entry &&
    (fhirBundle.entry[0].resource as Composition)

  if (!composition || !composition.id) {
    throw new Error('getEntryId: Invalid FHIR bundle found for declaration')
  }
  return composition.id
}
export const getFromFhir = (suffix: string) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to resolve "${suffix}" from hearth`)
      }
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

export async function forwardToHearth(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  payloadBundle?: Bundle
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
    requestOpts.body = JSON.stringify(payloadBundle || request.payload)
  } else if (request.method === 'get') {
    path = `${request.path}${request.url.search}`
  }
  const res = await fetch(FHIR_URL + path.replace('/fhir', ''), requestOpts)
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
  const res = await fetch(FHIR_URL, {
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

//TODO: need to modifty for marriage event
export function getPhoneNo(taskResource: Task, eventType: EVENT_TYPE) {
  let phoneNumber
  if (eventType === EVENT_TYPE.BIRTH || eventType === EVENT_TYPE.DEATH) {
    const phoneExtension = findExtension(
      `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-phone-number`,
      taskResource.extension || []
    )

    phoneNumber = phoneExtension && phoneExtension.valueString
  }
  if (!phoneNumber) {
    return null
  }
  return phoneNumber
}

//TODO: need to modifty for marriage event
export function getEmailAddress(taskResource: Task, eventType: EVENT_TYPE) {
  let emailAddress
  if (eventType === EVENT_TYPE.BIRTH || eventType === EVENT_TYPE.DEATH) {
    const emailExtension = findExtension(
      `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-email`,
      taskResource.extension || []
    )

    emailAddress = emailExtension && emailExtension.valueString
  }
  if (!emailAddress) {
    return null
  }
  return emailAddress
}

//TODO: need to modifty for marriage event
export async function getEventInformantName(
  composition: Composition,
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
  if (!subject || !subject.name) {
    throw new Error("Didn't find informant's name information")
  }

  return concatenateName(subject.name)
}

export function generateEmptyBundle(): Bundle {
  return {
    resourceType: 'Bundle',
    type: 'document',
    entry: []
  }
}

export async function fetchExistingRegStatusCode(taskId: string | undefined) {
  const existingTaskResource: Task = await getFromFhir(`/Task/${taskId}`)
  const existingRegStatusCode =
    existingTaskResource &&
    existingTaskResource.businessStatus &&
    existingTaskResource.businessStatus.coding &&
    existingTaskResource.businessStatus.coding.find((code) => {
      return code.system === `${OPENCRVS_SPECIFICATION_URL}reg-status`
    })

  return existingRegStatusCode
}

function mergeFhirIdentifiers(
  currentIdentifiers: fhir3.Identifier[],
  newIdentifiers: fhir3.Identifier[]
): fhir3.Identifier[] {
  const identifierMap = new Map<string, fhir3.Identifier>()
  currentIdentifiers
    .filter((identifier) => Boolean(identifier.type?.coding?.[0]?.code))
    .forEach((identifier) =>
      identifierMap.set(identifier.type!.coding![0].code!, identifier)
    )
  newIdentifiers
    .filter((identifier) => Boolean(identifier.type?.coding?.[0]?.code))
    .forEach((identifier) =>
      identifierMap.set(identifier.type!.coding![0].code!, identifier)
    )
  return [...identifierMap.values()]
}

export async function mergePatientIdentifier(bundle: Bundle) {
  const event = getEventType(bundle)
  const composition = getComposition(bundle)
  return Promise.all(
    SECTION_CODE[event].map(async (sectionCode: string) => {
      const section = getSectionEntryBySectionCode(composition, sectionCode)
      const patient = getPatientBySection(bundle, section)
      const patientFromFhir: Patient = await getFromFhir(
        `/Patient/${patient?.id}`
      )
      if (patientFromFhir) {
        bundle.entry = bundle.entry.map((entry) => {
          const resource = entry.resource
          if (isSaved(resource) && resource?.id === patientFromFhir.id) {
            const newEntry = {
              ...entry,
              resource: {
                ...resource,
                identifier: mergeFhirIdentifiers(
                  patientFromFhir.identifier ?? [],
                  (entry.resource as Saved<Patient>).identifier ?? []
                )
              }
            }
            return newEntry
          }
          return entry
        })
      }
    })
  )
}

export async function forwardEntriesToHearth(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  logger.info(
    `Forwarding to Hearth unchanged: ${request.method} ${request.path}`
  )

  const payload = request.payload as Bundle & { entry: BundleEntry[] }
  const res = await Promise.all(
    payload.entry.map((entry) => {
      return fetch(
        `${FHIR_URL}/${entry.resource?.resourceType}/${entry.resource?.id}`,
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
