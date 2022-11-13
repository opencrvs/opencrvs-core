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
import {
  EVENT_TYPE,
  DOWNLOADED_EXTENSION_URL,
  REINSTATED_EXTENSION_URL,
  ASSIGNED_EXTENSION_URL,
  UNASSIGNED_EXTENSION_URL,
  REQUEST_CORRECTION_EXTENSION_URL,
  METRICS_URL
} from '@gateway/features/fhir/constants'
import {
  fetchFHIR,
  getDeclarationIdsFromResponse,
  getIDFromResponse,
  getRegistrationIdsFromResponse,
  removeDuplicatesFromComposition,
  getRegistrationIds,
  getDeclarationIds,
  getStatusFromTask,
  setCertificateCollector,
  getClientIdFromToken
} from '@gateway/features/fhir/utils'
import {
  buildFHIRBundle,
  updateFHIRTaskBundle,
  ITaskBundle,
  checkUserAssignment,
  taskBundleWithExtension
} from '@gateway/features/registration/fhir-builders'
import { getUser, hasScope, inScope } from '@gateway/features/user/utils'
import {
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput,
  GQLRegStatus,
  GQLResolver,
  GQLStatusWiseRegistrationCount
} from '@gateway/graphql/schema'
import fetch from 'node-fetch'
import { COUNTRY_CONFIG_URL, FHIR_URL, SEARCH_URL } from '@gateway/constants'
import { UnassignError } from '@gateway/utils/unassignError'
import { UserInputError } from 'apollo-server-hapi'
import {
  validateBirthDeclarationAttachments,
  validateDeathDeclarationAttachments
} from '@gateway/utils/validators'
import { resolve } from 'url'

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
        type.coding?.some(({ code }) => code === 'birth-declaration')
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
        type.coding?.some(({ code }) => code === 'death-declaration')
      )
    },
    async fetchBirthRegistration(_, { id }, authHeader) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        return await markRecordAsDownloadedOrAssigned(id, authHeader)
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
        return await markRecordAsDownloadedOrAssigned(id, authHeader)
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
      { locationId, status, event },
      authHeader
    ) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare') ||
        hasScope(authHeader, 'sysadmin') ||
        hasScope(authHeader, 'performance')
      ) {
        const payload: {
          declarationLocationHirarchyId?: string
          status: string[]
          event?: string
        } = {
          declarationLocationHirarchyId: locationId,
          status: status as string[],
          event
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
      try {
        await validateBirthDeclarationAttachments(details)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      return createEventRegistration(details, authHeader, EVENT_TYPE.BIRTH)
    },
    async createDeathRegistration(_, { details }, authHeader) {
      try {
        await validateDeathDeclarationAttachments(details)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      return createEventRegistration(details, authHeader, EVENT_TYPE.DEATH)
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
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!hasScope(authHeader, 'validate')) {
        return await Promise.reject(
          new Error('User does not have a validate scope')
        )
      } else {
        return await markEventAsValidated(
          id,
          authHeader,
          EVENT_TYPE.BIRTH,
          details
        )
      }
    },
    async markDeathAsValidated(_, { id, details }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!hasScope(authHeader, 'validate')) {
        return await Promise.reject(
          new Error('User does not have a validate scope')
        )
      }
      return await markEventAsValidated(
        id,
        authHeader,
        EVENT_TYPE.DEATH,
        details
      )
    },
    async markBirthAsRegistered(_, { id, details }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'register')) {
        return markEventAsRegistered(id, authHeader, EVENT_TYPE.BIRTH, details)
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markDeathAsRegistered(_, { id, details }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
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
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
      const taskEntry = await getTaskEntry(id, authHeader)
      const newTaskBundle = await updateFHIRTaskBundle(
        taskEntry,
        GQLRegStatus.REJECTED,
        reason,
        comment
      )

      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(newTaskBundle))
      // return the taskId
      return taskEntry.resource.id
    },
    async markEventAsArchived(_, { id }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
      const taskEntry = await getTaskEntry(id, authHeader)
      const newTaskBundle = await updateFHIRTaskBundle(
        taskEntry,
        GQLRegStatus.ARCHIVED
      )
      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(newTaskBundle))

      const userId = getClientIdFromToken(authHeader.Authorization)
      const user = await getUser({ userId }, authHeader)
      await postUserActionToMetrics(
        'ARCHIVED',
        user.practitionerId,
        authHeader['x-real-ip']!,
        authHeader['x-real-user-agent']!
      )
      // return the taskId
      return taskEntry.resource.id
    },
    async markEventAsReinstated(_, { id }, authHeader) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
      const taskEntry = await getTaskEntry(id, authHeader)

      const taskId = taskEntry.resource.id

      const prevRegStatus =
        taskId && (await getPreviousRegStatus(taskId, authHeader))
      if (!prevRegStatus) {
        return await Promise.reject(new Error('Task has no reg-status code'))
      }

      taskEntry.resource.extension = [
        ...(taskEntry.resource.extension ?? []),
        { url: REINSTATED_EXTENSION_URL }
      ]

      const newTaskBundle = await updateFHIRTaskBundle(taskEntry, prevRegStatus)

      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(newTaskBundle))

      return {
        taskEntryResourceID: taskId,
        registrationStatus: prevRegStatus
      }
    },
    async markBirthAsCertified(_, { id, details }, authHeader) {
      if (hasScope(authHeader, 'certify')) {
        return await markEventAsCertified(details, authHeader, EVENT_TYPE.BIRTH)
      } else {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
    },
    async markDeathAsCertified(_, { id, details }, authHeader) {
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
    },
    async markEventAsUnassigned(_, { id }, authHeader) {
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
      const taskEntry = await getTaskEntry(id, authHeader)
      const taskBundle = taskBundleWithExtension(taskEntry, {
        url: UNASSIGNED_EXTENSION_URL
      })
      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(taskBundle))
      // return the taskId
      return taskEntry.resource.id
    }
  }
}

