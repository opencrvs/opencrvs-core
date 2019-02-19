import {
  buildFHIRBundle,
  updateFHIRTaskBundle
} from 'src/features/registration/fhir-builders'
import { GQLResolver } from 'src/graphql/schema'
import {
  fetchFHIR,
  getIDFromResponse,
  getTrackingIdFromResponse,
  getRegistrationNumberFromResponse,
  removeDuplicatesFromComposition
} from 'src/features/fhir/utils'
import { IAuthHeader } from 'src/common-types'
import { hasScope } from 'src/features/user/utils'
import { EVENT_TYPE } from '../fhir/constants'

const statusMap = {
  declared: 'preliminary',
  registered: 'final'
}

export const resolvers: GQLResolver = {
  Query: {
    async fetchBirthRegistration(_, { id }, authHeader) {
      return await fetchFHIR(`/Composition/${id}`, authHeader)
    },
    async fetchDeathRegistration(_, { id }, authHeader) {
      return await fetchFHIR(`/Composition/${id}`, authHeader)
    },
    async queryRegistrationByIdentifier(_, { identifier }, authHeader) {
      const taskBundle = await fetchFHIR(
        `/Task?identifier=${identifier}`,
        authHeader
      )

      if (!taskBundle || !taskBundle.entry || !taskBundle.entry[0]) {
        throw new Error(`Task does not exist for identifer ${identifier}`)
      }
      const task = taskBundle.entry[0].resource as fhir.Task

      if (!task.focus || !task.focus.reference) {
        throw new Error(`Composition reference not found`)
      }

      return await fetchFHIR(`/${task.focus.reference}`, authHeader)
    },
    async listEventRegistrations(
      _,
      { status, locationIds, count = 0, skip = 0 },
      authHeader
    ) {
      if (locationIds) {
        return getCompositionsByLocation(locationIds, authHeader, count, skip)
      } else {
        const bundle = await fetchFHIR(
          `/Composition${
            status ? `?status=${statusMap[status]}&` : '?'
          }_count=${count}&_getpagesoffset=${skip}`,
          authHeader
        )
        return {
          results: bundle.entry.map(
            (entry: { resource: {} }) => entry.resource
          ),
          totalItems: bundle.total
        }
      }
    }
  },

  Mutation: {
    async createBirthRegistration(_, { details }, authHeader) {
      const doc = await buildFHIRBundle(details, EVENT_TYPE.BIRTH)

      const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
      if (hasScope(authHeader, 'register')) {
        // return the brn
        return await getRegistrationNumberFromResponse(
          res,
          EVENT_TYPE.BIRTH,
          authHeader
        )
      } else {
        // return tracking-id
        return await getTrackingIdFromResponse(res, authHeader)
      }
    },
    async createDeathRegistration(_, { details }, authHeader) {
      const doc = await buildFHIRBundle(details, EVENT_TYPE.DEATH)

      const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
      if (hasScope(authHeader, 'register')) {
        // return the brn
        return await getRegistrationNumberFromResponse(
          res,
          EVENT_TYPE.DEATH,
          authHeader
        )
      } else {
        // return tracking-id
        return await getTrackingIdFromResponse(res, authHeader)
      }
    },
    async updateBirthRegistration(_, { details }, authHeader) {
      const doc = await buildFHIRBundle(details, EVENT_TYPE.BIRTH)

      const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
      // return composition-id
      return getIDFromResponse(res)
    },
    async markBirthAsRegistered(_, { id, details }, authHeader) {
      let doc
      if (!details) {
        const taskBundle = await fetchFHIR(
          `/Task?focus=Composition/${id}`,
          authHeader
        )
        if (!taskBundle || !taskBundle.entry || !taskBundle.entry[0]) {
          throw new Error('Task does not exist')
        }
        doc = {
          resourceType: 'Bundle',
          type: 'document',
          entry: taskBundle.entry
        }
      } else {
        doc = await buildFHIRBundle(details, EVENT_TYPE.BIRTH)
      }

      const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
      // return the brn
      return await getRegistrationNumberFromResponse(
        res,
        EVENT_TYPE.BIRTH,
        authHeader
      )
    },
    async markEventAsVoided(_, { id, reason, comment }, authHeader) {
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
      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(newTaskBundle))
      // return the taskId
      return taskEntry.resource.id
    },
    async markBirthAsCertified(_, { details }, authHeader) {
      const doc = await buildFHIRBundle(details, EVENT_TYPE.BIRTH, authHeader)

      const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
      // return composition-id
      return getIDFromResponse(res)
    },
    async notADuplicate(_, { id, duplicateId }, authHeader) {
      const composition = await fetchFHIR(
        `/Composition/${id}`,
        authHeader,
        'GET'
      )
      removeDuplicatesFromComposition(composition, id, duplicateId)
      await fetchFHIR(
        `/Composition/${id}`,
        authHeader,
        'PUT',
        JSON.stringify(composition)
      )
      return composition.id
    }
  }
}

async function getCompositionsByLocation(
  locationIds: Array<string | null>,
  authHeader: IAuthHeader,
  count: number,
  skip: number
) {
  const tasksResponses = await Promise.all(
    locationIds.map(locationId => {
      return fetchFHIR(
        `/Task?location=Location/${locationId}&_count=0`,
        authHeader
      )
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

  // TODO: we should rather try do the skip and count in Hearth directly for efficiency, that would require a more complex query
  return {
    totalItems: (filteredComposition && filteredComposition.length) || 0,
    results:
      filteredComposition && filteredComposition.slice(skip, skip + count)
  }
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
