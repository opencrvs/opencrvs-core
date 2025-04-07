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

import { EventDocument, EventIndex } from '@opencrvs/commons/client'
import _ from 'lodash'

export function findUserIdsFromDocument(eventDocument: EventDocument) {
  return _.uniq(
    eventDocument.actions
      .map((action) => ('createdBy' in action ? action.createdBy : undefined))
      .filter((maybeUserId): maybeUserId is string => Boolean(maybeUserId))
  )
}

export function findUserIdsFromIndex(eventIndex: EventIndex) {
  return _.uniq(
    [eventIndex.assignedTo, eventIndex.createdBy, eventIndex.updatedBy].filter(
      (maybeUserId): maybeUserId is string => Boolean(maybeUserId)
    )
  )
}
