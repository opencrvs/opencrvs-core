import { FHIR_URL } from '@gateway/constants'
import { GQLResolver } from '@gateway/graphql/schema'
import { fetchFHIR } from '@gateway/features/fhir/utils'

export const resolvers: GQLResolver = {
  Query: {
    async locationsByParent(_, { parentId }, authHeader) {
      const bundle = await fetchFHIR(
        `${FHIR_URL}/Location?partof=${parentId}`,
        authHeader
      )

      return bundle.entry.map((entry: { resource: {} }) => entry.resource)
    },
    async locationById(_, { locationId }, authHeader) {
      return fetchFHIR(`${FHIR_URL}/Location/${locationId}`, authHeader)
    }
  }
}
