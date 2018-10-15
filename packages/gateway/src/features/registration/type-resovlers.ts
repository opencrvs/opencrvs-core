import { findCompositionSection, findExtension } from 'src/features/fhir/utils'
import {
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE
} from 'src/features/fhir/templates'
import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'
import { GQLResolver } from 'src/graphql/schema'

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
    }
  }
}
