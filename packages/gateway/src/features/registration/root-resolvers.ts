import fetch from 'node-fetch'
import { fhirUrl, WORKFLOW_SERVICE_URL } from 'src/constants'
import { buildFHIRBundle } from 'src/features/registration/fhir-builders'
import { GQLResolver } from 'src/graphql/schema'

const statusMap = {
  declared: 'preliminary',
  registered: 'final'
}

export const resolvers: GQLResolver = {
  Query: {
    async listBirthRegistrations(_, { status }) {
      const res = await fetch(
        `${fhirUrl}/Composition${
          status ? `?status=${statusMap[status]}&` : '?'
        }_count=0`,
        {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        }
      )

      const bundle = await res.json()

      return bundle.entry.map((entry: { resource: {} }) => entry.resource)
    }
  },

  Mutation: {
    async createBirthRegistration(_, { details }, authHeader) {
      const doc = await buildFHIRBundle(details)

      const res = await fetch(
        `${WORKFLOW_SERVICE_URL}createBirthRegistration`,
        {
          method: 'POST',
          body: JSON.stringify(doc),
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          }
        }
      )

      if (!res.ok) {
        throw new Error(
          `Workflow post to /createBirthRegistration failed with [${
            res.status
          }] body: ${await res.text()}`
        )
      }

      const resBody = await res.json()
      if (!resBody || !resBody.trackingid) {
        throw new Error(`Workflow response did not send a valid response`)
      }
      // return the trackingid
      return resBody.trackingid
    },
    async markBirthAsRegistered(_, { id, details }, authHeader) {
      interface Ipayload {
        [key: string]: any
      }
      const payload: Ipayload = {
        id
      }
      if (details) {
        payload.details = await buildFHIRBundle(details)
      }

      const res = await fetch(`${WORKFLOW_SERVICE_URL}markBirthAsRegistered`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })

      if (!res.ok) {
        throw new Error(
          `Workflow post to /markBirthAsRegistered failed with [${
            res.status
          }] body: ${await res.text()}`
        )
      }

      const resBody = await res.json()
      if (!resBody || !resBody.trackingid) {
        throw new Error(`Workflow response did not send a valid response`)
      }
      // return the trackingid
      return resBody.trackingid
    }
  }
}
