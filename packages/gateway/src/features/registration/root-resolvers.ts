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
    async markBirthAsVoided(_, { id, reason, comment }, authHeader) {
      const taskResponse = await fetch(
        `${fhirUrl}/Task?focus=Composition/${id}`,
        {
          headers: {
            'Content-Type': 'application/fhir+json'
          }
        }
      )
      const newNote: fhir.Annotation = {
        text: `reason=${reason}&comment=${comment}`,
        time: new Date().toUTCString(),
        authorString: ''
      }
      const taskBundle = await taskResponse.json()
      const newTaskResource = taskBundle.entry[0].resource as fhir.Task
      if (
        !newTaskResource ||
        !newTaskResource.note ||
        !newTaskResource.businessStatus ||
        !newTaskResource.businessStatus.coding ||
        !newTaskResource.businessStatus.coding[0] ||
        !newTaskResource.businessStatus.coding[0].code
      ) {
        throw new Error('Task has no businessStatus code')
      }
      newTaskResource.businessStatus.coding[0].code = 'REJECTED'
      newTaskResource.note.push(newNote)

      const workflowResponse = {
        id: newTaskResource.id,
        type: 'REJECTED',
        user: null,
        timestamp: new Date().toUTCString(),
        comments: newTaskResource.note
      }
      return workflowResponse
    }
  }
}
