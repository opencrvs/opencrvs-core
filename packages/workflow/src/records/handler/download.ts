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
  getTaskFromSavedBundle
} from '@opencrvs/commons/types'
import * as Hapi from '@hapi/hapi'
import * as z from 'zod'
import { validateRequest } from '@workflow/utils/index'
import { getValidRecordById } from '@workflow/records/index'
import { getToken } from '@workflow/utils/auth-utils'
import { getTokenPayload, logger } from '@opencrvs/commons'
import { toDownloaded } from '@workflow/records/state-transitions'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundleToRoute } from '@workflow/records/search'
import { auditEvent } from '@workflow/records/audit'
import { findAssignment } from '@opencrvs/commons/assignment'
import { getUser } from '@workflow/features/user/utils'

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
  const tokenPayload = getTokenPayload(token)
  // Task history is fetched rather than the task only
  const record = await getValidRecordById(payload.id, token, true)

  const task = getTaskFromSavedBundle(record)
  const businessStatus = getStatusFromTask(task)

  if (!businessStatus) {
    throw new Error("Task didn't have any status. This should never happen")
  }

  const { downloadedBundleWithResources, downloadedRecord } =
    await toDownloaded(record, token)

  const assignment = findAssignment(record)
  if (assignment) {
    const user = await getUser(tokenPayload.sub, {
      Authorization: `Bearer ${token}`
    })
    const practitionerId = user.practitionerId

    if (assignment.practitioner.id !== practitionerId)
      throw new Error('Record is assigned to a different user')
  }

  /*
   * Storing the details of the downloaded record in the database(s) is slow.
   * So we return the requested record to the requesting users optimistically immediately.
   * The time difference is 50ms when not waiting and 1000ms when waiting.
   */
  process.nextTick(async () => {
    try {
      // Here the sent bundle is saved with task only
      await sendBundleToHearth(downloadedBundleWithResources)
      await auditEvent('assigned', downloadedRecord, token)

      await indexBundleToRoute(downloadedRecord, token, '/events/assigned')
    } catch (error) {
      logger.error(error)
    }
  })

  return downloadedRecord
}
