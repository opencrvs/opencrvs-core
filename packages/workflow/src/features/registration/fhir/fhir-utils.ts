import {
  OPENCRVS_SPECIFICATION_URL,
  CHILD_SECTION_CODE,
  MOTHER_SECTION_CODE,
  FATHER_SECTION_CODE,
  REG_STATUS_DECLARED,
  REG_STATUS_REGISTERED,
  JURISDICTION_TYPE_DISTRICT,
  JURISDICTION_TYPE_UPAZILA,
  JURISDICTION_TYPE_UNION
} from './constants'
import { fhirUrl } from 'src/constants'
import { getTaskResource, findPersonEntry } from './fhir-template'
import { ITokenPayload, USER_SCOPE } from 'src/utils/authUtils.ts'
import fetch from 'node-fetch'
import { convertToLocal, getUserMobile } from '../utils'
import { COUNTRY } from 'src/constants'
import { getTokenPayload } from 'src/utils/authUtils.ts'

enum CONTACT {
  MOTHER,
  FATHER
}

export function getSharedContactMsisdn(fhirBundle: fhir.Bundle) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error(
      'getSharedContactMsisdn: Invalid FHIR bundle found for declaration'
    )
  }
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

export function getInformantName(
  fhirBundle: fhir.Bundle,
  language: string = 'bn'
) {
  if (!fhirBundle || !fhirBundle.entry) {
    throw new Error(
      'getInformantName: Invalid FHIR bundle found for declaration'
    )
  }

  const informant = findPersonEntry(CHILD_SECTION_CODE, fhirBundle)
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

export function getBirthRegistrationNumber(fhirBundle: fhir.Bundle) {
  const taskResource = getTaskResource(fhirBundle) as fhir.Task
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

export function getPaperFormID(fhirBundle: fhir.Bundle) {
  const taskResource = getTaskResource(fhirBundle) as fhir.Task
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

export const getFromFhir = (suffix: string) => {
  return fetch(`${fhirUrl}${suffix}`, {
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

export async function getLoggedInPractitionerResource(
  token: string
): Promise<fhir.Practitioner> {
  const tokenPayload = getTokenPayload(token)
  const userMobileResponse = await getUserMobile(tokenPayload.sub, {
    Authorization: `Bearer ${token}`
  })
  const localMobile = convertToLocal(userMobileResponse.mobile, COUNTRY)
  const practitionerBundle = await getFromFhir(
    `/Practitioner?telecom=phone|${localMobile}`
  )
  if (
    !practitionerBundle ||
    !practitionerBundle.entry ||
    !practitionerBundle.entry[0].resource
  ) {
    throw new Error('Practitional resource not found')
  }
  return practitionerBundle.entry[0].resource
}

export async function getPractitionerLocations(
  practitionerId: string
): Promise<[fhir.Location]> {
  const roleResponse = await getFromFhir(
    `/PractitionerRole?practitioner=${practitionerId}`
  )
  const roleEntry = roleResponse.entry[0].resource
  if (!roleEntry || !roleEntry.location) {
    throw new Error('PractitionerRole has no locations associated')
  }
  const locList = []
  for (const location of roleEntry.location) {
    const splitRef = location.reference.split('/')
    const locationResponse: fhir.Location = await getFromFhir(
      `/Location/${splitRef[1]}`
    )
    if (!locationResponse) {
      throw new Error(`Location not found for ${location}`)
    }
    locList.push(locationResponse)
  }
  return locList as [fhir.Location]
}

export function getJurisDictionalLocations() {
  return [
    {
      jurisdictionType: JURISDICTION_TYPE_DISTRICT,
      bbsCode: ''
    },
    {
      jurisdictionType: JURISDICTION_TYPE_UPAZILA,
      bbsCode: ''
    },
    {
      jurisdictionType: JURISDICTION_TYPE_UNION,
      bbsCode: ''
    }
  ]
}
