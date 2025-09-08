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

import { TRPCClientError } from '@trpc/client'
import { trpcClient } from '@client/v2-events/trpc'
import { cacheFiles } from '@client/v2-events/features/files/cache'
import { cacheUsersFromEventDocument } from '@client/v2-events/features/users/cache'
import { setEventData } from '../../useEvents/api'

export async function prefetchPotentialDuplicates(eventId: string) {
  try {
    const potentialDuplicates = await trpcClient.event.getDuplicates.query({
      eventId
    })
    for (const eventDocument of potentialDuplicates) {
      await Promise.all([
        cacheFiles(eventDocument),
        cacheUsersFromEventDocument(eventDocument)
      ])
      setEventData(eventDocument.id, eventDocument)
    }
  } catch (error) {
    if (error instanceof TRPCClientError && error.data?.httpStatus === 403) {
      // Do nothing, the user is not authorized to see duplicates
    } else {
      throw error
    }
  }
}
