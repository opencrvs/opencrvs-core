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

import { Exact, QueryExpression, QueryType, Within } from '../../../events'
import {
  CountryConfigQueryType,
  SerializableExact,
  SerializableWithin,
  SerializedQueryExpression
} from '../../../events/CountryConfigQueryInput'
import { User } from '../../../users/User'
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
    serializedUserField.$userField === 'fullHonorificName' ||
    serializedUserField.$userField === 'device' ||
    serializedUserField.$userField === 'firstname' ||
    serializedUserField.$userField === 'middlename' ||
    serializedUserField.$userField === 'surname'
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

function serializeLocationField<
  T extends SerializableWithin | SerializableExact
>(expression: T, user: User) {
  if (expression.type === 'exact') {
    return userDeserializer(expression.term, user)
  }
  if (expression.type === 'within') {
    return userDeserializer(expression.location, user)
  }
  return undefined
}

function deserializeExpression<
  T extends SerializableWithin | SerializableExact
>(expression: T, user: User) {
  if (expression.type === 'exact') {
    const term = userDeserializer(expression.term, user)
    if (!term) {
      return undefined
    }
    return {
      ...expression,
      term
    } satisfies Exact
  }
  if (expression.type === 'within') {
    const location = userDeserializer(expression.location, user)
    if (!location) {
      return undefined
    }
    return {
      ...expression,
      location
    } satisfies Within
  }
  return undefined
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
    ? serializeLocationField(expression.createdAtLocation, user)
    : undefined

  const updatedAtLocation = expression.updatedAtLocation
    ? serializeLocationField(expression.updatedAtLocation, user)
    : undefined

  const updatedByUserRole = expression.updatedByUserRole? userDeserializer(expression.updatedByUserRole.term, user) : undefined

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

    updatedByUserRole: expression.updatedByUserRole && isDefined(updatedByUserRole)? {
      ...expression.updatedByUserRole,
      term: updatedByUserRole
    } : undefined,  
    createdAtLocation:
      expression.createdAtLocation && isDefined(createdAtLocation)
        ? deserializeExpression(expression.createdAtLocation, user)
        : undefined,

    updatedAtLocation:
      expression.updatedAtLocation && isDefined(updatedAtLocation)
        ? deserializeExpression(expression.updatedAtLocation, user)
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
