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

import { ActionDocument } from '@opencrvs/commons'
import * as _ from 'lodash'

/** Utility to get all keys from union */
type AllKeys<T> = T extends T ? keyof T : never

/**
 * @returns unique ids of users and locations that are referenced in the ActionDocument array
 */
export const getReferenceIds = (actions: ActionDocument[]) => {
  const fieldByTypeMap = {
    userFields: ['createdBy', 'assignedTo'] satisfies AllKeys<ActionDocument>[],
    locationFields: ['createdAtLocation'] satisfies AllKeys<ActionDocument>[]
  } as const

  const ids = actions.reduce(
    (
      acc: {
        userIds: (string | undefined)[]
        locationIds: (string | undefined)[]
      },
      action
    ) => ({
      userIds: [
        ...acc.userIds,
        ...fieldByTypeMap.userFields.map((field) => _.get(action, field))
      ],
      locationIds: [
        ...acc.locationIds,
        ...fieldByTypeMap.locationFields.map((field) => _.get(action, field))
      ]
    }),
    { userIds: [], locationIds: [] }
  )

  return {
    userIds: _.uniq(ids.userIds.filter(_.isString)),
    locationIds: _.uniq(ids.locationIds.filter(_.isString))
  }
}
