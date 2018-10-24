import { v4 as uuid } from 'uuid'

export const MOTHER_CODE = 'mother-details'
export const FATHER_CODE = 'father-details'
export const CHILD_CODE = 'child-details'
export const DOCS_CODE = 'supporting-documents'
export const BIRTH_ENCOUNTER_CODE = 'birth-encounter'

export function createMotherSection(refUuid: string) {
  return {
    title: "Mother's details",
    code: {
      coding: {
        system: 'http://opencrvs.org/doc-sections',
        code: 'mother-details'
      },
      text: "Mother's details"
    },
    text: '',
    entry: [
      {
        reference: `urn:uuid:${refUuid}`
      }
    ]
  }
}

export function createFatherSection(refUuid: string) {
  return {
    title: "Father's details",
    code: {
      coding: {
        system: 'http://opencrvs.org/doc-sections',
        code: 'father-details'
      },
      text: "Father's details"
    },
    text: '',
    entry: [
      {
        reference: `urn:uuid:${refUuid}`
      }
    ]
  }
}

export function createChildSection(refUuid: string) {
  return {
    title: 'Child details',
    code: {
      coding: {
        system: 'http://opencrvs.org/doc-sections',
        code: 'child-details'
      },
      text: 'Child details'
    },
    text: '',
    entry: [
      {
        reference: `urn:uuid:${refUuid}`
      }
    ]
  }
}

export function createLocationResource(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Location',
      status: 'active',
      mode: 'instance',
      physicalType: {
        coding: {
          system: 'http://hl7.org/fhir/ValueSet/location-physical-type',
          code: 'area'
        },
        text: 'Area'
      }
    }
  }
}

export function createEncounterSection(refUuid: string) {
  return {
    title: 'Birth Encounter',
    code: {
      coding: {
        system: 'http://opencrvs.org/specs/sections',
        code: 'birth-encounter'
      },
      text: 'Birth encounter'
    },
    text: '',
    entry: [
      {
        reference: `urn:uuid:${refUuid}`
      }
    ]
  }
}

export function createEncounter(refUuid: string, locationRefUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
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
      period: {
        start: '',
        end: ''
      },
      location: [
        {
          location: {
            reference: `urn:uuid:${locationRefUuid}`
          }
        }
      ],
      subject: {
        reference: 'Patient/xyz' // A reference to the person being registered
      }
    }
  }
}

export function createCompositionTemplate() {
  return {
    resource: {
      identifier: {
        system: 'urn:ietf:rfc:3986',
        value: uuid()
      },
      resourceType: 'Composition',
      status: 'preliminary',
      type: {
        coding: {
          system: 'http://opencrvs.org/doc-types',
          code: 'birth-declaration'
        },
        text: 'Birth Declaration'
      },
      class: {
        coding: {
          system: 'http://opencrvs.org/doc-classes',
          code: 'crvs-document'
        },
        text: 'CRVS Document'
      },
      title: 'Birth Declaration',
      section: []
    }
  }
}

export function createPersonEntryTemplate(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Patient',
      active: true
    }
  }
}
