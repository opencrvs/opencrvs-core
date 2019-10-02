import { v4 as uuid } from 'uuid'

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
            code: 'birth-notification'
          }
        ],
        text: 'Birth Notification'
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
      title: 'Birth Notification',
      section: [
        {
          title: 'Child details',
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/doc-sections',
                code: 'child-details'
              }
            ],
            text: 'Child details'
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
          title: 'Birth encounter',
          code: {
            coding: [
              {
                system: 'http://opencrvs.org/specs/sections',
                code: 'birth-encounter'
              }
            ],
            text: 'Birth encounter'
          },
          entry: [{ reference: encounterSectionRef }]
        }
      ]
    }
  }
}

export function createPersonEntry(
  nid: string | null,
  firstNames: [string] | null,
  lastName: string,
  addressObject: {} | null, // TODO
  gender: 'male' | 'female' | 'unknown',
  phoneNumber: string | null,
  birthDate: string | null
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
      address: addressObject ? [addressObject] : [],
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
    fullUrl: `urn:uuid:${uuid}`, // use this to refer to the resource before it's created
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
