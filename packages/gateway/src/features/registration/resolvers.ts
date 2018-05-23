import fetch from 'node-fetch'
import { toFHIR } from './service'

export const resolvers = {
  Query: {
    listRegistrations(_: any, { locations, status }: any) {
      // query composition
      return [{ trackingID: '123' }, { trackingID: '321' }]
    }
  },
  Mutation: {
    async createRegistration(_: any, { details }: any) {
      const doc: any = toFHIR(details)

      const res = await fetch('http://localhost:5001/fhir', {
        method: 'POST',
        body: JSON.stringify(doc),
        headers: { 'Content-Type': 'application/fhir+json' }
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
  },
  Registration: {}
}
