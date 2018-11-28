import fetch from 'node-fetch'
import { fhirUrl, COUNTRY } from 'src/constants'
import { GQLResolver } from 'src/graphql/schema'
import { getFromFhir } from 'src/features/fhir/utils'
import { getUserMobile, convertToLocal } from './utils'

export const resolvers: GQLResolver = {
  Query: {
    async getUser(_, { userId }, authHeader) {
      const userMgntUserID = userId as string
      const userMobileResponse = await getUserMobile(userMgntUserID, authHeader)
      const localMobile = convertToLocal(userMobileResponse.mobile, COUNTRY)
      const practitionerResponse = await fetch(
        `${fhirUrl}/Practitioner?telecom=phone|${localMobile}`,
        {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        }
      )
      const practitionerBundle = await practitionerResponse.json()
      const practitionerResource = practitionerBundle.entry[0].resource
      const practitionerRoleResponse = await fetch(
        `${fhirUrl}/PractitionerRole?practitioner=${practitionerResource.id}`,
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

      practitionerResource.catchmentArea = []
      practitionerResource.role = role
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
          practitionerResource.primaryOffice = locationResponse
        } else {
          practitionerResource.catchmentArea.push(locationResponse)
        }
      }

      return practitionerResource
    }
  }
}
