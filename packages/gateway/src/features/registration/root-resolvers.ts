import {
  buildFHIRBundle,
  updateFHIRTaskBundle
} from 'src/features/registration/fhir-builders'
import { GQLResolver } from 'src/graphql/schema'
import { fetchFHIR, getTrackingId } from 'src/features/fhir/utils'
import { IAuthHeader } from 'src/common-types'

const statusMap = {
  declared: 'preliminary',
  registered: 'final'
}

export const resolvers: GQLResolver = {
  Query: {
    async fetchBirthRegistration(_, { id }, authHeader) {
      return await fetchFHIR(`/Composition/${id}`, authHeader)
    },
    async listBirthRegistrations(_, { status, locationIds }, authHeader) {
      if (locationIds) {
        return getCompositionsByLocation(locationIds, authHeader)
      }
      const bundle = await fetchFHIR(
        `/Composition${status ? `?status=${statusMap[status]}&` : '?'}_count=0`,
        authHeader
      )

      return bundle.entry.map((entry: { resource: {} }) => entry.resource)
    }
  },

  Mutation: {
    async createBirthRegistration(_, { details }, authHeader) {
      const doc = await buildFHIRBundle(details)

      const resBody: fhir.Bundle = await fetchFHIR(
        '',
        authHeader,
        'POST',
        JSON.stringify(doc)
      )

      if (
        !resBody ||
        !resBody.entry ||
        !resBody.entry[0] ||
        !resBody.entry[0].response ||
        !resBody.entry[0].response.location
      ) {
        throw new Error(`Workflow response did not send a valid response`)
      }

      const composition = await fetchFHIR(
        resBody.entry[0].response.location.replace('/fhir', ''),
        authHeader
      )

      // return the trackingid
      return getTrackingId(composition)
    },
    async markBirthAsVoided(_, { id, reason, comment }, authHeader) {
      const taskBundle = await fetchFHIR(
        `/Task?focus=Composition/${id}`,
        authHeader
      )
      const taskEntry = taskBundle.entry[0]
      if (!taskEntry) {
        throw new Error('Task does not exist')
      }
      const status = 'REJECTED'
      const newTaskBundle = await updateFHIRTaskBundle(
        taskEntry,
        status,
        reason,
        comment
      )
      const resBody = await fetchFHIR(
        `/Task`,
        authHeader,
        'PUT',
        JSON.stringify(newTaskBundle)
      )

      if (!resBody || !resBody.taskId) {
        throw new Error(`Workflow response did not send a valid response`)
      }
      // return the taskId
      return resBody.taskId
    }
  }
}

async function getCompositionsByLocation(
  locationIds: Array<string | null>,
  authHeader: IAuthHeader
) {
  const tasksResponses = await Promise.all(
    locationIds.map(locationId => {
      return fetchFHIR(`/Task?location=${locationId}`, authHeader)
    })
  )

  const compositions = await Promise.all(
    tasksResponses.map(tasksResponse => {
      return getComposition(tasksResponse, authHeader)
    })
  )

  const flattened = compositions.reduce((a, b) => a && a.concat(b), [])

  const filteredComposition =
    flattened && flattened.filter(composition => composition !== undefined)
  return filteredComposition
}

async function getComposition(
  tasksResponse: fhir.Bundle,
  authHeader: IAuthHeader
) {
  return (
    tasksResponse.entry &&
    (await Promise.all(
      tasksResponse.entry.map((task: fhir.BundleEntry) => {
        const resource = task.resource as fhir.Task
        return (
          resource.focus &&
          fetchFHIR(`/${resource.focus.reference}`, authHeader)
        )
      })
    ))
  )
}
