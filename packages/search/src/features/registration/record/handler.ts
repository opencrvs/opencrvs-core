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
import { EVENT, SearchDocument, ValidRecord } from '@opencrvs/commons/types'
import { type Event } from '@opencrvs/records/src/storage'
import { getEventType } from '@search/utils/event'
import { indexComposition } from '@search/elasticsearch/dbhelper'
import { getOrCreateClient } from '@search/elasticsearch/client'

function isBundle(object: any): object is ValidRecord {
  return 'resourceType' in object
}
function isEvent(object: any): object is Event {
  return 'fields' in object
}

function computeEventStatus(actions: Event['actions']) {
  return 'REGISTERED'
}

function indexEvent(event: Event): SearchDocument {
  return {
    compositionId: event.id,
    event: event.type as EVENT,
    name: 'Test tester',
    lastStatusChangedAt: new Date(
      event.actions[event.actions.length - 1].createdAt
    )
      .valueOf()
      .toString(),
    type: computeEventStatus(event.actions),
    dateOfDeclaration: new Date(event.actions[0]?.createdAt)
      .valueOf()
      .toString(),
    trackingId: (
      event.actions.find((action) => action.type === 'REGISTERED') as any
    )?.identifiers.trackingId,
    registrationNumber: (
      event.actions.find((action) => action.type === 'REGISTERED') as any
    )?.identifiers.registrationNumber,
    eventLocationId: undefined /* @todo */,
    declarationLocationId: '78801f14-0266-4ca0-a34f-6a2e4c2bb936' /* @todo */,
    relatesTo: [] /* @todo */,
    createdAt: new Date(event.createdAt).valueOf().toString(),
    modifiedAt: new Date().valueOf().toString(),
    operationHistories: [],
    assignment: null
  }
}

export async function recordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const record = request.payload

  if (isBundle(record)) {
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

  if (isEvent(record)) {
    await indexComposition(record.id, indexEvent(record), getOrCreateClient())

    return h.response().code(200)
  }

  return h.response().code(400)
}
