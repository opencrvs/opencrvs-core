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
  REG_STATUS_DECLARED,
  REG_STATUS_REGISTERED,
  EVENT_TYPE,
  REG_STATUS_VALIDATED,
  DECEASED_SECTION_CODE
} from '@workflow/features/registration/fhir/constants'
import { HEARTH_URL, getDefaultLanguage } from '@workflow/constants'
import {
  getTaskResource,
  findPersonEntry,
  getSectionEntryBySectionCode
} from '@workflow/features/registration/fhir/fhir-template'
import { ITokenPayload, USER_SCOPE } from '@workflow/utils/authUtils'
import fetch, { RequestInit } from 'node-fetch'
import { getEventType } from '@workflow/features/registration/utils'
import * as Hapi from '@hapi/hapi'
import { logger } from '@workflow/logger'

export async function getSharedContactMsisdn(fhirBundle: fhir.Bundle) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error('Invalid FHIR bundle found for declaration')
  }
  return await getPhoneNo(
    getTaskResource(fhirBundle) as fhir.Task,
    getEventType(fhirBundle)
  )
}

export async function getInformantName(
  fhirBundle: fhir.Bundle,
  sectionCode: string = CHILD_SECTION_CODE
) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error(
      'getInformantName: Invalid FHIR bundle found for declaration'
    )
  }
  const language = getDefaultLanguage()
  const informant = await findPersonEntry(sectionCode, fhirBundle)
  if (!informant || !informant.name) {
    throw new Error("Didn't find informant's name information")
  }

  const name = informant.name.find((humanName: fhir.HumanName) => {
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

export async function getCRVSOfficeName(fhirBundle: fhir.Bundle) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error(
      'getCRVSOfficeName: Invalid FHIR bundle found for declaration/notification'
    )
  }
  const taskResource = getTaskResource(fhirBundle) as fhir.Task
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
  const trackingIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find((identifier) => {
      return (
        identifier.system ===
          `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id` ||
        identifier.system ===
          `${OPENCRVS_SPECIFICATION_URL}id/death-tracking-id`
      )
    })
  if (!trackingIdentifier || !trackingIdentifier.value) {
    throw new Error("Didn't find any identifier for tracking id")
  }
  return trackingIdentifier.value
}

export function getBirthRegistrationNumber(taskResource: fhir.Task) {
  const brnIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find((identifier) => {
      return (
        identifier.system ===
        `${OPENCRVS_SPECIFICATION_URL}id/birth-registration-number`
      )
    })
  if (!brnIdentifier || !brnIdentifier.value) {
    throw new Error("Didn't find any identifier for birth registration number")
  }
  return brnIdentifier.value
}
export function getDeathRegistrationNumber(taskResource: fhir.Task) {
  const drnIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find((identifier) => {
      return (
        identifier.system ===
        `${OPENCRVS_SPECIFICATION_URL}id/death-registration-number`
      )
    })
  if (!drnIdentifier || !drnIdentifier.value) {
    throw new Error("Didn't find any identifier for death registration number")
  }
  return drnIdentifier.value
}

export function hasBirthRegistrationNumber(fhirBundle: fhir.Bundle) {
  try {
    getBirthRegistrationNumber(getTaskResource(fhirBundle) as fhir.Task)
    return true
  } catch (error) {
    return false
  }
}
export function hasDeathRegistrationNumber(fhirBundle: fhir.Bundle) {
  try {
    getDeathRegistrationNumber(getTaskResource(fhirBundle) as fhir.Task)
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
    return REG_STATUS_REGISTERED
  } else if (tokenPayload.scope.indexOf(USER_SCOPE.DECLARE.toString()) > -1) {
    return REG_STATUS_DECLARED
  } else if (tokenPayload.scope.indexOf(USER_SCOPE.VALIDATE.toString()) > -1) {
    return REG_STATUS_VALIDATED
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
      'x-correlation-id': request.headers['x-correlation-id']
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
    return false
  }
  return phoneNumber
}

export async function getEventInformantName(
  composition: fhir.Composition,
  eventType: EVENT_TYPE
) {
  let informantSection
  if (eventType === EVENT_TYPE.BIRTH) {
    informantSection = getSectionEntryBySectionCode(
      composition,
      CHILD_SECTION_CODE
    )
  } else {
    informantSection = getSectionEntryBySectionCode(
      composition,
      DECEASED_SECTION_CODE
    )
  }

  const informant =
    informantSection && (await getFromFhir(`/${informantSection.reference}`))
  const language = getDefaultLanguage()
  if (!informant || !informant.name) {
    throw new Error("Didn't find informant's name information")
  }

  const name = informant.name.find((humanName: fhir.HumanName) => {
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
