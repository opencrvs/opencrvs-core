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

import { isExpectedAccessError, trpcClient } from '@client/v2-events/trpc'
import {
  cacheFilesFromEventDocument,
  getFilesFromEventDcouments
} from '@client/v2-events/features/files/cache'
import { precacheUsers } from '@client/v2-events/features/users/cache'
import { getUserIdsFromEventDocuments } from '@client/v2-events/features/users/utils'
import { precacheFiles } from '@client/v2-events/cache'
import { setEventData } from '../../useEvents/api'

export async function prefetchPotentialDuplicates(eventId: string) {
  try {
    const potentialDuplicates = await trpcClient.event.getDuplicates.query({
      eventId
    })

    const filenames = getFilesFromEventDcouments(potentialDuplicates)
    const userIds = getUserIdsFromEventDocuments(potentialDuplicates)

    for (const eventDocument of potentialDuplicates) {
      await Promise.all([precacheFiles(filenames), precacheUsers(userIds)])
      setEventData(eventDocument.id, eventDocument)
    }
  } catch (error) {
    // The user is not authorized to see duplicates — otherwise, rethrow.
    if (!isExpectedAccessError(error)) {
      throw error
    }
  }
}
