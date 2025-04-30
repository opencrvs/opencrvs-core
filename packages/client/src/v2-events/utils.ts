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

import { uniq, isString, get } from 'lodash'
import { ResolvedUser, ActionDocument } from '@opencrvs/commons/client'

/**
 *
 * Joins defined values using a separator and trims the result
 */
export function joinValues(
  values: Array<string | undefined | null>,
  separator = ' '
) {
  return values
    .filter((value) => !!value)
    .join(separator)
    .trim()
}

export function getUsersFullName(
  names: ResolvedUser['name'],
  language: string
) {
  const match = names.find((name) => name.use === language) ?? names[0]

  return joinValues([...match.given, match.family])
}

/** Utility to get all keys from union */
type AllKeys<T> = T extends T ? keyof T : never

/**
 * @returns unique ids of users are referenced in the ActionDocument array.
 * Used for fetching user data in bulk.
 */
export const getUserIdsFromActions = (actions: ActionDocument[]) => {
  const userIdFields = [
    'createdBy',
    'assignedTo'
  ] satisfies AllKeys<ActionDocument>[]

  const userIds = actions.flatMap((action) =>
    userIdFields.map((fieldName) => get(action, fieldName)).filter(isString)
  )

  return uniq(userIds)
}