async function createEventRegistration(
  details: GQLBirthRegistrationInput | GQLDeathRegistrationInput,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  const doc = await buildFHIRBundle(details, event, authHeader)
  const draftId =
    details && details.registration && details.registration.draftId

  const duplicateCompostion =
    draftId && (await lookForDuplicate(draftId, authHeader))

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

  const userId = getClientIdFromToken(authHeader.Authorization)
  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  let action = 'SENT_FOR_REVIEW'
  if (res.entry.length < 10) {
    action = 'INCOMPLETE'
  }
  const user = await getUser({ userId }, authHeader)
  await postUserActionToMetrics(
    action,
    user.practitionerId,
    authHeader['x-real-ip']!,
    authHeader['x-real-user-agent']!
  )
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
  const taskBundle = await fetchFHIR<fhir.Bundle>(
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
    const taskEntry = await getTaskEntry(id, authHeader)

    doc = {
      resourceType: 'Bundle',
      type: 'document',
      entry: taskEntry
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
  details: GQLBirthRegistrationInput | GQLDeathRegistrationInput
) {
  const doc = await buildFHIRBundle(details, event, authHeader)

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
  await setCertificateCollector(details, authHeader)
  const doc = await buildFHIRBundle(details, event, authHeader)

  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  // return composition-id
  return getIDFromResponse(res)
}

const ACTION_EXTENSIONS = [
  ASSIGNED_EXTENSION_URL,
  UNASSIGNED_EXTENSION_URL,
  DOWNLOADED_EXTENSION_URL,
  REINSTATED_EXTENSION_URL,
  REQUEST_CORRECTION_EXTENSION_URL
]

async function getTaskEntry(compositionId: string, authHeader: IAuthHeader) {
  const taskBundle: ITaskBundle = await fetchFHIR(
    `/Task?focus=Composition/${compositionId}`,
    authHeader
  )
  const taskEntry = taskBundle.entry[0]
  if (!taskEntry) {
    throw new Error('Task does not exist')
  }
  taskEntry.resource.extension = taskEntry.resource.extension?.filter(
    ({ url }) => !ACTION_EXTENSIONS.includes(url)
  )
  return taskEntry
}

function getDownloadedOrAssignedExtension(
  authHeader: IAuthHeader,
  status: string
): fhir.Extension {
  if (
    inScope(authHeader, ['declare', 'recordsearch']) ||
    (hasScope(authHeader, 'validate') && status === GQLRegStatus.VALIDATED)
  ) {
    return {
      url: DOWNLOADED_EXTENSION_URL
    }
  }
  return {
    url: ASSIGNED_EXTENSION_URL
  }
}

async function getPreviousRegStatus(taskId: string, authHeader: IAuthHeader) {
  const taskHistoryBundle: fhir.Bundle = await fetchFHIR(
    `/Task/${taskId}/_history`,
    authHeader
  )

  const taskHistory = taskHistoryBundle.entry?.map((taskEntry) => {
    return taskEntry.resource as fhir.Task
  })

  if (!taskHistory) {
    throw new Error('Task has no history')
  }

  const filteredTaskHistory = taskHistory.filter((task) => {
    return (
      task.businessStatus?.coding &&
      task.businessStatus?.coding[0].code !== 'ARCHIVED'
    )
  })
  return filteredTaskHistory[0] && getStatusFromTask(filteredTaskHistory[0])
}

export async function markRecordAsDownloadedOrAssigned(
  id: string,
  authHeader: IAuthHeader
) {
  const taskEntry = await getTaskEntry(id, authHeader)

  const businessStatus = getStatusFromTask(taskEntry.resource) as GQLRegStatus

  const extension = getDownloadedOrAssignedExtension(authHeader, businessStatus)

  const taskBundle = taskBundleWithExtension(taskEntry, extension)

  await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(taskBundle))

  // return the full composition
  return fetchFHIR(`/Composition/${id}`, authHeader)
}

export async function postUserActionToMetrics(
  action: string,
  practitionerId: string,
  remoteAddress: string,
  userAgent: string
) {
  const url = resolve(METRICS_URL, '/audit/events')
  const body = {
    action: action,
    practitionerId: practitionerId
  }
  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': remoteAddress,
      'x-real-user-agent': userAgent
    }
  })
}
