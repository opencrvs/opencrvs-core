import { IAuthHeader } from '@gateway/common-types'
import { EVENT_TYPE } from '@gateway/features/fhir/constants'
import {
  fetchFHIR,
  getDeclarationIdsFromResponse,
  getIDFromResponse,
  getRegistrationIdsFromResponse,
  removeDuplicatesFromComposition
} from '@gateway/features/fhir/utils'
import {
  buildFHIRBundle,
  updateFHIRTaskBundle
} from '@gateway/features/registration/fhir-builders'
import { hasScope } from '@gateway/features/user/utils'
import { GQLResolver } from '@gateway/graphql/schema'

export const resolvers: GQLResolver = {
  Query: {
    async fetchBirthRegistration(_, { id }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        return await fetchFHIR(`/Composition/${id}`, authHeader)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async fetchDeathRegistration(_, { id }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        return await fetchFHIR(`/Composition/${id}`, authHeader)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async queryRegistrationByIdentifier(_, { identifier }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
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
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async fetchRegistration(_, { id }, authHeader) {
      return await fetchFHIR(`/Composition/${id}`, authHeader)
    },
    async queryPersonByIdentifier(_, { identifier }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const personBundle = await fetchFHIR(
          `/Patient?identifier=${identifier}`,
          authHeader
        )
        if (!personBundle || !personBundle.entry || !personBundle.entry[0]) {
          throw new Error(`Person does not exist for identifer ${identifier}`)
        }
        const person = personBundle.entry[0].resource as fhir.Person

        return person
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async listEventRegistrations(
      _,
      { status = null, locationIds = null, count = 0, skip = 0 },
      authHeader
    ) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        return getCompositions(status, locationIds, authHeader, count, skip)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    }
  },

  Mutation: {
    async createBirthRegistration(_, { details }, authHeader) {
      return await createEventRegistration(
        details,
        authHeader,
        EVENT_TYPE.BIRTH
      )
    },
    async createDeathRegistration(_, { details }, authHeader) {
      return await createEventRegistration(
        details,
        authHeader,
        EVENT_TYPE.DEATH
      )
    },
    async updateBirthRegistration(_, { details }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const doc = await buildFHIRBundle(details, EVENT_TYPE.BIRTH, authHeader)

        const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
        // return composition-id
        return getIDFromResponse(res)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async markBirthAsValidated(_, { id, details }, authHeader) {
      if (hasScope(authHeader, 'validate')) {
        await markEventAsValidated(id, authHeader, EVENT_TYPE.BIRTH, details)
      } else {
        await Promise.reject(new Error('User does not have a validate scope'))
      }
    },
    async markDeathAsValidated(_, { id, details }, authHeader) {
      if (hasScope(authHeader, 'validate')) {
        await markEventAsValidated(id, authHeader, EVENT_TYPE.DEATH, details)
      } else {
        await Promise.reject(new Error('User does not have a validate scope'))
      }
    },
    async markBirthAsRegistered(_, { id, details }, authHeader) {
      if (hasScope(authHeader, 'register')) {
        return await markEventAsRegistered(
          id,
          authHeader,
          EVENT_TYPE.BIRTH,
          details
        )
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markDeathAsRegistered(_, { id, details }, authHeader) {
      if (hasScope(authHeader, 'register')) {
        return await markEventAsRegistered(
          id,
          authHeader,
          EVENT_TYPE.DEATH,
          details
        )
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markEventAsVoided(_, { id, reason, comment }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
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
        await fetchFHIR(
          '/Task',
          authHeader,
          'PUT',
          JSON.stringify(newTaskBundle)
        )
        // return the taskId
        return taskEntry.resource.id
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async markBirthAsCertified(_, { details }, authHeader) {
      if (hasScope(authHeader, 'certify')) {
        return await markEventAsCertified(details, authHeader, EVENT_TYPE.BIRTH)
      } else {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
    },
    async markDeathAsCertified(_, { details }, authHeader) {
      if (hasScope(authHeader, 'certify')) {
        return await markEventAsCertified(details, authHeader, EVENT_TYPE.DEATH)
      } else {
        return await Promise.reject(
          new Error('User does not have a certify scope')
        )
      }
    },
    async notADuplicate(_, { id, duplicateId }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
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
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    }
  }
}

async function createEventRegistration(
  details: any,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  const doc = await buildFHIRBundle(details, event, authHeader)

  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  if (hasScope(authHeader, 'register')) {
    // return the registrationNumber
    return await getRegistrationIdsFromResponse(res, event, authHeader)
  } else {
    // return tracking-id
    return await getDeclarationIdsFromResponse(res, authHeader)
  }
}

async function markEventAsValidated(
  id: string,
  authHeader: IAuthHeader,
  event: EVENT_TYPE,
  details?: any
) {
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
    doc = await buildFHIRBundle(details, event, authHeader)
  }

  await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
}

async function markEventAsRegistered(
  id: string,
  authHeader: IAuthHeader,
  event: EVENT_TYPE,
  details?: any
) {
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
    doc = await buildFHIRBundle(details, event)
  }

  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  // return the registrationNumber
  return await getRegistrationIdsFromResponse(res, event, authHeader)
}

async function markEventAsCertified(
  details: any,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  const doc = await buildFHIRBundle(details, event, authHeader)

  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  // return composition-id
  return getIDFromResponse(res)
}

async function getCompositions(
  status: string | null,
  locationIds: Array<string | null> | null,
  authHeader: IAuthHeader,
  count: number,
  skip: number
) {
  let tasksResponses: fhir.Bundle[]
  if (locationIds) {
    tasksResponses = await Promise.all(
      locationIds.map(locationId => {
        return fetchFHIR(
          `/Task?location=Location/${locationId}${
            status ? `&business-status=${status}` : ''
          }&_count=0`,
          authHeader
        )
      })
    )
  } else {
    tasksResponses = [
      await fetchFHIR(
        `/Task?_count=0${status ? `&business-status=${status}` : ''}`,
        authHeader
      )
    ]
  }

  const compositions = await Promise.all(
    tasksResponses.map(tasksResponse => {
      return getCompositionByTask(tasksResponse, authHeader)
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

async function getCompositionByTask(
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
