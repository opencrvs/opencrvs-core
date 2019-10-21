import { v4 as uuid } from 'uuid'
import { fetchAllAddressLocations } from '@bgd-dhis2-mediator/features/fhir/api'

export interface IIncomingAddress {
  division: {
    id: string
    name: string
  }
  district: {
    id: string
    name: string
  }
  upazila: {
    id: string
    name: string
  }
  city_corporation: {
    id: string
    name: string
  }
  municipality: {
    id: string
    name: string
  }
  ward: {
    id: string
    name: string
  }
  union: {
    id: string
    name: string
  }
}

export function createBundle(entries: fhir.BundleEntry[]) {
  return {
    resourceType: 'Bundle',
    type: 'document',
    meta: {
      lastUpdated: new Date().toISOString()
    },
    entry: entries
  }
}

export function createComposition(
  eventType: 'BIRTH' | 'DEATH',
  subjectRef: string,
  motherSectionRef: string,
  fatherSectionRef: string,
  encounterSectionRef: string
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      identifier: {
        system: 'urn:ietf:rfc:3986',
        value: `urn:uuid:${uuid()}`
      },
      resourceType: 'Composition',
      status: 'final',
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/doc-types',
            // TODO add support for notification event detection in workflow 'death-notification'
            code:
              eventType === 'BIRTH' ? 'birth-notification' : 'death-declaration'
          }
        ],
        text:
          eventType === 'BIRTH' ? 'Birth Notification' : 'Death Notification'
      },
      class: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/classes',
            code: 'crvs-document'
          }
        ],
        text: 'CRVS Document'
      },
      subject: {
        reference: subjectRef
      },
      date: new Date().toISOString(),
      author: [],
      title:
        eventType === 'BIRTH' ? 'Birth Notification' : 'Death Notification',
      section: [
        {
          title: eventType === 'BIRTH' ? 'Child details' : 'Deceased details',
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code:
                  eventType === 'BIRTH' ? 'child-details' : 'deceased-details'
              }
            ],
            text: eventType === 'BIRTH' ? 'Child details' : 'Deceased details'
          },
          entry: [{ reference: subjectRef }]
        },
        {
          title: "Mother's details",
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code: 'mother-details'
              }
            ],
            text: "Mother's details"
          },
          text: '',
          entry: [{ reference: motherSectionRef }]
        },
        {
          title: "Father's details",
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/doc-sections',
                code: 'father-details'
              }
            ],
            text: "Father's details"
          },
          entry: [{ reference: fatherSectionRef }]
        },
        {
          title: eventType === 'BIRTH' ? 'Birth encounter' : 'Death encounter',
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code:
                  eventType === 'BIRTH' ? 'birth-encounter' : 'death-encounter'
              }
            ],
            text: eventType === 'BIRTH' ? 'Birth encounter' : 'Death encounter'
          },
          entry: [{ reference: encounterSectionRef }]
        }
      ]
    }
  }
}

export async function createPersonEntry(
  nid: string | null,
  firstNames: [string] | null,
  lastName: string,
  addressObject: IIncomingAddress | null,
  gender: 'male' | 'female' | 'unknown',
  phoneNumber: string | null,
  birthDate: string | null,
  authHeader: string
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'Patient',
      active: true,
      identifier: nid
        ? [
            {
              use: 'official',
              type: 'NATIONAL_ID',
              value: nid
            }
          ]
        : [],
      name: [
        {
          use: 'en',
          family: [lastName],
          given: firstNames
        }
      ],
      gender,
      telecom: phoneNumber
        ? [
            {
              use: 'mobile',
              system: 'phone',
              value: phoneNumber
            }
          ]
        : [],
      address: addressObject
        ? [
            await convertAddressObjToFHIRPermanentAddress(
              addressObject,
              authHeader
            )
          ]
        : [],
      birthDate
    }
  }
}

export function createBirthEncounterEntry(
  locationRef: string,
  subjectRef: string
) {
  return {
    fullUrl: 'urn:uuid:<uuid>', // use this to refer to the resource before it's created
    resource: {
      resourceType: 'Encounter',
      status: 'finished',
      class: {
        system: 'http://hl7.org/fhir/v3/ActCode',
        code: 'OBS',
        display: 'Obstetrics'
      },
      type: [
        {
          coding: [
            {
              system: 'http://opencrvs.org/encounter-type',
              code: 'birth-encounter',
              display: 'Birth Encounter'
            }
          ]
        }
      ],
      location: [
        {
          location: {
            reference: locationRef
          }
        }
      ],
      subject: {
        reference: subjectRef
      }
    }
  }
}

export function createDeathEncounterEntry(
  locationRef: string,
  subjectRef: string
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`, // use this to refer to the resource before it's created
    resource: {
      resourceType: 'Encounter',
      status: 'finished',
      class: {
        system: 'http://hl7.org/fhir/v3/ActCode',
        code: 'OBS',
        display: 'Obstetrics'
      },
      type: [
        {
          coding: [
            {
              system: 'http://opencrvs.org/encounter-type',
              code: 'death-encounter',
              display: 'Death Encounter'
            }
          ]
        }
      ],
      location: [
        {
          location: {
            reference: locationRef
          }
        }
      ],
      subject: {
        reference: subjectRef
      }
    }
  }
}

export function createTaskEntry(
  compositionRef: string,
  eventType: 'BIRTH' | 'DEATH'
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'Task',
      status: 'draft',
      code: {
        coding: [{ system: 'http://opencrvs.org/specs/types', code: eventType }]
      },
      focus: {
        reference: compositionRef
      },
      lastModified: new Date().toISOString()
    }
  }
}

export async function convertAddressObjToFHIRPermanentAddress(
  addressObject: IIncomingAddress,
  authHeader: string
) {
  const fhirLocations = await fetchAllAddressLocations(
    addressObject,
    authHeader
  )

  return {
    type: 'PERMANENT',
    line: [
      '',
      '',
      '',
      (fhirLocations.union && fhirLocations.union.id) ||
        (fhirLocations.municipality && fhirLocations.municipality.id) ||
        '',
      (fhirLocations.ward && fhirLocations.ward.id) || '',
      (fhirLocations.upazila && fhirLocations.upazila.id) ||
        (fhirLocations.cityCorp && fhirLocations.cityCorp.id) ||
        ''
    ],
    district: (fhirLocations.district && fhirLocations.district.id) || '',
    state: (fhirLocations.division && fhirLocations.division.id) || '',
    postalCode: '',
    country: 'BGD'
  }
}
