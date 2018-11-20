import {
  OPENCRVS_SPECIFICATION_URL,
  CHILD_SECTION_CODE,
  MOTHER_SECTION_CODE,
  FATHER_SECTION_CODE
} from './constants'
import { getTaskResource, findPersonEntry } from './fhir-template'
import { ITokenPayload, USER_SCOPE } from 'src/utils/authUtils.ts'

enum CONTACT {
  MOTHER,
  FATHER
}

export function getSharedContactMsisdn(fhirBundle: fhir.Bundle) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error(
      'getSharedContactMsisdn: Invalid FHIR bundle found for declration'
    )
  }
  const taskResource = getTaskResource(fhirBundle) as fhir.Task
  const sharedContact =
    taskResource &&
    taskResource.extension &&
    taskResource.extension.find(extention => {
      return (
        extention.url ===
        `${OPENCRVS_SPECIFICATION_URL}extension/contact-person`
      )
    })

  if (
    !sharedContact ||
    !sharedContact.valueString ||
    Object.keys(CONTACT).indexOf(sharedContact.valueString.toUpperCase()) < 0
  ) {
    throw new Error("Invalid Informant's shared contact information found")
  }

  const contact = findPersonEntry(
    getContactSection(CONTACT[sharedContact.valueString.toUpperCase()]),
    fhirBundle
  )
  if (!contact || !contact.telecom) {
    throw new Error(
      "Didn't find any contact point for informant's shared contact"
    )
  }
  const phoneNumber = contact.telecom.find(
    (contactPoint: fhir.ContactPoint) => {
      return contactPoint.system === 'phone'
    }
  )
  if (!phoneNumber) {
    throw new Error(
      "Didn't find any phone number for informant's shared contact"
    )
  }
  return phoneNumber.value
}

export function getInformantName(fhirBundle: fhir.Bundle) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error(
      'getInformantName: Invalid FHIR bundle found for declration'
    )
  }

  const informant = findPersonEntry(CHILD_SECTION_CODE, fhirBundle)
  if (!informant || !informant.name) {
    throw new Error("Didn't find informant's name information")
  }

  const traditionalName = informant.name.find((humanName: fhir.HumanName) => {
    return humanName.use === 'Traditional'
  })
  if (!traditionalName || !traditionalName.family) {
    throw new Error("Didn't found informant's traditional name")
  }
  return ''
    .concat(traditionalName.given ? traditionalName.given.join(' ') : '')
    .concat(' ')
    .concat(traditionalName.family)
}

export function getTrackingId(fhirBundle: fhir.Bundle) {
  const composition =
    fhirBundle &&
    fhirBundle.entry &&
    (fhirBundle.entry[0].resource as fhir.Composition)

  if (!composition || !composition.identifier) {
    throw new Error('getTrackingId: Invalid FHIR bundle found for declration')
  }
  return composition.identifier.value
}

function getContactSection(contact: CONTACT) {
  switch (contact) {
    case CONTACT.MOTHER:
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
  if (tokenPayload.scope.indexOf(USER_SCOPE.CERTIFY.toString()) > -1) {
    return 'CERTIFIED'
  } else if (tokenPayload.scope.indexOf(USER_SCOPE.REGISTER.toString()) > -1) {
    return 'REGISTERED'
  } else if (tokenPayload.scope.indexOf(USER_SCOPE.DECLARE.toString()) > -1) {
    return 'DECLARED'
  } else {
    throw new Error('No valid scope found on token')
  }
}
