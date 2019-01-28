import {
  buildFHIRBundle,
  updateFHIRTaskBundle
} from 'src/features/registration/fhir-builders'
import { GQLResolver } from 'src/graphql/schema'
import {
  fetchFHIR,
  getIDFromResponse,
  getTrackingIdFromResponse,
  getBRNFromResponse,
  removeDuplicatesFromComposition
} from 'src/features/fhir/utils'
import { IAuthHeader } from 'src/common-types'
import { getUserMobile, convertToLocal } from 'src/features/user/utils'
import { COUNTRY } from 'src/constants'

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
    },
    async listUserRecentRecords(_, { userId }, authHeader) {
      if (userId) {
        return getCompositionsByUser(userId, authHeader)
      } else {
        throw new Error('User ID does not exist')
      }
    }
  },

  Mutation: {
    async createBirthRegistration(_, { details }, authHeader) {
      const doc = await buildFHIRBundle(details)

      const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
      // return tracking-id
      return await getTrackingIdFromResponse(res, authHeader)
    },
    async updateBirthRegistration(_, { details }, authHeader) {
      const doc = await buildFHIRBundle(details)

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
        doc = await buildFHIRBundle(details)
      }

      const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
      // return the brn
      return await getBRNFromResponse(res, authHeader)
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
      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(newTaskBundle))
      // return the taskId
      return taskEntry.resource.id
    },
    async markBirthAsCertified(_, { details }, authHeader) {
      const doc = await buildFHIRBundle(details)

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
  authHeader: IAuthHeader
) {
  const tasksResponses = await Promise.all(
    locationIds.map(locationId => {
      return fetchFHIR(`/Task?location=Location/${locationId}`, authHeader)
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

async function getPractitionerResource(
  userId: string,
  authHeader: IAuthHeader
): Promise<fhir.Practitioner> {
  const userMobileResponse = await getUserMobile(userId, authHeader)
  const localMobile = convertToLocal(userMobileResponse.mobile, COUNTRY)
  const practitionerBundle = await fetchFHIR(
    `/Practitioner?telecom=phone|${localMobile}`,
    authHeader
  )
  if (
    !practitionerBundle ||
    !practitionerBundle.entry ||
    !practitionerBundle.entry[0] ||
    !practitionerBundle.entry[0].resource
  ) {
    throw new Error('Practitioner resource not found')
  }
  return practitionerBundle.entry[0].resource
}

async function getCompositionsByUser(userId: string, authHeader: IAuthHeader) {
  const practitionerResource = (await getPractitionerResource(
    userId,
    authHeader
  )) as fhir.Practitioner

  const tasksResponses = (await fetchFHIR(
    `/Task?user=Practitioner/${
      practitionerResource.id
    }&business-status=DECLARED&_count=50`,
    authHeader
  )) as fhir.Bundle
  const compositions =
    (await getComposition(tasksResponses, authHeader)) || ([] as fhir.Bundle[])

  const flattened = compositions.reduce((a, b) => a && a.concat(b), [])

  const filteredComposition =
    flattened &&
    flattened.filter((composition: fhir.Bundle) => composition !== undefined)
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
