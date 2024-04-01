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

import { getToken } from '@workflow/utils/auth-utils'
import { toReinstated } from '@workflow/records/state-transitions'
import { indexBundle } from '@workflow/records/search'
import { SavedBundleEntry, Task } from '@opencrvs/commons/types'
import { createRoute } from '@workflow/states'
import { auditEvent } from '@workflow/records/audit'

export const reinstateRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/reinstate',
  allowedStartStates: ['ARCHIVED'],
  action: 'REINSTATE',
  includeHistoryResources: true,
  handler: async (request, record) => {
    const token = getToken(request)

    const taskHistoryEntries = record.entry.filter(
      (e) => e.resource.resourceType === 'TaskHistory'
    ) as SavedBundleEntry<Task>[]

    if (taskHistoryEntries.length <= 0) {
      return await Promise.reject(new Error('Task history is empty'))
    }

    const prevBusinessStatuses = taskHistoryEntries.map(
      (e) => e.resource.businessStatus.coding[0].code
    )

    const filteredStatuses = prevBusinessStatuses.filter(
      (status) => status !== 'ARCHIVED'
    )

    const prevRegStatus = filteredStatuses[filteredStatuses.length - 1]

    if (!prevRegStatus) {
      return await Promise.reject(new Error('Task has no reg-status code'))
    }

    const reinstatedRecord = await toReinstated(record, prevRegStatus, token)

    await indexBundle(reinstatedRecord, token)
    await auditEvent('reinstated', reinstatedRecord, token)

    return reinstatedRecord
  }
})
