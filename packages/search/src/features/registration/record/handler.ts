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
import { upsertEvent as upsertBirthEvent } from '@search/features/registration/birth/service'
import { upsertEvent as upsertDeathEvent } from '@search/features/registration/death/service'
import { upsertEvent as upsertMarriageEvent } from '@search/features/registration/marriage/service'

import { logger } from '@search/logger'
import { internal } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'

function getEventType(bundle: fhir.Bundle) {
  const task = bundle
    .entry!.map(({ resource }) => resource)
    .find(
      (resource): resource is fhir.Task => resource!.resourceType === 'Task'
    )
  if (!task) {
    throw new Error('No task found')
  }
  const type = task.code!.coding![0].code
  return type
}

export async function recordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const bundle = request.payload as fhir.Bundle

  try {
    switch (getEventType(bundle)) {
      case 'BIRTH':
        await upsertBirthEvent(request)
        break
      case 'DEATH':
        await upsertDeathEvent(request)
        break
      case 'MARRIAGE':
        await upsertMarriageEvent(request)
        break
      default:
        throw new Error('Unsupported event type')
    }
  } catch (error) {
    logger.error(`Search/recordHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}
