/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as Hapi from '@hapi/hapi'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import * as z from 'zod'
import { getRecordById } from '@workflow/records/index'
import { toUnassigned } from '@workflow/records/state-transitions'
import { indexBundleToRoute } from '@workflow/records/search'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { auditEvent } from '@workflow/records/audit'
import {
  Extension,
  findExtension,
  isTaskOrTaskHistory,
  Resource,
  resourceIdentifierToUUID,
  Task,
  TaskHistory
} from '@opencrvs/commons/types'
import { getTokenPayload } from '@opencrvs/commons/authentication'
import { getUserOrSystemByCriteria } from '@workflow/records/user'
import { getTaskBusinessStatus } from '@workflow/features/task/fhir/utils'

function sortDescending(
  a: Resource & { lastModified: string },
  b: Resource & { lastModified: string }
) {
  return new Date(b.lastModified).valueOf() - new Date(a.lastModified).valueOf()
}

function findTaskIndexByExtension<T extends Task | TaskHistory>(
  tasks: T[],
  extensionUrl: Extension['url']
) {
  return tasks.findIndex((entry) =>
    entry.extension.some((ext) => ext.url === extensionUrl)
  )
}

const getLastUnassignedTaskIndex = (index1: number, index2: number) => {
  if (index1 === -1) return index2
  if (index2 === -1) return index1
  return Math.min(index1, index2)
}

export async function unassignRecordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = validateRequest(
    z.object({
      id: z.string()
    }),
    request.payload
  )

  const token = getToken(request)
  const tokenPayload = getTokenPayload(token)
  const record = await getRecordById(
    // Task history is fetched rather than the task only
    `${payload.id}?includeHistoryResources`,
    token,
    [
      'CERTIFIED',
      'VALIDATED',
      'IN_PROGRESS',
      'READY_FOR_REVIEW',
      'REGISTERED',
      'ISSUED',
      'CORRECTION_REQUESTED'
    ]
  )

  const allTasks = record.entry
    .map(({ resource }) => resource)
    .filter(isTaskOrTaskHistory)
    .sort(sortDescending)

  // declaration is unassigned when status changes
  const latestChangedStatusIndex = allTasks.findIndex(
    (entry, index, array) =>
      index < array.length - 1 &&
      getTaskBusinessStatus(entry) !== getTaskBusinessStatus(array[index + 1])
  )

  const unassignIndex = findTaskIndexByExtension(
    allTasks,
    'http://opencrvs.org/specs/extension/regUnassigned'
  )

  const lastUnassignedTaskIndex = getLastUnassignedTaskIndex(
    latestChangedStatusIndex,
    unassignIndex
  )

  const lastAssignedTaskIndex = findTaskIndexByExtension(
    allTasks,
    'http://opencrvs.org/specs/extension/regAssigned'
  )

  if (lastAssignedTaskIndex === -1) throw new Error('Not assigned yet')

  // check for unassigned task and status change
  if (
    lastUnassignedTaskIndex !== -1 &&
    lastAssignedTaskIndex > lastUnassignedTaskIndex
  )
    throw new Error('Declaration is found unassigned already')

  const task = allTasks[lastAssignedTaskIndex]

  const regLastUser = findExtension(
    'http://opencrvs.org/specs/extension/regLastUser',
    task.extension
  )

  if (!regLastUser) throw new Error('No user is found assigned to this record')

  const practitionerId = resourceIdentifierToUUID(
    regLastUser.valueReference.reference
  )

  const lastUser = await getUserOrSystemByCriteria({ practitionerId }, token)

  // Non-registrars can't unassign declarations from registrars
  if (
    !tokenPayload.scope.includes('register') &&
    lastUser.scope?.includes('register')
  ) {
    throw new Error('The declaration cannot be unassigned by this type of user')
  }

  const { unassignedRecord, unassignedRecordWithTaskOnly } = await toUnassigned(
    record,
    token
  )

  await sendBundleToHearth(unassignedRecordWithTaskOnly)
  await indexBundleToRoute(
    unassignedRecordWithTaskOnly,
    token,
    '/events/unassigned'
  )
  await auditEvent('unassigned', unassignedRecord, token)

  return unassignedRecord
}
