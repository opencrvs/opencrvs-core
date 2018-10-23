import { findCompositionSection, findExtension } from 'src/features/fhir/utils'
import {
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE,
  DOCS_CODE
} from 'src/features/fhir/templates'
import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'
import { GQLResolver } from 'src/graphql/schema'
import {
  ORIGINAL_FILE_NAME_SYSTEM,
  SYSTEM_FILE_NAME_SYSTEM
} from '../fhir/constants'

export const typeResolvers: GQLResolver = {
  HumanName: {
    firstNames(name) {
      return name.given.join(' ')
    },
    familyName(name) {
      return name.family.join(' ')
    }
  },

  Person: {
    /* `gender` and `name` resolvers are trivial resolvers, so they don't need implementation */
    dateOfMarriage: person => {
      const marriageExtension = findExtension(
        'http://opencrvs.org/specs/extension/date-of-marriage',
        person.extension
      )
      return marriageExtension.valueDateTime
    },
    multipleBirth: person => {
      return person.multipleBirthInteger
    },
    deceased: person => {
      return person.deceasedBoolean
    },
    nationality: person => {
      const nationalityExtension = findExtension(
        'http://hl7.org/fhir/StructureDefinition/patient-nationality',
        person.extension
      )
      const countryCodeExtension = findExtension(
        'code',
        nationalityExtension.extension
      )

      return countryCodeExtension.valueCodeableConcept.coding.code
    },
    educationalAttainment: person => {
      const educationalAttainmentExtension = findExtension(
        'http://opencrvs.org/specs/extension/educational-attainment',
        person.extension
      )
      return educationalAttainmentExtension.valueString
    }
  },

  Registration: {
    async attachments(task: fhir.Task) {
      if (!task.focus) {
        throw new Error(
          'Task resource does not have a focus property necessary to lookup the composition'
        )
      }

      const res = await fetch(`${fhirUrl}/${task.focus.reference}`)
      const composition = await res.json()
      const docRefReferences = findCompositionSection(
        DOCS_CODE,
        composition
      ).entry.map((docRefEntry: fhir.Reference) => docRefEntry.reference)
      return docRefReferences.map(async (docRefReference: string) => {
        const docRefRes = await fetch(`${fhirUrl}/${docRefReference}`)
        return docRefRes.json()
      })
    }
  },

  Attachment: {
    id(docRef: fhir.DocumentReference) {
      return (docRef.masterIdentifier && docRef.masterIdentifier.value) || null
    },
    data(docRef: fhir.DocumentReference) {
      return docRef.content[0].attachment.data
    },
    originalFileName(docRef: fhir.DocumentReference) {
      const foundIdentifier =
        docRef.identifier &&
        docRef.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system === ORIGINAL_FILE_NAME_SYSTEM
        )
      if (!foundIdentifier) {
        return null
      }
      return foundIdentifier.value
    },
    systemFileName(docRef: fhir.DocumentReference) {
      const foundIdentifier =
        docRef.identifier &&
        docRef.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system === SYSTEM_FILE_NAME_SYSTEM
        )
      if (!foundIdentifier) {
        return null
      }
      return foundIdentifier.value
    },
    type(docRef: fhir.DocumentReference) {
      return (
        (docRef.type && docRef.type.coding && docRef.type.coding[0].code) ||
        null
      )
    },
    subject(docRef: fhir.DocumentReference) {
      return (docRef.subject && docRef.subject.display) || null
    },
    createdAt(docRef: fhir.DocumentReference) {
      return docRef.created
    }
  },

  BirthRegistration: {
    createdAt(composition) {
      return composition.date
    },
    async mother(composition) {
      const patientSection = findCompositionSection(MOTHER_CODE, composition)
      if (!patientSection) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async father(composition) {
      const patientSection = findCompositionSection(FATHER_CODE, composition)
      if (!patientSection) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async child(composition) {
      const patientSection = findCompositionSection(CHILD_CODE, composition)
      if (!patientSection) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async registration(composition) {
      const res = await fetch(`${fhirUrl}/Task?focus=${composition.id}`)
      return res.json()
    }
  }
}
