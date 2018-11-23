import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'
import { GQLResolver } from 'src/graphql/schema'
import { getFromFhir } from 'src/features/fhir/utils'

export const resolvers: GQLResolver = {
  Query: {
    async getUser(_, { userId }) {
      const practitionerRoleResponse = await fetch(
        `${fhirUrl}/PractitionerRole?practitioner=${userId}`,
        {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        }
      )
      const roleResponse = await practitionerRoleResponse.json()
      const roleEntry = roleResponse.entry[0].resource
      if (
        !roleEntry ||
        !roleEntry.code ||
        !roleEntry.code[0] ||
        !roleEntry.code[0].coding ||
        !roleEntry.code[0].coding[0] ||
        !roleEntry.code[0].coding[0].code
      ) {
        throw new Error('PractitionerRole has no role code')
      }
      const role = roleEntry.code[0].coding[0].code
      if (!roleEntry.location) {
        throw new Error('PractitionerRole has no locations associated')
      }
      const locations = roleEntry.location

      const practitionerResponse = await fetch(
        `${fhirUrl}/Practitioner/${userId}`,
        {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        }
      )
      const practitionerEntry = await practitionerResponse.json()
      practitionerEntry.catchmentArea = []
      practitionerEntry.role = role
      for (const location of locations) {
        const splitRef = location.reference.split('/')
        const locationResponse: fhir.Location = await getFromFhir(
          `/Location/${splitRef[1]}`
        )
        if (
          !locationResponse ||
          !locationResponse.physicalType ||
          !locationResponse.physicalType.coding ||
          !locationResponse.physicalType.coding[0] ||
          !locationResponse.physicalType.coding[0].display
        ) {
          throw new Error('PractitionerRole has no location')
        }
        if (locationResponse.physicalType.coding[0].display === 'Building') {
          practitionerEntry.primaryOffice = location
        } else {
          practitionerEntry.catchmentArea.push(location)
        }
      }

      return practitionerEntry
    }
  }
}
