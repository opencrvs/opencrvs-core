import {
  OPENCRVS_SPECIFICATION_URL,
  CHILD_SECTION_CODE,
  MOTHER_SECTION_CODE,
  FATHER_SECTION_CODE,
  REG_STATUS_DECLARED,
  REG_STATUS_REGISTERED,
  EVENT_TYPE
} from './constants'
import { HEARTH_URL } from 'src/constants'
import {
  getTaskResource,
  findPersonEntry,
  selectInformantResource
} from './fhir-template'
import { ITokenPayload, USER_SCOPE } from 'src/utils/authUtils.ts'
import fetch from 'node-fetch'
import { getEventType } from '../utils'

enum CONTACT {
  MOTHER,
  FATHER,
  BOTH
}

export async function getSharedContactMsisdn(fhirBundle: fhir.Bundle) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error(
      'phoneNumberExists: Invalid FHIR bundle found for declaration'
    )
  }
  let contact
  const eventType = getEventType(fhirBundle)
  if (eventType === EVENT_TYPE.BIRTH) {
    const taskResource = getTaskResource(fhirBundle) as fhir.Task
    const sharedContact =
      taskResource &&
      taskResource.extension &&
      taskResource.extension.find(extension => {
        return (
          extension.url ===
          `${OPENCRVS_SPECIFICATION_URL}extension/contact-person`
        )
      })

    if (
      !sharedContact ||
      !sharedContact.valueString ||
      Object.keys(CONTACT).indexOf(sharedContact.valueString.toUpperCase()) < 0
    ) {
      return false
    }

    contact = await findPersonEntry(
      getContactSection(CONTACT[sharedContact.valueString.toUpperCase()]),
      fhirBundle
    )
  } else if (eventType === EVENT_TYPE.DEATH) {
    contact = selectInformantResource(fhirBundle)
  }

  if (!contact || !contact.telecom) {
    return false
  }
  const phoneNumber = contact.telecom.find(
    (contactPoint: fhir.ContactPoint) => {
      return contactPoint.system === 'phone'
    }
  )
  if (!phoneNumber) {
    return false
  }
  return phoneNumber.value
}

export async function getInformantName(
  fhirBundle: fhir.Bundle,
  sectionCode: string = CHILD_SECTION_CODE,
  language: string = 'bn'
) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error(
      'getInformantName: Invalid FHIR bundle found for declaration'
    )
  }

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

export function getTrackingId(fhirBundle: fhir.Bundle) {
  const composition =
    fhirBundle &&
    fhirBundle.entry &&
    (fhirBundle.entry[0].resource as fhir.Composition)

  if (!composition || !composition.identifier) {
    throw new Error('getTrackingId: Invalid FHIR bundle found for declaration')
  }
  return composition.identifier.value
}

export function getTrackingIdFromTaskResource(taskResource: fhir.Task) {
  const trackingIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find(identifier => {
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
    taskResource.identifier.find(identifier => {
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
    taskResource.identifier.find(identifier => {
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
    taskResource.identifier.find(identifier => {
      return (
        identifier.system === `${OPENCRVS_SPECIFICATION_URL}id/paper-form-id`
      )
    })
  if (!paperFormIdentifier || !paperFormIdentifier.value) {
    throw new Error("Didn't find any identifier for paper form id")
  }
  return paperFormIdentifier.value
}

function getContactSection(contact: CONTACT) {
  switch (contact) {
    case CONTACT.MOTHER:
    case CONTACT.BOTH:
      return MOTHER_SECTION_CODE
    case CONTACT.FATHER:
      return FATHER_SECTION_CODE
    default:
      throw new Error('No valid shared contact found')
  }
}

export function getRegStatusCode(tokenPayload: ITokenPayload) {
  if (!tokenPayload.scope) {
    throw new Error('No scope found on token')
  }
  if (tokenPayload.scope.indexOf(USER_SCOPE.REGISTER.toString()) > -1) {
    return REG_STATUS_REGISTERED
  } else if (tokenPayload.scope.indexOf(USER_SCOPE.DECLARE.toString()) > -1) {
    return REG_STATUS_DECLARED
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
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
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
