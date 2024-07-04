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
import { indexRecord as upsertBirthEvent } from '@search/features/registration/birth/service'
import { indexRecord as upsertDeathEvent } from '@search/features/registration/death/service'
import { indexRecord as upsertMarriageEvent } from '@search/features/registration/marriage/service'

import * as Hapi from '@hapi/hapi'
import { ValidRecord } from '@opencrvs/commons/types'
import { getEventType } from '@search/utils/event'

export async function recordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const record = request.payload as ValidRecord

  switch (getEventType(record)) {
    case 'BIRTH':
      await upsertBirthEvent(record)
      break
    case 'DEATH':
      await upsertDeathEvent(record)
      break
    case 'MARRIAGE':
      await upsertMarriageEvent(record)
      break
    default:
      throw new Error('Unsupported event type')
  }

  return h.response().code(200)
}
