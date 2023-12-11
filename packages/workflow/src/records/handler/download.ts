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

import {
  getStatusFromTask,
  getTaskFromSavedBundle,
  hasScope,
  inScope,
  TaskStatus,
  ValidRecord
} from '@opencrvs/commons/types'
import * as Hapi from '@hapi/hapi'
import * as z from 'zod'
import { validateRequest } from '@workflow/utils/index'
import { getRecordById } from '@workflow/records/index'
import { getToken, isSystem } from '@workflow/utils/authUtils'
import { IAuthHeader } from '@opencrvs/commons'
import { toDownloaded } from '@workflow/records/state-transitions'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'

function getDownloadedOrAssignedExtension(
  authHeader: IAuthHeader,
  status: TaskStatus
) {
  if (
    inScope(authHeader, ['declare', 'recordsearch']) ||
    (hasScope(authHeader, 'validate') && status === 'VALIDATED')
  ) {
    return `http://opencrvs.org/specs/extension/regDownloaded` as const
  }
  return `http://opencrvs.org/specs/extension/regAssigned` as const
}

export async function downloadRecordHandler(
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

  const task = getTaskFromSavedBundle(record)
  const businessStatus = getStatusFromTask(task)

  if (!businessStatus) {
    throw new Error("Task didn't have any status. This should never happen")
  }

  const practitioner = await getLoggedInPractitionerResource(token)

  const extensionUrl = getDownloadedOrAssignedExtension(
    request.headers.authHeader,
    businessStatus
  )

  const downloadedRecord = await toDownloaded(
    token,
    record,
    isSystem(request),
    practitioner,
    extensionUrl
  )

  return downloadedRecord as ValidRecord
}
