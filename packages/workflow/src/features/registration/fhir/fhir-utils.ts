import { OPENCRVS_SPECIFICATION_URL, CHILD_SECTION_CODE } from '../constants'
import { getTaskResource, findPersonEntry } from './fhir-template'

enum CONTACT_SECTIONS {
  MOTHER = 'mother-details',
  FATHER = 'father-details'
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
    Object.keys(CONTACT_SECTIONS).indexOf(
      sharedContact.valueString.toUpperCase()
    ) < 0
  ) {
    throw new Error("Informant's shared contact information missing")
  }

  const contact = findPersonEntry(
    CONTACT_SECTIONS[sharedContact.valueString.toUpperCase()].value,
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
