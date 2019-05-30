import { COUNTRY } from '@gateway/constants'
import { GQLResolver } from '@gateway/graphql/schema'
import { fetchFHIR } from '@gateway/features/fhir/utils'
import { getUserMobile, convertToLocal } from '@gateway/features/user/utils'

export const resolvers: GQLResolver = {
  Query: {
    async getUser(_, { userId }, AuthHeader) {
      const userMgntUserID = userId as string
      const userMobileResponse = await getUserMobile(userMgntUserID, AuthHeader)
      const localMobile = convertToLocal(userMobileResponse.mobile, COUNTRY)
      const practitionerBundle = await fetchFHIR(
        `/Practitioner?telecom=phone|${localMobile}`,
        AuthHeader
      )
      const practitionerResource = practitionerBundle.entry[0].resource
      const practitionerRoleResponse = await fetchFHIR(
        `/PractitionerRole?practitioner=${practitionerResource.id}`,
        AuthHeader
      )
      const roleEntry = practitionerRoleResponse.entry[0].resource
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

      practitionerResource.userMgntUserID = userMgntUserID
      practitionerResource.catchmentArea = []
      practitionerResource.role = role
      for (const location of locations) {
        const splitRef = location.reference.split('/')
        const locationResponse: fhir.Location = await fetchFHIR(
          `/Location/${splitRef[1]}`,
          AuthHeader
        )
        if (
          !locationResponse ||
          !locationResponse.physicalType ||
          !locationResponse.physicalType.coding ||
          !locationResponse.physicalType.coding[0] ||
          !locationResponse.physicalType.coding[0].display
        ) {
          throw new Error('PractitionerRole has no physicalType')
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
