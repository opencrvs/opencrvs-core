import { findCompositionSection } from 'src/features/fhir/utils'
import {
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE
} from 'src/features/fhir/templates'
import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'

export const typeResolvers = {
  HumanName: {
    givenName(name: any) {
      return name.given.join(' ')
    },
    familyName(name: any) {
      return name.family.join(' ')
    }
  },

  Person: {
    /* `gender` and `name` resolvers are trivial resolvers, so they don't need implementation */
  },

  BirthRegistration: {
    createdAt(composition: any) {
      return composition.date
    },
    async mother(composition: any) {
      const patientSection = findCompositionSection(MOTHER_CODE, composition)
      if (!patientSection) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async father(composition: any) {
      const patientSection = findCompositionSection(FATHER_CODE, composition)
      if (!patientSection) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async child(composition: any) {
      const patientSection = findCompositionSection(CHILD_CODE, composition)
      if (!patientSection) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    }
  }
}
