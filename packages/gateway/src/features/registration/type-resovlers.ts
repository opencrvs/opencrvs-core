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
        `${FHIR_SPECIFICATION_URL}patient-nationality`,
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
        `${OPENCRVS_SPECIFICATION_URL}extension/educational-attainment`,
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

  Location: {
    name: location => location.resource.name,
    status: location => location.resource.status,
    longitude: location => location.resource.position.longitude,
    latitude: location => location.resource.position.latitude
  },

  BirthRegistration: {
    createdAt(composition: fhir.Composition) {
      return composition.date
    },
    async mother(composition: fhir.Composition) {
      const patientSection = findCompositionSection(MOTHER_CODE, composition)
      if (!patientSection) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async father(composition: fhir.Composition) {
      const patientSection = findCompositionSection(FATHER_CODE, composition)
      if (!patientSection) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async child(composition: fhir.Composition) {
      const patientSection = findCompositionSection(CHILD_CODE, composition)
      if (!patientSection) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async registration(composition: fhir.Composition) {
      const res = await fetch(`${fhirUrl}/Task?focus=${composition.id}`)
      return res.json()
    },
    async weightAtBirth(composition: fhir.Composition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BODY_WEIGHT_CODE}`
      )
      const data = await res.json()
      return data.resource.valueQuantity.value
    },
    async birthType(composition: fhir.Composition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_TYPE_CODE}`
      )
      const data = await res.json()
      return data.resource.valueInteger
    },
    async attendantAtBirth(composition: fhir.Composition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_ATTENDANT_CODE}`
      )
      const data = await res.json()
      return data.resource.valueString
    },
    async birthRegistrationType(composition: fhir.Composition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_REG_TYPE_CODE}`
      )
      const data = await res.json()
      return data.resource.valueString
    },
    async presentAtBirthRegistration(composition: fhir.Composition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_REG_PRESENT_CODE}`
      )
      const data = await res.json()
      return data.resource.valueString
    },
    async childrenBornAliveToMother(composition: fhir.Composition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection) {
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
    async foetalDeathsToMother(composition: fhir.Composition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection) {
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
    async lastPreviousLiveBirth(composition: fhir.Composition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection) {
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
    async birthLocation(composition: fhir.Composition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection) {
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
