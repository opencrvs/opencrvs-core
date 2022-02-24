/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { IAuthHeader } from '@gateway/common-types'
import { EVENT_TYPE } from '@gateway/features/fhir/constants'
import {
  fetchFHIR,
  getDeclarationIdsFromResponse,
  getIDFromResponse,
  getRegistrationIdsFromResponse,
  removeDuplicatesFromComposition,
  getRegistrationIds,
  getDeclarationIds
} from '@gateway/features/fhir/utils'
import {
  buildFHIRBundle,
  updateFHIRTaskBundle,
  addDownloadedTaskExtension
} from '@gateway/features/registration/fhir-builders'
import { hasScope } from '@gateway/features/user/utils'
import {
  GQLResolver,
  GQLStatusWiseRegistrationCount
} from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { COUNTRY_CONFIG_URL, FHIR_URL, SEARCH_URL } from '@gateway/constants'

export const resolvers: GQLResolver = {
  Query: {
    async searchBirthRegistrations(_, { fromDate, toDate }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('User does not have a sysadmin scope')
        )
      }
      const res = await fetchFHIR(
        `/Composition?date=gt${fromDate.toISOString()}&date=lte${toDate.toISOString()}&_count=0`,
        authHeader
      )

      const compositions: fhir.Composition[] = res.entry.map(
        ({ resource }: { resource: fhir.Composition }) => resource
      )

      return compositions.filter(({ type }) =>
        type.coding?.some(({ code }) => code === 'birth-application')
      )
    },
    async searchDeathRegistrations(_, { fromDate, toDate }, authHeader) {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('User does not have a sysadmin scope')
        )
      }
      const res = await fetchFHIR(
        `/Composition?date=gt${fromDate.toISOString()}&date=lte${toDate.toISOString()}&_count=0`,
        authHeader
      )

      const compositions: fhir.Composition[] = res.entry.map(
        ({ resource }: { resource: fhir.Composition }) => resource
      )

      return compositions.filter(({ type }) =>
        type.coding?.some(({ code }) => code === 'death-application')
      )
    },
    async fetchBirthRegistration(_, { id }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        return await markRecordAsDownloaded(id, authHeader)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async fetchDeathRegistration(_, { id }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        return await markRecordAsDownloaded(`/Composition/${id}`, authHeader)
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
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
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
          new Error('User does not have enough scope')
        )
      }
    },
    async queryPersonByNidIdentifier(_, { dob, nid, country }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        const response = await fetch(
          `${COUNTRY_CONFIG_URL}/verify/nid/${country}`,
          {
            method: 'POST',
            body: JSON.stringify({ dob, nid }),
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        ).then((data) => data.json())

        if (!response.operationResult.success) {
          throw new Error(response.operationResult.error.errorMessage)
        } else {
          return response.data
        }
      } else {
        return await Promise.reject(
          new Error('User does not have enough scope')
        )
      }
    },
    async fetchRegistrationCountByStatus(
      _,
      { locationId, status },
      authHeader
    ) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare') ||
        hasScope(authHeader, 'sysadmin')
      ) {
        const payload: {
          applicationLocationHirarchyId: string
          status: string[]
        } = {
          applicationLocationHirarchyId: locationId,
          status: status as string[]
        }
        const results: GQLStatusWiseRegistrationCount[] = await fetch(
          `${SEARCH_URL}statusWiseRegistrationCount`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        ).then((data) => data.json())
        let total = 0
        if (results && results.length > 0) {
          total = results.reduce(
            (totalCount, statusCount) => ({
              count: totalCount.count + statusCount.count
            }),
            {
              count: total
            }
          ).count
        }
        return {
          results,
          total
        }
      } else {
        return await Promise.reject(
          new Error('User does not have enough scope')
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
        return markEventAsRegistered(id, authHeader, EVENT_TYPE.BIRTH, details)
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

        await fetch(`${SEARCH_URL}/events/not-duplicate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/fhir+json',
            ...authHeader
          },
          body: JSON.stringify(composition)
        }).catch((error) => {
          return Promise.reject(
            new Error(`Search request failed: ${error.message}`)
          )
        })

        await fetch(`${FHIR_URL}/Composition/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/fhir+json',
            ...authHeader
          },
          body: JSON.stringify(composition)
        }).catch((error) => {
          return Promise.reject(
            new Error(`FHIR request failed: ${error.message}`)
          )
        })

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
  const duplicateCompostion = await lookForDuplicate(
    details && details.registration && details.registration.draftId,
    authHeader
  )

  if (duplicateCompostion) {
    if (hasScope(authHeader, 'register')) {
      return await getRegistrationIds(
        duplicateCompostion,
        event,
        false,
        authHeader
      )
    } else {
      // return tracking-id
      return await getDeclarationIds(duplicateCompostion, authHeader)
    }
  }

  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  if (hasScope(authHeader, 'register')) {
    // return the registrationNumber
    return await getRegistrationIdsFromResponse(res, event, authHeader)
  } else {
    // return tracking-id
    return await getDeclarationIdsFromResponse(res, authHeader)
  }
}

export async function lookForDuplicate(
  identifier: string,
  authHeader: IAuthHeader
) {
  const taskBundle = await fetchFHIR(
    `/Task?identifier=${identifier}`,
    authHeader
  )

  const task =
    taskBundle &&
    taskBundle.entry &&
    taskBundle.entry[0] &&
    (taskBundle.entry[0].resource as fhir.Task)

  return (
    task &&
    task.focus &&
    task.focus.reference &&
    task.focus.reference.split('/')[1]
  )
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
    doc = await buildFHIRBundle(details, event, authHeader)
  }
  await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))

  // return the full composition
  const res = await fetchFHIR(`/Composition/${id}`, authHeader)

  return res
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

async function markRecordAsDownloaded(id: string, authHeader: IAuthHeader) {
  let doc
  const taskBundle = await fetchFHIR(
    `/Task?focus=Composition/${id}`,
    authHeader
  )
  if (!taskBundle || !taskBundle.entry || !taskBundle.entry[0]) {
    throw new Error('Task does not exist')
  }
  doc = addDownloadedTaskExtension(taskBundle.entry[0])

  await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))

  // return the full composition
  return fetchFHIR(`/Composition/${id}`, authHeader)
}
