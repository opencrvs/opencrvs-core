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
import { v4 as uuid } from 'uuid'
import {
  fetchAllAddressLocations,
  fetchCRVSOfficeByParentLocation
} from '@bgd-dhis2-mediator/features/fhir/api'
import * as moment from 'moment'
import { EVENT_DATE_FORMAT } from '@bgd-dhis2-mediator/constants'

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

export function createBirthComposition(
  childSectionRef: string,
  motherSectionRef: string,
  fatherSectionRef: string,
  encounterSectionRef: string
) {
  const composition = createComposition(
    'BIRTH',
    childSectionRef,
    encounterSectionRef
  )
  composition.resource.section = composition.resource.section.concat([
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
    }
  ])
  return composition
}

export function createDeathComposition(
  deceasedSectionRef: string,
  informantSectionRef: string,
  encounterSectionRef: string
) {
  const composition = createComposition(
    'DEATH',
    deceasedSectionRef,
    encounterSectionRef
  )
  composition.resource.section.push({
    title: "Informant's details",
    code: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/sections',
          code: 'informant-details'
        }
      ],
      text: "Informant's details"
    },
    entry: [{ reference: informantSectionRef }]
  })
  return composition
}

function createComposition(
  eventType: 'BIRTH' | 'DEATH',
  subjectRef: string,
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
              eventType === 'BIRTH'
                ? 'birth-notification'
                : 'death-notification'
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

export function createRelatedPersonEntry(
  relationShipType: string,
  informantEntryRef: string
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'RelatedPerson',
      relationship: {
        coding: [
          {
            system:
              'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
            code: relationShipType
          }
        ]
      },
      patient: {
        reference: informantEntryRef
      }
    }
  }
}

export async function createPersonEntry(
  nid: string | null,
  firstNames: [string] | null,
  lastName: string,
  firstNamesEng: [string] | null,
  lastNameEng: string,
  addressObject: IIncomingAddress | null,
  gender: 'male' | 'female' | 'unknown',
  phoneNumber: string | null,
  birthDate: string | null,
  deathDate: string | null,
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
          family: [lastNameEng],
          given: firstNamesEng
        },
        {
          use: 'bn',
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
      address: [],
      /*
      
      When DHIS2 is integrated with A2I BBS codes, this process will be correct
      
      addressObject
        ? [
            await convertAddressObjToFHIRPermanentAddress(
              addressObject,
              authHeader
            )
          ]
        : [],*/
      birthDate: dateFormatter(birthDate, EVENT_DATE_FORMAT),
      deceasedBoolean: !!deathDate,
      deceasedDateTime: dateFormatter(deathDate, EVENT_DATE_FORMAT)
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

export async function createTaskEntry(
  compositionRef: string,
  lastRegLocation: fhir.Location,
  eventType: 'BIRTH' | 'DEATH',
  authHeader: string
) {
  const taskResource: fhir.Task = {
    resourceType: 'Task',
    status: 'draft',
    intent: 'unknown',
    code: {
      coding: [{ system: 'http://opencrvs.org/specs/types', code: eventType }]
    },
    focus: {
      reference: compositionRef
    },
    lastModified: new Date().toISOString()
  }
  if (lastRegLocation.id) {
    taskResource.extension = [
      {
        url: 'http://opencrvs.org/specs/extension/regLastLocation',
        valueReference: {
          reference: `Location/${lastRegLocation.id}`
        }
      }
    ]
    const lastRegOffice = await fetchCRVSOfficeByParentLocation(
      lastRegLocation,
      authHeader
    )
    taskResource.extension.push({
      url: 'http://opencrvs.org/specs/extension/regLastOffice',
      valueReference: {
        reference: `Location/${lastRegOffice.id}`
      }
    })
  }
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: taskResource
  }
}

export async function createDeathObservation(
  encounterRef: string,
  causeOfDeath: string,
  subjectRef: string,
  deathDate: string
) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'Observation',
      status: 'final',
      context: {
        reference: encounterRef
      },
      code: {
        coding: [
          {
            system: 'http://hl7.org/fhir/ValueSet/icd-10',
            code: 'ICD10',
            display: 'Cause of death'
          }
        ]
      },
      subject: {
        reference: subjectRef
      },
      effectiveDateTime: deathDate,
      valueCodeableConcept: {
        coding: {
          system: 'http://hl7.org/fhir/ValueSet/icd-10',
          code: causeOfDeath
        }
      }
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

export function dateFormatter(date: string | null, formatString: string) {
  if (!date) {
    return null
  }
  return moment(Number(date)).format(formatString)
}
