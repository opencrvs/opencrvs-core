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

import {
  ActionDocument,
  ResolvedActionDocument,
  ResolvedLocation,
  ResolvedUser
} from '@opencrvs/commons'
import * as _ from 'lodash'

/** Utility to get all keys from union */
type AllKeys<T> = T extends T ? keyof T : never

const ActionDocumentKeyResolveMap = {
  user: ['createdBy', 'assignedTo'] satisfies AllKeys<ActionDocument>[],
  location: ['createdAtLocation'] satisfies AllKeys<ActionDocument>[]
} as const

/**
 * @returns unique ids of users and locations that are referenced in the ActionDocument array
 */
export const getReferenceIds = (actions: ActionDocument[]) => {
  return Object.fromEntries(
    Object.entries(ActionDocumentKeyResolveMap).map(([category, keys]) => [
      category as keyof typeof ActionDocumentKeyResolveMap, // .entries loses the type of the key
      Array.from(
        new Set(
          actions.flatMap((action) =>
            keys.map((key) => _.get(action, key)).filter(Boolean)
          )
        )
      ).filter(_.isString)
    ])
  )
}
/**
 *
 * @param action ActionDocument from Event which ids were resolved
 * @param resolvedRefsByType resolved user and locations
 * @returns ResolvedActionDocument with resolved user and locations
 */
export const replaceReferenceIdWithValue = (
  action: ActionDocument,
  resolvedRefsByType: {
    user: ResolvedUser[]
    location: ResolvedLocation[]
  }
) => {
  const keysToResolveWithType = [
    ...ActionDocumentKeyResolveMap.location.map((loc) => ({
      type: 'location' as const,
      key: loc
    })),
    ...ActionDocumentKeyResolveMap.user.map((usr) => ({
      type: 'user' as const,
      key: usr
    }))
  ]

  return ResolvedActionDocument.parse(
    keysToResolveWithType.reduce((actionToResolve, mapping) => {
      const fieldReferenceId = _.get(action, mapping.key)

      if (_.isNil(fieldReferenceId)) {
        return actionToResolve
      }
      // @TODO: Update typescript to 5.xx in a separate PR
      const value =
        // @ts-ignore
        resolvedRefsByType[mapping.type].find(
          (ref: ResolvedUser | ResolvedLocation) => ref.id === fieldReferenceId
        ) ?? null

      return {
        ...actionToResolve,
        [mapping.key]: value
      }
    }, action)
  )
}
