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

// Utility to get all keys from union
type AllKeys<T> = T extends T ? keyof T : never

import { ActionDocument, ResolvedActionDocument } from '@opencrvs/commons'
import * as _ from 'lodash'

const ActionDocumentKeyResolveMap = {
  user: ['createdBy', 'assignedTo'] satisfies AllKeys<ActionDocument>[],
  location: ['createdAtLocation'] satisfies AllKeys<ActionDocument>[]
} as const

/**
 *
 * @param events
 * @returns unique ids of users and locations that are referenced in the ActionDocument array
 */
export const getReferenceIds = (actions: ActionDocument[]) => {
  return Object.fromEntries(
    _.toPairs(ActionDocumentKeyResolveMap).map(([category, keys]) => [
      category,
      _.uniq(
        actions.flatMap((action) =>
          keys.map((key) => _.get(action, key)).filter((v) => !_.isNil(v))
        )
      )
    ])
  )
}

export const replaceReferenceIdWithValue = (
  action: ActionDocument,
  resolvedRefs: { user: { id: string }[]; location: { id: string }[] }
) => {
  return ResolvedActionDocument.parse(
    [
      ...ActionDocumentKeyResolveMap.location.map((loc) => ({
        type: 'location' as const,
        key: loc
      })),
      ...ActionDocumentKeyResolveMap.user.map((usr) => ({
        type: 'user' as const,
        key: usr
      }))
    ].reduce((actionWithValues, mapping) => {
      const value = _.get(action, mapping.key)

      if (!_.isNil(value)) {
        return {
          ...actionWithValues,
          [mapping.key]:
            resolvedRefs[mapping.type].find((ref) => ref.id === value) ?? null
        }
      }

      return actionWithValues
    }, action)
  )
}
