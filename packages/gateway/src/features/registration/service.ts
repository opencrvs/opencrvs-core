import { v4 as uuid } from 'uuid'

function createMotherSection(refUuid: string) {
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

function createFatherSection(refUuid: string) {
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

function createChildSection(refUuid: string) {
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

function createComposition(
  reg: any,
  { motherRefUuid, fatherRefUuid, childRefUuid }: any
) {
  return {
    resource: {
      identifier: {
        system: 'urn:ietf:rfc:3986',
        value: uuid()
      },
      resourceType: 'Composition',
      status: 'final',
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
      subject: {
        reference: 'Patient/xyz'
      },
      date: reg.createdAt,
      author: [
        {
          reference: 'Practitioner/xyz'
        }
      ],
      title: 'Birth Declaration',
      section: [
        createMotherSection(motherRefUuid),
        createFatherSection(fatherRefUuid),
        createChildSection(childRefUuid)
      ]
    }
  }
}

function createPersonEntry(person: any, refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Patient',
      active: true,
      name: [
        {
          use: 'english',
          family: [person.name[0] ? person.name[0].familyName : undefined],
          given: [person.name[0] ? person.name[0].givenName : undefined]
        }
      ],
      gender: person.gender
    }
  }
}

export function toFHIR(reg: any) {
  const refUuids = {
    motherRefUuid: uuid(),
    fatherRefUuid: uuid(),
    childRefUuid: uuid()
  }

  return {
    resourceType: 'Bundle',
    type: 'document',
    meta: {
      lastUpdated: reg.createdAt
    },
    entry: [
      createComposition(reg, refUuids),
      createPersonEntry(reg.mother, refUuids.motherRefUuid),
      createPersonEntry(reg.father, refUuids.fatherRefUuid),
      createPersonEntry(reg.child, refUuids.childRefUuid)
    ]
  }
}

export function fromFHIR(fhir: any) {
  return {}
}
