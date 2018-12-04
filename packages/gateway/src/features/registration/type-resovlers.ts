import { findCompositionSection, findExtension } from 'src/features/fhir/utils'
import {
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE,
  DOCS_CODE,
  BIRTH_ENCOUNTER_CODE,
  BODY_WEIGHT_CODE,
  BIRTH_TYPE_CODE,
  BIRTH_ATTENDANT_CODE,
  BIRTH_REG_PRESENT_CODE,
  BIRTH_REG_TYPE_CODE,
  LAST_LIVE_BIRTH_CODE,
  NUMBER_BORN_ALIVE_CODE,
  NUMBER_FOEATAL_DEATH_CODE
} from 'src/features/fhir/templates'
import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'
import { GQLResolver } from 'src/graphql/schema'
import {
  ORIGINAL_FILE_NAME_SYSTEM,
  SYSTEM_FILE_NAME_SYSTEM,
  FHIR_SPECIFICATION_URL,
  OPENCRVS_SPECIFICATION_URL
} from 'src/features/fhir/constants'
import { ITemplatedComposition } from './fhir-builders'

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
        `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
        person.extension
      )
      return (marriageExtension && marriageExtension.valueDateTime) || null
    },
    maritalStatus: person => {
      return person.maritalStatus.text
    },
    multipleBirth: person => {
      return person.multipleBirthInteger
    },
    deceased: person => {
      return person.deceasedBoolean
    },
    nationality: person => {
      const nationalityExtension = findExtension(
        `${FHIR_SPECIFICATION_URL}patient-nationality`,
        person.extension
      )
      if (!nationalityExtension || !nationalityExtension.extension) {
        return null
      }
      const countryCodeExtension = findExtension(
        'code',
        nationalityExtension.extension
      )

      const coding =
        (countryCodeExtension &&
          countryCodeExtension.valueCodeableConcept &&
          countryCodeExtension.valueCodeableConcept.coding &&
          countryCodeExtension.valueCodeableConcept.coding) ||
        []

      // Nationality could be multiple
      const nationality = coding.map(n => {
        return n.code
      })

      return nationality
    },
    educationalAttainment: person => {
      const educationalAttainmentExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/educational-attainment`,
        person.extension
      )
      return (
        (educationalAttainmentExtension &&
          educationalAttainmentExtension.valueString) ||
        null
      )
    }
  },

  Registration: {
    async trackingId(task: fhir.Task) {
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id`
        )
      if (!foundIdentifier) {
        return null
      }
      return foundIdentifier.value
    },
    async attachments(task: fhir.Task) {
      if (!task.focus) {
        throw new Error(
          'Task resource does not have a focus property necessary to lookup the composition'
        )
      }

      const res = await fetch(`${fhirUrl}/${task.focus.reference}`)
      const composition = await res.json()
      const docSection = findCompositionSection(DOCS_CODE, composition)
      if (!docSection || !docSection.entry) {
        return null
      }
      const docRefReferences = docSection.entry.map(
        (docRefEntry: fhir.Reference) => docRefEntry.reference
      )
      return docRefReferences.map(async (docRefReference: string) => {
        const docRefRes = await fetch(`${fhirUrl}/${docRefReference}`)
        return docRefRes.json()
      })
    },
    contact: task => {
      const contact = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/contact-person`,
        task.extension
      )
      return (contact && contact.valueString) || null
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

  Location: {
    name: location => location.name,
    status: location => location.status,
    longitude: location => location.position.longitude,
    latitude: location => location.position.latitude
  },

  BirthRegistration: {
    createdAt(composition: ITemplatedComposition) {
      return composition.date
    },
    async mother(composition: ITemplatedComposition) {
      const patientSection = findCompositionSection(MOTHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async father(composition: ITemplatedComposition) {
      const patientSection = findCompositionSection(FATHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async child(composition: ITemplatedComposition) {
      const patientSection = findCompositionSection(CHILD_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async registration(composition: ITemplatedComposition) {
      const res = await fetch(
        `${fhirUrl}/Task?focus=Composition/${composition.id}`
      ) // TODO this is returning all tasks no matter what
      const taskBundle = await res.json()

      if (!taskBundle.entry[0] || !taskBundle.entry[0].resource) {
        return null
      }

      return taskBundle.entry[0].resource
    },
    async weightAtBirth(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BODY_WEIGHT_CODE}`
      )
      const data = await res.json()
      return data.entry[0].resource.valueQuantity.value
    },
    async birthType(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_TYPE_CODE}`
      )
      const data = await res.json()
      return data.entry[0].resource.valueQuantity.value
    },
    async attendantAtBirth(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_ATTENDANT_CODE}`
      )
      const data = await res.json()
      return data.entry[0].resource.valueString
    },
    async birthRegistrationType(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_REG_TYPE_CODE}`
      )
      const data = await res.json()
      return data.entry[0].resource.valueString
    },
    async presentAtBirthRegistration(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_REG_PRESENT_CODE}`
      )
      const data = await res.json()
      return data.entry[0].resource.valueString
    },
    async childrenBornAliveToMother(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${NUMBER_BORN_ALIVE_CODE}`
      )
      const data = await res.json()
      return data.resource.valueInteger
    },
    async foetalDeathsToMother(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${NUMBER_FOEATAL_DEATH_CODE}`
      )
      const data = await res.json()
      return data.resource.valueInteger
    },
    async lastPreviousLiveBirth(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${LAST_LIVE_BIRTH_CODE}`
      )
      const data = await res.json()
      return data.resource.valueDateTime
    },
    async birthLocation(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/${encounterSection.entry[0].reference}`
      )
      const data = await res.json()

      const locationRes = await fetch(
        `${fhirUrl}/${data.location[0].location.reference}`
      )
      return locationRes.json()
    }
  }
}
