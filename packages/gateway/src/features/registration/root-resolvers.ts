import fetch from 'node-fetch'

import { fhirUrl } from 'src/constants'
import { buildFHIRBundle } from 'src/features/registration/fhir-builders'
import { typeResolvers } from 'src/features/registration/type-resovlers'

const statusMap = {
  declared: 'preliminary',
  registered: 'final'
}

export const resolvers = {
  ...typeResolvers,

  Query: {
    async listBirthRegistrations(_: any, { status }: any) {
      const res = await fetch(
        `${fhirUrl}/Composition?status=${statusMap[status]}`,
        {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        }
      )

      const bundle = await res.json()

      return bundle.entry
    }
  },

  Mutation: {
    async createBirthRegistration(_: any, { details }: any) {
      const doc: any = buildFHIRBundle(details)

      const res = await fetch(fhirUrl, {
        method: 'POST',
        body: JSON.stringify(doc),
        headers: {
          'Content-Type': 'application/fhir+json'
        }
      })

      if (!res.ok) {
        throw new Error(
          `FHIR post to /fhir failed with [${
            res.status
          }] body: ${await res.text()}`
        )
      }

      const resBody = await res.json()
      if (
        !resBody ||
        !resBody.entry[0] ||
        !resBody.entry[0].response ||
        !resBody.entry[0].response.location
      ) {
        throw new Error(`FHIR response did not send a valid response`)
      }

      // return the Composition's id
      return resBody.entry[0].response.location.split('/')[3]
    }
  }
}
