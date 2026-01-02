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

import { QueryExpression, QueryType } from '../../../events'
import { User } from '../../../users/User'
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
): string | undefined {
  if (typeof serializedUserField === 'string') {
    return serializedUserField
  }
  if (typeof serializedUserField !== 'object') {
    return undefined
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
  return user[serializedUserField.$userField] ?? undefined
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}
function deserializeQueryExpression(
  expression: SerializedQueryExpression,
  user: User
): QueryExpression {
  const assignedTo = expression.assignedTo
    ? userDeserializer(expression.assignedTo.term, user)
    : undefined

  const createdBy = expression.createdBy
    ? userDeserializer(expression.createdBy.term, user)
    : undefined

  const updatedBy = expression.updatedBy
    ? userDeserializer(expression.updatedBy.term, user)
    : undefined

  const createdAtLocation = expression.createdAtLocation
    ? userDeserializer(expression.createdAtLocation.location, user)
    : undefined

  const updatedAtLocation = expression.updatedAtLocation
    ? userDeserializer(expression.updatedAtLocation.location, user)
    : undefined

  const declaredLocation = expression[
    'legalStatuses.DECLARED.createdAtLocation'
  ]
    ? userDeserializer(
        expression['legalStatuses.DECLARED.createdAtLocation'].location,
        user
      )
    : undefined

  const registeredLocation = expression[
    'legalStatuses.REGISTERED.createdAtLocation'
  ]
    ? userDeserializer(
        expression['legalStatuses.REGISTERED.createdAtLocation'].location,
        user
      )
    : undefined

  return {
    ...expression,

    assignedTo:
      expression.assignedTo && isDefined(assignedTo)
        ? { ...expression.assignedTo, term: assignedTo }
        : undefined,

    createdBy:
      expression.createdBy && isDefined(createdBy)
        ? { ...expression.createdBy, term: createdBy }
        : undefined,

    updatedBy:
      expression.updatedBy && isDefined(updatedBy)
        ? { ...expression.updatedBy, term: updatedBy }
        : undefined,

    createdAtLocation:
      expression.createdAtLocation && isDefined(createdAtLocation)
        ? { ...expression.createdAtLocation, location: createdAtLocation }
        : undefined,

    updatedAtLocation:
      expression.updatedAtLocation && isDefined(updatedAtLocation)
        ? { ...expression.updatedAtLocation, location: updatedAtLocation }
        : undefined,

    ['legalStatuses.DECLARED.createdAtLocation']:
      expression['legalStatuses.DECLARED.createdAtLocation'] &&
      isDefined(declaredLocation)
        ? {
            ...expression['legalStatuses.DECLARED.createdAtLocation'],
            location: declaredLocation
          }
        : undefined,

    ['legalStatuses.REGISTERED.createdAtLocation']:
      expression['legalStatuses.REGISTERED.createdAtLocation'] &&
      isDefined(registeredLocation)
        ? {
            ...expression['legalStatuses.REGISTERED.createdAtLocation'],
            location: registeredLocation
          }
        : undefined
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
