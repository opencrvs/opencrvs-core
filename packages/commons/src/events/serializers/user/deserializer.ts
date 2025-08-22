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

import { QueryExpression, QueryType, User } from '../../../events'
import {
  CountryConfigQueryType,
  SerializedQueryExpression
} from '../../../events/CountryConfigQueryInput'
import { SerializedUserField } from './serializer'

/**
 * Deserializes a user field from a serialized representation or a string.
 *
 * If the input is a string, it returns the string directly.
 * If the input is an object with a `$userField` property of `'id'` or `'primaryOfficeId'`,
 * it returns the corresponding property from the provided user object.
 * For any other case, it returns `'ToDo'`.
 *
 * @param serializedUserField - Can be an actual string value or an serialized object: {$userField: field}
 * @param user - The user object containing user properties, such as `id` and `primaryOfficeId`.
 * @returns The deserialized user field as a string.
 *
 * @example
 * {
 *   "serializedUserField": { "$userField": "id" },
 *   "user": { "id": "123", "primaryOfficeId": "456" }
 * }
 * // Returns: "123"
 * @example
 * {
 *   "serializedUserField": "John Doe",
 *   "user": { "id": "123", "primaryOfficeId": "456" }
 * }
 * // Returns: "John Doe"
 */
function userDeserializer(
  serializedUserField: SerializedUserField | string,
  user: User
): string {
  if (typeof serializedUserField === 'string') {
    return serializedUserField
  }
  if (
    serializedUserField.$userField === 'name' ||
    serializedUserField.$userField === 'signature' ||
    serializedUserField.$userField === 'avatar'
  ) {
    throw new Error(
      `Deserializer for ${serializedUserField.$userField} is not implemented yet`
    )
  }
  return user[serializedUserField.$userField]
}

function deserializeQueryExpression(
  expression: SerializedQueryExpression,
  user: User
): QueryExpression {
  return {
    ...expression,
    assignedTo: expression.assignedTo && {
      ...expression.assignedTo,
      term: userDeserializer(expression.assignedTo.term, user)
    },
    createdByUserType: expression.createdByUserType,
    createdBy: expression.createdBy && {
      ...expression.createdBy,
      term: userDeserializer(expression.createdBy.term, user)
    },
    updatedBy: expression.updatedBy && {
      ...expression.updatedBy,
      term: userDeserializer(expression.updatedBy.term, user)
    },
    createdAtLocation:
      expression.createdAtLocation &&
      (expression.createdAtLocation.type === 'within'
        ? {
            ...expression.createdAtLocation,
            location: userDeserializer(
              expression.createdAtLocation.location,
              user
            )
          }
        : {
            ...expression.createdAtLocation,
            term: userDeserializer(expression.createdAtLocation.term, user)
          }),
    updatedAtLocation:
      expression.updatedAtLocation &&
      (expression.updatedAtLocation.type === 'within'
        ? {
            ...expression.updatedAtLocation,
            location: userDeserializer(
              expression.updatedAtLocation.location,
              user
            )
          }
        : {
            ...expression.updatedAtLocation,
            term: userDeserializer(expression.updatedAtLocation.term, user)
          })
  }
}

export function deserializeQuery(
  query: CountryConfigQueryType,
  user: User
): QueryType {
  return {
    ...query,
    clauses: query.clauses.map(
      (clause) => deserializeQueryExpression(clause, user)
      // SAFETY: This cast should be safe because `query.clauses` has already been validated as non-empty by the Zod schema.
      // Without the cast, TypeScript cannot infer the tuple type required by the target interface.
    ) as [QueryExpression, ...QueryExpression[]]
  }
}
