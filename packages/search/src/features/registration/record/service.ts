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
import { SavedBundle } from '@opencrvs/commons/types'
import { indexRecord as upsertBirthEvent } from '@search/features/registration/birth/service'
import { indexRecord as upsertDeathEvent } from '@search/features/registration/death/service'
import { indexRecord as upsertMarriageEvent } from '@search/features/registration/marriage/service'
import { getEventType } from '@search/utils/event'

export async function indexRecord(record: SavedBundle, transactionId?: string) {
  switch (getEventType(record)) {
    case 'BIRTH':
      return upsertBirthEvent(record, transactionId)
    case 'DEATH':
      return upsertDeathEvent(record, transactionId)
    case 'MARRIAGE':
      return upsertMarriageEvent(record, transactionId)
    default:
      throw new Error('Unsupported event type')
  }
}
