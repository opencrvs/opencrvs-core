import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'
import { GQLResolver } from 'src/graphql/schema'

export const resolvers: GQLResolver = {
  Query: {
    async locationsByParent(_, { parentId }) {
      const res = await fetch(`${fhirUrl}/Location?partof=${parentId}`, {
        headers: {
          'Content-Type': 'application/fhir+json'
        }
      })

      const bundle = await res.json()

      return bundle.entry.map((entry: { resource: {} }) => entry.resource)
    },
    async locationById(_, { locationId }) {
      const res = await fetch(`${fhirUrl}/Location/${locationId}`, {
        headers: {
          'Content-Type': 'application/fhir+json'
        }
      })

      const bundle = await res.json()

      return bundle
    }
  }
}
