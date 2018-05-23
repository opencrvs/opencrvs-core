import fetch from 'node-fetch'
import { fromFHIR, toFHIR } from './service'

const statusMap = {
  declared: 'preliminary',
  registered: 'final'
}

export const resolvers = {
  Query: {
    async listRegistrations(_: any, { locations, status }: any) {
      const res = await fetch(
        `http://localhost:5001/fhir/Composition?status=${statusMap[status]}`,
        {
          headers: { 'Content-Type': 'application/fhir+json' }
        }
      )

      const bundle = await res.json()

      // resolve composition references inline
      await Promise.all(
        bundle.entry.map(async (compEntry: any) => {
          return Promise.all(
            compEntry.resource.section.map(async (section: any) => {
              return Promise.all(
                section.entry.map(async (sectionEntry: any) => {
                  const sectionResourceRes = await fetch(
                    `http://localhost:5001/fhir/${sectionEntry.reference}`,
                    {
                      headers: { 'Content-Type': 'application/fhir+json' }
                    }
                  )
                  sectionEntry.resource = await sectionResourceRes.json()
                })
              )
            })
          )
        })
      )

      return fromFHIR(bundle)
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
